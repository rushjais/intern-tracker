export type ApplicationStatus =
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

export type ApplicationPriority = "High" | "Medium" | "Low";

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  date_applied: string;
  deadline: string | null;
  priority: ApplicationPriority;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const STATUS_OPTIONS: ApplicationStatus[] = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

export const PRIORITY_OPTIONS: ApplicationPriority[] = [
  "High",
  "Medium",
  "Low",
];

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Interview: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Offer: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Rejected: "bg-red-500/15 text-red-400 border-red-500/25",
  Withdrawn: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
};

export const PRIORITY_COLORS: Record<ApplicationPriority, string> = {
  High: "bg-red-500/15 text-red-400 border-red-500/25",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
};

export interface CompanyResearch {
  id: string;
  user_id: string;
  company: string;
  description: string | null;
  funding_stage: string | null;
  funding_amount: string | null;
  company_size: string | null;
  tech_stack: string[] | null;
  recent_news: string[] | null;
  culture_notes: string | null;
  fit_score: number | null;
  fit_recommendation: string | null;
  fit_strengths: string[] | null;
  fit_gaps: string[] | null;
  role_analyzed: string | null;
  researched_at: string;
  created_at: string;
}

export interface EmailImport {
  id: string;
  user_id: string;
  email_subject: string | null;
  email_body: string | null;
  parsed_company: string | null;
  parsed_status: string | null;
  parsed_interview_date: string | null;
  parsed_deadline: string | null;
  parsed_details: string | null;
  matched_application_id: string | null;
  status: string;
  created_at: string;
}
