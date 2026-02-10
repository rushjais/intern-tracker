import { generateText, Output } from "ai";
import { createClient } from "@/lib/supabase/server";
import * as z from "zod";

// Construct model string dynamically to prevent autofix from adding provider imports
const PROVIDER = "anthropic";
const MODEL_NAME = "claude-sonnet-4-20250514";
const AI_MODEL = `${PROVIDER}/${MODEL_NAME}`;

const connectionSchema = z.object({
  connections: z.array(
    z.object({
      name: z.string(),
      role_at_company: z.string().nullable(),
      connection_type: z.string().nullable(),
      confidence: z.string().nullable(),
      suggested_action: z.string().nullable(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    let body: { company: string; role: string; applicationId?: string };
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { company, role, applicationId } = body;

    if (!company || !role) {
      return Response.json(
        { error: "Company and role are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check for existing connections for this company
    const { data: existing } = await supabase
      .from("connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("company", company);

    if (existing && existing.length > 0) {
      return Response.json({ connections: existing, cached: true });
    }

    // Get user profile for school context
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const schoolName = profile?.school || null;
    const shortSchoolName = schoolName
      ? schoolName.replace(/^(The )?University of /i, "").replace(/ University$/i, "").replace(/ College$/i, "").split(" ").map((w: string) => w[0]).join("")
      : null;
    const gradYear = profile?.graduation_year || null;
    const major = profile?.major || null;

    const schoolContext = schoolName
      ? `The user attends ${schoolName}${major ? `, majoring in ${major}` : ""}${gradYear ? `, Class of ${gradYear}` : ""}. Their school's short name/abbreviation is likely "${shortSchoolName}".`
      : "No school information available.";

    // AI call to suggest connections
    let aiConnections: z.infer<typeof connectionSchema> | null = null;
    const warnings: string[] = [];

    try {
      const result = await generateText({
        model: AI_MODEL,
        output: Output.object({ schema: connectionSchema }),
        prompt: `You are a career networking advisor for a college student looking for internship connections.

${schoolContext}

The student is applying to ${company} for a "${role}" position.

Suggest 4-5 realistic types of people they should try to connect with at or related to ${company}.

CRITICAL RULES:
${schoolName ? `- The FIRST 2 connections MUST be alumni from ${schoolName} who likely work at ${company}. These are the highest priority.
- For alumni connections:
  - Set connection_type to "Alumni"
  - Set confidence to "High"
  - In role_at_company, include "${schoolName} alumnus/alumna" along with their likely title (e.g., "${schoolName} alumnus — Software Engineer at ${company}")
  - In suggested_action, reference the specific school name and suggest searching "${schoolName} ${company}" on LinkedIn, or checking the ${shortSchoolName || schoolName} alumni network/directory
  - Mention likely graduation year ranges (e.g., "${shortSchoolName || schoolName} '${gradYear ? String(gradYear - 3).slice(-2) : "20"}-'${gradYear ? String(gradYear - 1).slice(-2) : "24"} alumni likely working here")
  - Make tips specific: "Search '${schoolName} ${company}' on LinkedIn" or "Check ${shortSchoolName || schoolName} alumni directory for ${company} employees"
` : "- If no school info is available, still include 1 generic alumni-type connection with tips on using university career services."}
- After alumni, include 1 recruiter, 1 team member, and optionally 1 hiring manager or mentor
- Alumni connections MUST appear first in the list

For each person, provide:
- name: A realistic but clearly fictional name (e.g., "Sarah Chen" or "Marcus Johnson")
- role_at_company: Their likely title at ${company}. For alumni, prefix with "${schoolName || "University"} alumnus/alumna —"
- connection_type: One of "Alumni", "Recruiter", "Team Member", "Hiring Manager", "Mentor"
- confidence: One of "High", "Medium", "Low"
- suggested_action: A specific, actionable networking tip. For alumni, ALWAYS mention the school by name and suggest specific search queries.

Priority order (MUST follow this):
1. Alumni from ${schoolName || "the student's school"} at ${company} (2 connections, HIGH confidence)
2. University recruiter or campus ambassador at ${company} (1 connection)
3. Engineer/designer on the ${role} team (1 connection)
4. Hiring manager or industry mentor (1 connection, optional)`,
      });

      aiConnections = result.output;
    } catch (err) {
      console.error("[v0] AI connections error:", err);
      warnings.push("AI suggestions unavailable — showing default templates");

      // Fallback connections — alumni first
      const alumniTip = schoolName
        ? `Search "${schoolName} ${company}" on LinkedIn or check the ${shortSchoolName || schoolName} alumni directory for employees at ${company}.`
        : `Check your school's alumni network for anyone working at ${company}.`;
      const alumniRole = schoolName
        ? `${schoolName} alumnus/alumna — Employee at ${company}`
        : `Alumni Contact at ${company}`;

      aiConnections = {
        connections: [
          {
            name: "Alumni Connection 1",
            role_at_company: alumniRole,
            connection_type: "Alumni",
            confidence: "High",
            suggested_action: alumniTip,
          },
          {
            name: "Alumni Connection 2",
            role_at_company: schoolName
              ? `${schoolName} alumnus/alumna — ${role} team at ${company}`
              : `Alumni on ${role} team at ${company}`,
            connection_type: "Alumni",
            confidence: "High",
            suggested_action: schoolName
              ? `Search LinkedIn for "${shortSchoolName || schoolName}" people at ${company} in engineering or the ${role} department.`
              : `Use your university career center to find alumni at ${company}.`,
          },
          {
            name: "University Recruiter",
            role_at_company: `Campus Recruiter at ${company}`,
            connection_type: "Recruiter",
            confidence: "Medium",
            suggested_action: `Search LinkedIn for "${company} university recruiter" and send a personalized connection request.`,
          },
          {
            name: "Team Engineer",
            role_at_company: `Software Engineer at ${company}`,
            connection_type: "Team Member",
            confidence: "Medium",
            suggested_action: `Find engineers on the ${role} team via LinkedIn and ask about their experience.`,
          },
        ],
      };
    }

    // Save connections to database
    if (aiConnections?.connections) {
      const rows = aiConnections.connections.map((c) => ({
        user_id: user.id,
        application_id: applicationId || null,
        company,
        name: c.name,
        role_at_company: c.role_at_company,
        connection_type: c.connection_type,
        confidence: c.confidence,
        suggested_action: c.suggested_action,
        status: "suggested",
      }));

      const { data: savedRows, error: saveError } = await supabase
        .from("connections")
        .insert(rows)
        .select();

      if (saveError) {
        console.error("[v0] Save connections error:", saveError);
        warnings.push("Could not save connections to database");
        return Response.json({
          connections: aiConnections.connections.map((c, i) => ({
            id: `temp-${i}`,
            ...c,
            status: "suggested",
            company,
          })),
          warnings,
        });
      }

      return Response.json({
        connections: savedRows,
        warnings: warnings.length > 0 ? warnings : undefined,
      });
    }

    return Response.json({ connections: [], warnings });
  } catch (err) {
    console.error("[v0] Connections route error:", err);
    return Response.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
