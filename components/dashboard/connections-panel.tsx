"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  Linkedin,
  GraduationCap,
  UserCheck,
  Briefcase,
  Star,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Connection {
  id: string;
  name: string;
  role_at_company: string | null;
  connection_type: string | null;
  confidence: string | null;
  suggested_action: string | null;
  status: string;
  company: string;
}

interface ConnectionsPanelProps {
  company: string;
  role: string;
  applicationId: string;
}

const CONNECTION_TYPE_CONFIG: Record<
  string,
  { icon: typeof Users; color: string; bg: string }
> = {
  Alumni: {
    icon: GraduationCap,
    color: "text-violet-400",
    bg: "bg-violet-500/15",
  },
  Recruiter: { icon: UserCheck, color: "text-blue-400", bg: "bg-blue-500/15" },
  "Team Member": {
    icon: Briefcase,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
  },
  "Hiring Manager": {
    icon: Star,
    color: "text-amber-400",
    bg: "bg-amber-500/15",
  },
  Mentor: { icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/15" },
};

const CONFIDENCE_COLORS: Record<string, string> = {
  High: "text-emerald-400 bg-emerald-500/15 border-emerald-500/25",
  Medium: "text-amber-400 bg-amber-500/15 border-amber-500/25",
  Low: "text-zinc-400 bg-zinc-500/15 border-zinc-500/25",
};

export function ConnectionsPanel({
  company,
  role,
  applicationId,
}: ConnectionsPanelProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(true);

  async function findConnections() {
    setLoading(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role, applicationId }),
      });

      let data: {
        connections?: Connection[];
        error?: string;
        warnings?: string[];
        cached?: boolean;
      };
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to find connections");
      }

      if (data.warnings && data.warnings.length > 0) {
        toast.warning(data.warnings[0]);
      }

      if (data.cached) {
        toast.info("Showing saved connections");
      }

      setConnections(data.connections || []);
      setLoaded(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to find connections"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) {
    return (
      <div className="mt-3">
        <Button
          onClick={findConnections}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs bg-transparent border-border text-muted-foreground hover:text-foreground"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Finding connections at {company}...
            </>
          ) : (
            <>
              <Users className="h-3.5 w-3.5" />
              Find Connections
            </>
          )}
        </Button>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="mt-3 rounded-lg border border-border bg-card/50 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          No connection suggestions found for {company}. Try adding your school
          info in Settings for better results.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-border bg-card/50 overflow-hidden animate-slide-down">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">
            {connections.length} Suggested Connections
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {connections.map((conn) => {
            const typeConfig =
              CONNECTION_TYPE_CONFIG[conn.connection_type || ""] ||
              CONNECTION_TYPE_CONFIG.Mentor;
            const TypeIcon = typeConfig.icon;
            const confidenceClass =
              CONFIDENCE_COLORS[conn.confidence || ""] || CONFIDENCE_COLORS.Low;

            return (
              <div
                key={conn.id}
                className="px-4 py-3 hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeConfig.bg}`}
                    >
                      <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">
                          {conn.name}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${confidenceClass}`}
                        >
                          {conn.confidence}
                        </span>
                      </div>
                      {conn.role_at_company && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {conn.role_at_company}
                        </p>
                      )}
                      {conn.connection_type && (
                        <span className="inline-block mt-1 rounded-full bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">
                          {conn.connection_type}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${conn.connection_type || ""} ${company}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-[10px] bg-transparent border-border text-muted-foreground hover:text-foreground"
                    >
                      <Linkedin className="h-3 w-3" />
                      Search
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Button>
                  </a>
                </div>
                {conn.suggested_action && (
                  <div className="mt-2 ml-11 rounded-md bg-primary/5 border border-primary/10 px-3 py-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-medium text-primary/80">
                        {"Tip: "}
                      </span>
                      {conn.suggested_action}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
