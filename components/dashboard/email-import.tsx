"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle, ArrowRight, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { ApplicationStatus } from "@/lib/types";

const STATUS_BADGE: Record<string, string> = {
  Applied: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Interview: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Offer: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Rejected: "bg-red-500/15 text-red-400 border-red-500/25",
  Withdrawn: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
};

interface ParsedResult {
  parsed: {
    company: string | null;
    status: string | null;
    role: string | null;
    interview_date: string | null;
    deadline: string | null;
    details: string | null;
    confidence: number | null;
  };
  matchedAppId: string | null;
  matchedCompanyName: string | null;
  matchScore: number;
  autoUpdated: boolean;
  updatedFields: string[];
  updateReason: string;
  saved: boolean;
  warning?: string;
}

interface EmailImportProps {
  onSuccess: () => void;
}

export function EmailImport({ onSuccess }: EmailImportProps) {
  const [open, setOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailText, setEmailText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const handleParse = async () => {
    if (!emailText.trim()) {
      toast.error("Please paste email content first");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/email-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailText, emailSubject }),
      });

      let data: ParsedResult & { error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse email");
      }

      setResult(data);

      if (data.autoUpdated) {
        const companyName = data.matchedCompanyName || data.parsed.company || "application";
        toast.success(
          `Updated ${companyName} status to "${data.parsed.status}"`
        );
        onSuccess(); // Refresh applications list
      } else if (data.matchedAppId && data.parsed.confidence && data.parsed.confidence < 60) {
        toast.info(
          `Found a possible match for ${data.parsed.company || "this email"} (${data.parsed.confidence}% confidence) - please confirm manually`
        );
      } else if (data.saved) {
        toast.success("Email parsed and saved successfully");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to parse email"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmailSubject("");
    setEmailText("");
    setResult(null);
    setShowRaw(false);
  };

  const confidenceColor = (c: number | null) => {
    if (!c) return "text-muted-foreground";
    if (c >= 80) return "text-emerald-400";
    if (c >= 50) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border bg-card text-foreground hover:bg-muted"
        >
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Import Email</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-card border-border text-foreground sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Mail className="h-5 w-5 text-primary" />
            Import from Email
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Paste an email from a company (confirmation, interview invite,
              offer, rejection) and AI will extract the key details and update
              your tracker.
            </p>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email-subject"
                className="text-xs font-medium text-muted-foreground"
              >
                Email Subject (optional)
              </label>
              <input
                id="email-subject"
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder='e.g. "Interview Invitation - Software Engineer Intern"'
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email-body"
                className="text-xs font-medium text-muted-foreground"
              >
                Email Body
              </label>
              <textarea
                id="email-body"
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Paste the full email content here..."
                rows={8}
                className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <Button
              onClick={handleParse}
              disabled={loading || !emailText.trim()}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing email...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Parse Email
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-fade-scale">
            {/* Success/warning banner */}
            {result.autoUpdated ? (
              <div className="flex flex-col gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <p className="text-sm font-medium text-emerald-400">
                    Updated {result.matchedCompanyName || result.parsed.company} status to &quot;{result.parsed.status}&quot;
                  </p>
                </div>
                {result.updatedFields && result.updatedFields.length > 1 && (
                  <p className="text-xs text-emerald-400/70 ml-6">
                    Also updated: {result.updatedFields.filter(f => !f.startsWith("status")).join(", ")}
                  </p>
                )}
              </div>
            ) : result.matchedAppId && result.parsed.confidence && result.parsed.confidence < 60 ? (
              <div className="flex flex-col gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  <p className="text-sm text-amber-400">
                    Found a possible match ({result.parsed.confidence}% confidence) - please confirm manually
                  </p>
                </div>
                <p className="text-xs text-amber-400/70 ml-6">
                  The detected status is &quot;{result.parsed.status}&quot; but confidence is below 60%. Update your application manually if this looks correct.
                </p>
              </div>
            ) : result.matchedAppId ? (
              <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2.5">
                <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                <p className="text-sm text-blue-400">
                  Matched to an existing application
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-sm text-amber-400">
                  No matching application found - you can add one manually
                </p>
              </div>
            )}

            {/* Parsed results grid */}
            <div className="grid grid-cols-2 gap-3">
              {result.parsed.company && (
                <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-background/50 px-3 py-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Company
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {result.parsed.company}
                  </span>
                </div>
              )}

              {result.parsed.role && (
                <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-background/50 px-3 py-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Role
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {result.parsed.role}
                  </span>
                </div>
              )}

              {result.parsed.status && (
                <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-background/50 px-3 py-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Status
                  </span>
                  <span
                    className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[result.parsed.status] || "bg-zinc-500/15 text-zinc-400 border-zinc-500/25"}`}
                  >
                    {result.parsed.status}
                  </span>
                </div>
              )}

              {result.parsed.confidence !== null && (
                <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-background/50 px-3 py-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Confidence
                  </span>
                  <span
                    className={`text-sm font-semibold ${confidenceColor(result.parsed.confidence)}`}
                  >
                    {result.parsed.confidence}%
                  </span>
                </div>
              )}

              {result.matchScore > 0 && (
                <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-background/50 px-3 py-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Match Score
                  </span>
                  <span
                    className={`text-sm font-semibold ${result.matchScore >= 80 ? "text-emerald-400" : result.matchScore >= 60 ? "text-amber-400" : "text-red-400"}`}
                  >
                    {result.matchScore}%
                  </span>
                </div>
              )}

              {result.parsed.interview_date && (
                <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-background/50 px-3 py-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Interview Date
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {new Date(result.parsed.interview_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              {result.parsed.deadline && (
                <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-background/50 px-3 py-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Deadline
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {new Date(result.parsed.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            {result.parsed.details && (
              <div className="rounded-lg border border-border bg-background/50 px-3 py-2.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  Summary
                </span>
                <p className="mt-0.5 text-sm text-foreground/80">
                  {result.parsed.details}
                </p>
              </div>
            )}

            {/* Update reason */}
            {result.updateReason && !result.autoUpdated && (
              <div className="rounded-lg border border-border bg-background/50 px-3 py-2.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  Why not auto-updated
                </span>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {result.updateReason}
                </p>
              </div>
            )}

            {/* Collapsible raw email */}
            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              {showRaw ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {showRaw ? "Hide" : "Show"} original email
            </button>
            {showRaw && (
              <pre className="max-h-32 overflow-auto rounded-lg border border-border bg-background/30 px-3 py-2 text-xs text-muted-foreground/70 whitespace-pre-wrap">
                {emailText}
              </pre>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="gap-1.5 border-border bg-transparent text-foreground hover:bg-muted"
              >
                <Mail className="h-3.5 w-3.5" />
                Parse Another
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                  handleReset();
                }}
                variant="outline"
                size="sm"
                className="gap-1.5 border-border bg-transparent text-muted-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
