import { generateText, Output } from "ai";
import { createClient } from "@/lib/supabase/server";
import * as z from "zod";

// Construct model string dynamically to prevent autofix
const PROVIDER = "anthropic";
const MODEL_NAME = "claude-sonnet-4-20250514";
const MODEL = `${PROVIDER}/${MODEL_NAME}`;

const emailParseSchema = z.object({
  company: z.string().nullable(),
  status: z.string().nullable(),
  role: z.string().nullable(),
  interview_date: z.string().nullable(),
  deadline: z.string().nullable(),
  details: z.string().nullable(),
  confidence: z.number().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.emailText) {
      return Response.json(
        { error: "Missing emailText field" },
        { status: 400 }
      );
    }

    const { emailText, emailSubject } = body;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse email with AI
    let parsed = {
      company: null as string | null,
      status: null as string | null,
      role: null as string | null,
      interview_date: null as string | null,
      deadline: null as string | null,
      details: null as string | null,
      confidence: null as number | null,
    };

    try {
      const result = await generateText({
        model: MODEL,
        output: Output.object({ schema: emailParseSchema }),
        prompt: `You are an expert at parsing job/internship application emails. Analyze the following email and extract structured data.

Email Subject: ${emailSubject || "N/A"}

Email Body:
${emailText}

Extract:
- company: The company name
- status: One of "Applied", "Interview", "Offer", "Rejected", "Withdrawn" based on the email content
- role: The job/internship title if mentioned
- interview_date: If an interview is scheduled, the date in YYYY-MM-DD format
- deadline: If there's a deadline mentioned, the date in YYYY-MM-DD format
- details: A brief 1-2 sentence summary of the key information in this email
- confidence: How confident you are in the parsing from 0-100

If you cannot determine a field, return null for it.`,
      });

      if (result.object) {
        parsed = result.object;
      }
    } catch (aiError) {
      console.error("[v0] AI parsing failed:", aiError);
      // Continue with nulls - we'll still save the raw email
    }

    // Try to match to an existing application - improved matching
    let matchedAppId: string | null = null;
    let matchScore = 0;
    if (parsed.company) {
      const { data: matchedApps } = await supabase
        .from("applications")
        .select("id, company, role")
        .eq("user_id", user.id);

      if (matchedApps && matchedApps.length > 0) {
        // Find best match using fuzzy matching
        let bestMatch = null;
        let bestScore = 0;
        
        for (const app of matchedApps) {
          const companyLower = app.company.toLowerCase().trim();
          const parsedCompanyLower = parsed.company.toLowerCase().trim();
          
          // Exact match
          if (companyLower === parsedCompanyLower) {
            bestMatch = app;
            bestScore = 100;
            break;
          }
          
          // Contains match
          if (companyLower.includes(parsedCompanyLower) || parsedCompanyLower.includes(companyLower)) {
            if (!bestMatch || 80 > bestScore) {
              bestMatch = app;
              bestScore = 80;
            }
          }
          
          // Role match bonus
          if (parsed.role && app.role &&
              app.role.toLowerCase().trim().includes(parsed.role.toLowerCase().trim())) {
            if (bestMatch === app && bestScore < 95) {
              bestScore = 95;
            }
          }
        }
        
        if (bestMatch && bestScore >= 60) {
          matchedAppId = bestMatch.id;
          matchScore = bestScore;
        }
      }
    }

    // Save to email_imports table
    const { data: emailImport, error: insertError } = await supabase
      .from("email_imports")
      .insert({
        user_id: user.id,
        email_subject: emailSubject || null,
        email_body: emailText,
        parsed_company: parsed.company,
        parsed_status: parsed.status,
        parsed_interview_date: parsed.interview_date,
        parsed_deadline: parsed.deadline,
        parsed_details: parsed.details,
        matched_application_id: matchedAppId,
        status: "parsed",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[v0] Failed to save email import:", insertError);
      return Response.json(
        {
          parsed,
          matchedAppId,
          saved: false,
          warning: "Parsed successfully but failed to save to database",
        },
        { status: 200 }
      );
    }

    // Auto-update matched application if confidence >= 60% (lowered from 75%)
    let autoUpdated = false;
    let updatedFields: string[] = [];
    let updateReason = "";
    const matchedCompanyName = matchedAppId ? (
      await supabase.from("applications").select("company").eq("id", matchedAppId).single()
    ).data?.company : null;

    if (
      matchedAppId &&
      parsed.status &&
      parsed.confidence &&
      parsed.confidence >= 60 // Lowered threshold for better auto-updates
    ) {
      const updatePayload: Record<string, string> = {
        status: parsed.status,
        updated_at: new Date().toISOString(),
      };
      updatedFields.push(`status to "${parsed.status}"`);
      updateReason = `High confidence (${parsed.confidence}%) and good match (${matchScore}%)`;

      // Append email summary to notes
      if (parsed.details) {
        const { data: currentApp } = await supabase
          .from("applications")
          .select("notes")
          .eq("id", matchedAppId)
          .single();

        const timestamp = new Date().toLocaleDateString();
        const newNote = `[${timestamp} - Email Import] ${parsed.details}`;
        updatePayload.notes = currentApp?.notes
          ? `${currentApp.notes}\n\n${newNote}`
          : newNote;
        updatedFields.push("notes");
      }

      // Set deadline if detected
      if (parsed.deadline) {
        updatePayload.deadline = parsed.deadline;
        updatedFields.push("deadline");
      }

      const { error: updateError } = await supabase
        .from("applications")
        .update(updatePayload)
        .eq("id", matchedAppId);

      if (!updateError) {
        autoUpdated = true;
      }
    } else if (!autoUpdated && matchedAppId) {
      // Explain why it didn't auto-update
      if (!parsed.confidence || parsed.confidence < 60) {
        updateReason = `Low confidence (${parsed.confidence || 0}%) - review manually`;
      } else if (!parsed.status) {
        updateReason = "No status detected in email";
      }
    } else if (!matchedAppId && parsed.company) {
      updateReason = "No matching application found - create one manually";
    }

    return Response.json({
      parsed,
      matchedAppId,
      matchedCompanyName,
      matchScore,
      autoUpdated,
      updatedFields,
      updateReason,
      emailImport,
      saved: true,
    });
  } catch (err) {
    console.error("[v0] Email parse error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to parse email" },
      { status: 500 }
    );
  }
}