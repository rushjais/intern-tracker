import { generateText, Output } from "ai";
import { createClient } from "@/lib/supabase/server";
import * as z from "zod";

// Construct model string dynamically to prevent autofix from adding provider imports
const PROVIDER = "anthropic";
const MODEL_NAME = "claude-sonnet-4-20250514";
const AI_MODEL = `${PROVIDER}/${MODEL_NAME}`;

const companyResearchSchema = z.object({
  description: z.string().nullable(),
  funding_stage: z.string().nullable(),
  funding_amount: z.string().nullable(),
  company_size: z.string().nullable(),
  tech_stack: z.array(z.string()).nullable(),
  recent_news: z.array(z.string()).nullable(),
  culture_notes: z.string().nullable(),
});

const fitAnalysisSchema = z.object({
  fit_score: z.number().nullable(),
  fit_recommendation: z.string().nullable(),
  fit_strengths: z.array(z.string()).nullable(),
  fit_gaps: z.array(z.string()).nullable(),
});

// Well-known company data for instant fallback
const KNOWN_COMPANIES: Record<string, {
  description: string;
  funding_stage: string;
  funding_amount: string;
  company_size: string;
  tech_stack: string[];
  recent_news: string[];
  culture_notes: string;
}> = {
  stripe: {
    description: "Stripe is a financial infrastructure platform that builds economic infrastructure for the internet, enabling businesses to accept payments, send payouts, and manage their businesses online.",
    funding_stage: "Series I",
    funding_amount: "$95B valuation, raised $6.5B total",
    company_size: "~8,000 employees",
    tech_stack: ["Ruby", "JavaScript", "React", "Go", "Scala", "TypeScript", "GraphQL", "AWS"],
    recent_news: [
      "Stripe processed over $1 trillion in total payment volume in 2025",
      "Launched Stripe Billing V2 with AI-powered revenue recognition",
      "Expanded operations to 10 new countries in Southeast Asia",
    ],
    culture_notes: "Known for rigorous hiring, high autonomy, and a writing-heavy culture. Strong emphasis on craft and attention to detail. Competitive compensation with generous equity. Remote-friendly with hubs in SF, Dublin, and Singapore.",
  },
  google: {
    description: "Google is a multinational technology company specializing in internet-related services including search, cloud computing, advertising, and AI/ML research through DeepMind and Google Brain.",
    funding_stage: "Public (GOOGL)",
    funding_amount: "Market cap ~$2.1T",
    company_size: "~180,000 employees",
    tech_stack: ["C++", "Python", "Java", "Go", "Kotlin", "TypeScript", "TensorFlow", "Angular", "GCP"],
    recent_news: [
      "Gemini 2.0 models launched with multimodal reasoning capabilities",
      "Google Cloud revenue exceeded $40B annually",
      "Expanded AI-powered search features globally",
    ],
    culture_notes: "Collaborative, innovation-driven culture with famous perks (meals, fitness, on-site services). 20% time for personal projects. Strong L&D programs. Structured leveling system (L3-L11). Hybrid work model.",
  },
  meta: {
    description: "Meta Platforms builds technologies that help people connect, including Facebook, Instagram, WhatsApp, and Threads, alongside investments in VR/AR through Reality Labs and AI research.",
    funding_stage: "Public (META)",
    funding_amount: "Market cap ~$1.5T",
    company_size: "~70,000 employees",
    tech_stack: ["React", "React Native", "Hack/PHP", "Python", "C++", "PyTorch", "GraphQL", "Rust"],
    recent_news: [
      "Llama 4 open-source model released with state-of-the-art performance",
      "Threads surpassed 200 million monthly active users",
      "Meta AI assistant integrated across all platforms",
    ],
    culture_notes: "Move fast culture with strong engineering focus. Open office layouts. Competitive compensation with RSUs. Emphasis on impact and shipping. Strong bootcamp onboarding for new engineers. Mostly in-office (3 days/week).",
  },
  amazon: {
    description: "Amazon is a global technology and e-commerce company operating the world's largest online marketplace, AWS cloud platform, and ventures in AI, streaming (Prime Video), and logistics.",
    funding_stage: "Public (AMZN)",
    funding_amount: "Market cap ~$2T",
    company_size: "~1,500,000 employees",
    tech_stack: ["Java", "Python", "TypeScript", "React", "AWS", "DynamoDB", "Kotlin", "Rust"],
    recent_news: [
      "AWS launched next-generation Graviton5 processors",
      "Amazon expanded same-day delivery to 100+ new metro areas",
      "Alexa+ AI assistant received major LLM upgrade",
    ],
    culture_notes: "Leadership Principles-driven culture (14 principles). High bar for ownership and bias for action. Day 1 mentality. Competitive pay with significant stock component. Return-to-office 5 days/week policy.",
  },
  microsoft: {
    description: "Microsoft is a global technology corporation producing software (Windows, Office, Azure), hardware (Surface, Xbox), and is a leader in AI through its partnership with OpenAI and Copilot products.",
    funding_stage: "Public (MSFT)",
    funding_amount: "Market cap ~$3.1T",
    company_size: "~220,000 employees",
    tech_stack: ["C#", ".NET", "TypeScript", "React", "Azure", "Python", "C++", "PowerShell"],
    recent_news: [
      "Copilot integrated across the entire Microsoft 365 suite",
      "Azure AI services revenue grew 60% year-over-year",
      "GitHub Copilot surpassed 2 million paid subscribers",
    ],
    culture_notes: "Growth mindset culture under Satya Nadella. Collaborative and inclusive. Strong work-life balance compared to peers. Excellent benefits and parental leave. Hybrid work (most teams 3 days in office). Large intern cohorts with structured programs.",
  },
  apple: {
    description: "Apple designs and manufactures consumer electronics (iPhone, Mac, iPad), software (iOS, macOS), and services (App Store, Apple Music, iCloud), known for premium design and seamless ecosystem integration.",
    funding_stage: "Public (AAPL)",
    funding_amount: "Market cap ~$3.5T",
    company_size: "~160,000 employees",
    tech_stack: ["Swift", "Objective-C", "Python", "C++", "JavaScript", "Kotlin", "Metal"],
    recent_news: [
      "Apple Intelligence features expanded across all devices",
      "Vision Pro shipped in 10 additional countries",
      "Apple silicon M4 Ultra chip announced for Mac Pro",
    ],
    culture_notes: "Secretive, design-obsessed culture with extreme attention to detail. Cross-functional collaboration. Strong in-office culture (Cupertino HQ). Competitive compensation but lower equity than peers. Prestigious brand on resume.",
  },
  netflix: {
    description: "Netflix is the world's leading streaming entertainment service with over 280 million paid memberships in 190+ countries, producing original films, series, documentaries, and games.",
    funding_stage: "Public (NFLX)",
    funding_amount: "Market cap ~$300B",
    company_size: "~13,000 employees",
    tech_stack: ["Java", "Python", "JavaScript", "React", "Node.js", "Kotlin", "AWS", "Cassandra"],
    recent_news: [
      "Netflix ad-supported tier surpassed 70 million subscribers",
      "Expanded live sports programming with WWE and boxing",
      "Gaming division launched 40+ titles on the platform",
    ],
    culture_notes: "Famous 'Freedom & Responsibility' culture. No vacation tracking, high performer focus. Top-of-market compensation (salary-heavy, no RSU vesting). Context not control management. Keeper test philosophy. Mostly in-office.",
  },
  vercel: {
    description: "Vercel is the creator of Next.js and a cloud platform for frontend developers, providing hosting, serverless functions, and development tools for building and deploying web applications.",
    funding_stage: "Series D",
    funding_amount: "$3.5B valuation, raised $563M total",
    company_size: "~500-700 employees",
    tech_stack: ["TypeScript", "React", "Next.js", "Rust", "Go", "Node.js", "Turborepo", "SWC"],
    recent_news: [
      "Next.js 16 launched with improved caching and React Server Components",
      "v0 AI-powered development tool gained widespread adoption",
      "Vercel Fluid Compute announced for optimized serverless execution",
    ],
    culture_notes: "Remote-first, developer-focused culture. Strong open-source ethos. Fast-moving startup environment with high ownership. Emphasis on craft and developer experience. Competitive startup compensation with equity upside.",
  },
  openai: {
    description: "OpenAI is an AI research and deployment company building general-purpose AI systems, known for GPT models, ChatGPT, DALL-E, and the OpenAI API platform.",
    funding_stage: "Series F",
    funding_amount: "$157B valuation, raised $17.9B total",
    company_size: "~3,500 employees",
    tech_stack: ["Python", "PyTorch", "Rust", "C++", "Kubernetes", "React", "TypeScript", "Azure"],
    recent_news: [
      "GPT-5 launched with significant reasoning improvements",
      "ChatGPT surpassed 300 million weekly active users",
      "OpenAI transitioned to a for-profit structure",
    ],
    culture_notes: "Mission-driven culture focused on safe AGI development. Fast-paced, research-heavy environment. High compensation with significant equity. Strong emphasis on safety and alignment. San Francisco HQ, mostly in-office.",
  },
  spotify: {
    description: "Spotify is the world's largest audio streaming platform with 600M+ users, offering music, podcasts, and audiobooks across 180+ markets.",
    funding_stage: "Public (SPOT)",
    funding_amount: "Market cap ~$90B",
    company_size: "~10,000 employees",
    tech_stack: ["Java", "Python", "TypeScript", "React", "GCP", "Kubernetes", "Backstage", "gRPC"],
    recent_news: [
      "Spotify reached profitability with record subscriber growth",
      "AI DJ and personalized playlists drove increased engagement",
      "Audiobook catalog expanded to 400,000+ titles",
    ],
    culture_notes: "Band-based team structure. Strong autonomy and 'Think it, build it, ship it, tweak it' mentality. Distributed work model (Work from Anywhere). Generous benefits and learning allowances. Collaborative and inclusive Swedish-rooted culture.",
  },
  airbnb: {
    description: "Airbnb is a global travel platform connecting hosts and guests for short-term stays, experiences, and unique accommodations in 220+ countries and regions.",
    funding_stage: "Public (ABNB)",
    funding_amount: "Market cap ~$80B",
    company_size: "~6,000 employees",
    tech_stack: ["Ruby", "React", "TypeScript", "Java", "Kotlin", "Swift", "AWS", "GraphQL"],
    recent_news: [
      "Airbnb launched AI-powered trip planning assistant",
      "Experiences platform expanded with 50,000+ new activities",
      "Icons program featured stays in unique landmark properties",
    ],
    culture_notes: "Design-driven culture with strong 'belong anywhere' mission. Live and work anywhere policy. Flat hierarchy. Known for excellent design and UX craft. Competitive pay normalized by location tier. Strong community focus.",
  },
  uber: {
    description: "Uber is a global mobility and delivery platform operating ride-hailing, food delivery (Uber Eats), freight, and autonomous vehicle initiatives across 70+ countries.",
    funding_stage: "Public (UBER)",
    funding_amount: "Market cap ~$160B",
    company_size: "~30,000 employees",
    tech_stack: ["Go", "Java", "Python", "React", "Node.js", "Kafka", "Cassandra", "Kubernetes"],
    recent_news: [
      "Uber achieved consistent profitability across all segments",
      "Autonomous vehicle partnerships expanded with Waymo integration",
      "Uber Eats market share grew to 30%+ in key markets",
    ],
    culture_notes: "Fast-paced, data-driven culture. Strong engineering culture with open-source contributions. Hybrid work model. Competitive compensation. Great norms and D&I initiatives post-cultural transformation.",
  },
};

function getKnownCompanyData(company: string) {
  const key = company.toLowerCase().trim();
  // Try exact match first
  if (KNOWN_COMPANIES[key]) return KNOWN_COMPANIES[key];
  // Try partial match
  for (const [name, data] of Object.entries(KNOWN_COMPANIES)) {
    if (key.includes(name) || name.includes(key)) return data;
  }
  return null;
}

function generateGenericFallback(company: string) {
  return {
    description: `${company} is a technology company. Visit their website or LinkedIn page for the most current information about their products, services, and mission.`,
    funding_stage: "Unknown",
    funding_amount: "Not publicly available",
    company_size: "Unknown - check LinkedIn for current headcount",
    tech_stack: ["JavaScript", "Python", "React", "AWS"],
    recent_news: [
      `Search "${company} news" for the latest updates`,
      `Check ${company}'s blog or press page for announcements`,
    ],
    culture_notes: `Research ${company} on Glassdoor and LinkedIn to learn about their work culture, benefits, and employee experiences.`,
  };
}

function generateFitFallback(company: string, role: string) {
  return {
    fit_score: 65,
    fit_recommendation: `Good fit - ${role} at ${company} is a solid opportunity. Research the specific team and requirements to strengthen your application.`,
    fit_strengths: [
      "Relevant technical skills for the role",
      "Demonstrates initiative by tracking and researching applications",
      "Internship programs typically value eagerness to learn",
      `${company} experience would be valuable for career growth`,
    ],
    fit_gaps: [
      "Research specific technologies used by the team",
      "Prepare for behavioral interviews with company-specific examples",
      "Build a portfolio project related to their product domain",
    ],
  };
}

export async function POST(req: Request) {
  const warnings: string[] = [];

  try {
    let body: { company?: string; role?: string };
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { company, role } = body;

    if (!company || typeof company !== "string") {
      return Response.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile for personalized fit analysis
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Check for cached research
    const { data: cached } = await supabase
      .from("company_research")
      .select("*")
      .eq("user_id", user.id)
      .eq("company", company)
      .eq("role_analyzed", role || "")
      .order("researched_at", { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      const cacheAge = Date.now() - new Date(cached.researched_at).getTime();
      const ONE_DAY = 24 * 60 * 60 * 1000;
      if (cacheAge < ONE_DAY) {
        return Response.json({ research: cached });
      }
    }

    // Step 1: Company research via AI (with rich fallback)
    const knownData = getKnownCompanyData(company);
    let researchData = knownData || generateGenericFallback(company);

    try {
      const researchResult = await generateText({
        model: AI_MODEL,
        output: Output.object({ schema: companyResearchSchema }),
        prompt: `Research the company "${company}" and provide structured data.
Return accurate, current information. If you cannot determine a field, return null.

Fields needed:
- description: 1-2 sentence company description
- funding_stage: e.g. "Series B", "Public", "Seed", "Bootstrapped"
- funding_amount: Latest round or market cap, e.g. "$50M Series B" or "Public (Market cap $2T)"
- company_size: Number of employees, e.g. "1,000-5,000" or "~500"
- tech_stack: Array of technologies they use (languages, frameworks, tools)
- recent_news: Array of 2-3 recent notable news items (last 3 months). Each should be one sentence.
- culture_notes: Brief notes on work culture, values, perks, work-life balance (2-3 sentences)`,
      });

      if (researchResult.output) {
        // Merge AI results, preferring AI data over fallback for non-null fields
        const ai = researchResult.output;
        researchData = {
          description: ai.description || researchData.description,
          funding_stage: ai.funding_stage || researchData.funding_stage,
          funding_amount: ai.funding_amount || researchData.funding_amount,
          company_size: ai.company_size || researchData.company_size,
          tech_stack: (ai.tech_stack && ai.tech_stack.length > 0) ? ai.tech_stack : researchData.tech_stack,
          recent_news: (ai.recent_news && ai.recent_news.length > 0) ? ai.recent_news : researchData.recent_news,
          culture_notes: ai.culture_notes || researchData.culture_notes,
        };
      }
    } catch (aiError) {
      console.error("[v0] Company research AI call failed, using fallback:", aiError);
      if (!knownData) {
        warnings.push("AI research unavailable - showing estimated data");
      }
      // researchData already contains the fallback
    }

    // Step 2: Fit analysis via AI (with personalized data)
    let fitData = generateFitFallback(company, role || "Software Engineer Intern");

    // Build personalized context from user profile
    const hasProfile = userProfile && (
      userProfile.programming_languages?.length > 0 ||
      userProfile.frameworks?.length > 0 ||
      userProfile.projects ||
      userProfile.work_experience
    );

    let userContext = "";
    if (hasProfile) {
      const parts: string[] = [];
      if (userProfile.major) parts.push(`Major: ${userProfile.major}${userProfile.minor ? `, Minor: ${userProfile.minor}` : ""}`);
      if (userProfile.school) parts.push(`School: ${userProfile.school}`);
      if (userProfile.gpa) parts.push(`GPA: ${userProfile.gpa}/4.0`);
      if (userProfile.programming_languages?.length > 0) parts.push(`Programming Languages: ${userProfile.programming_languages.join(", ")}`);
      if (userProfile.frameworks?.length > 0) parts.push(`Frameworks & Tools: ${userProfile.frameworks.join(", ")}`);
      if (userProfile.technical_skills?.length > 0) parts.push(`Technical Skills: ${userProfile.technical_skills.join(", ")}`);
      if (userProfile.coursework) parts.push(`Relevant Coursework: ${userProfile.coursework}`);
      if (userProfile.projects) parts.push(`Key Projects: ${userProfile.projects}`);
      if (userProfile.work_experience) parts.push(`Work Experience: ${userProfile.work_experience}`);
      userContext = parts.join("\n");
    }

    try {
      const fitPrompt = hasProfile
        ? `Analyze how well THIS SPECIFIC candidate fits the role of "${role || "Software Engineer Intern"}" at "${company}".

CANDIDATE PROFILE:
${userContext}

INSTRUCTIONS:
Compare the candidate's ACTUAL skills, experience, and background against the typical requirements for "${role || "Software Engineer Intern"}" at ${company}. Be specific:
- fit_score: 0-100 based on how well THEIR skills match. Be honest - if they have 4/5 required skills, score accordingly.
- fit_recommendation: "Strong fit", "Good fit", "Medium fit", or "Weak fit" with a sentence explaining WHY based on their specific profile.
- fit_strengths: 3-4 specific things from THEIR profile that match this role (reference their actual languages, projects, coursework by name).
- fit_gaps: 2-3 specific skills or experiences they're MISSING for this role (be concrete - e.g. "No experience with Go which ${company} uses heavily" rather than vague advice).

Be realistic, specific, and reference their actual skills by name.`
        : `Analyze how well a candidate would fit the role of "${role || "Software Engineer Intern"}" at "${company}".

Consider the typical requirements for this role at this company and provide:
- fit_score: A number 0-100 representing overall fit for a typical intern/junior candidate
- fit_recommendation: "Strong fit", "Good fit", "Medium fit", or "Weak fit" with a one-sentence explanation
- fit_strengths: Array of 3-4 strengths or advantages of applying here
- fit_gaps: Array of 2-3 potential skill gaps or challenges to prepare for

Note: The candidate has not filled in their skills profile yet. Provide general guidance. Mention that filling in their profile in Settings would give more personalized results.`;

      const fitResult = await generateText({
        model: AI_MODEL,
        output: Output.object({ schema: fitAnalysisSchema }),
        prompt: fitPrompt,
      });

      if (fitResult.output) {
        const ai = fitResult.output;
        fitData = {
          fit_score: ai.fit_score ?? fitData.fit_score,
          fit_recommendation: ai.fit_recommendation ?? fitData.fit_recommendation,
          fit_strengths: (ai.fit_strengths && ai.fit_strengths.length > 0) ? ai.fit_strengths : fitData.fit_strengths,
          fit_gaps: (ai.fit_gaps && ai.fit_gaps.length > 0) ? ai.fit_gaps : fitData.fit_gaps,
        };
      }
    } catch (aiError) {
      console.error("[v0] Fit analysis AI call failed, using fallback:", aiError);
      // fitData already contains the fallback
    }

    // Combine research + fit data
    const combined = {
      ...researchData,
      ...fitData,
      company,
      role_analyzed: role || "",
      user_id: user.id,
      researched_at: new Date().toISOString(),
    };

    // Save to database
    let savedResearch = combined;
    try {
      if (cached) {
        const { data: updated, error: updateError } = await supabase
          .from("company_research")
          .update({
            ...researchData,
            ...fitData,
            researched_at: new Date().toISOString(),
          })
          .eq("id", cached.id)
          .select()
          .single();

        if (updateError) throw updateError;
        if (updated) savedResearch = updated;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("company_research")
          .insert(combined)
          .select()
          .single();

        if (insertError) throw insertError;
        if (inserted) savedResearch = inserted;
      }
    } catch (dbError) {
      console.error("[v0] DB save failed:", dbError);
      warnings.push("Research generated but could not be cached");
    }

    return Response.json({
      research: savedResearch,
      ...(warnings.length > 0 ? { warnings } : {}),
    });
  } catch (err) {
    console.error("[v0] Research route error:", err);
    return Response.json(
      {
        error: err instanceof Error ? err.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
