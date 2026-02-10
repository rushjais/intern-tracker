"use client";

import React from "react"

import { CompanyResearch } from "@/lib/types";
import {
  Building2,
  DollarSign,
  Users,
  Code2,
  Newspaper,
  Heart,
  Target,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { ConnectionsPanel } from "./connections-panel";

interface ResearchPanelProps {
  research: CompanyResearch;
  isLoading?: boolean;
  onRefresh?: () => void;
  company: string;
  role: string;
  applicationId: string;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 70
      ? "text-emerald-400"
      : score >= 50
        ? "text-amber-400"
        : "text-red-400";
  const strokeColor =
    score >= 70
      ? "stroke-emerald-400"
      : score >= 50
        ? "stroke-amber-400"
        : "stroke-red-400";
  const bgGlow =
    score >= 70
      ? "shadow-emerald-500/10"
      : score >= 50
        ? "shadow-amber-500/10"
        : "shadow-red-500/10";

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full shadow-lg ${bgGlow}`}>
      <svg width="104" height="104" className="-rotate-90">
        <circle
          cx="52"
          cy="52"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-muted/30"
        />
        <circle
          cx="52"
          cy="52"
          r={radius}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className={`${strokeColor} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background/50 p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function ResearchPanel({
  research,
  onRefresh,
  company,
  role,
  applicationId,
}: ResearchPanelProps) {
  return (
    <div className="border-t border-b border-border bg-card/50 px-5 py-6 mb-0.5 relative overflow-hidden">
      <div className="flex flex-col gap-6">
        {/* Header with refresh */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">
              Researched{" "}
              {new Date(research.researched_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          )}
        </div>

        {/* Company Description */}
        {research.description && (
          <p className="text-sm text-foreground/90 leading-relaxed">
            {research.description}
          </p>
        )}

        {/* Top row: key metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoCard icon={DollarSign} label="Funding">
            <div className="flex flex-col gap-0.5">
              {research.funding_stage && (
                <span className="font-medium">{research.funding_stage}</span>
              )}
              {research.funding_amount && (
                <span className="text-xs text-muted-foreground">
                  {research.funding_amount}
                </span>
              )}
              {!research.funding_stage && !research.funding_amount && (
                <span className="text-muted-foreground/60">Not available</span>
              )}
            </div>
          </InfoCard>

          <InfoCard icon={Users} label="Company Size">
            {research.company_size || (
              <span className="text-muted-foreground/60">Not available</span>
            )}
          </InfoCard>

          <InfoCard icon={Building2} label="Culture">
            <p className="text-xs leading-relaxed">
              {research.culture_notes || (
                <span className="text-muted-foreground/60">Not available</span>
              )}
            </p>
          </InfoCard>
        </div>

        {/* Tech Stack */}
        {research.tech_stack && research.tech_stack.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Code2 className="h-3.5 w-3.5" />
              Tech Stack
            </div>
            <div className="flex flex-wrap gap-1.5">
              {research.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-md border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent News */}
        {research.recent_news && research.recent_news.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Newspaper className="h-3.5 w-3.5" />
              Recent News
            </div>
            <ul className="flex flex-col gap-1.5">
              {research.recent_news.map((news, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  {news}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Connections Section */}
        <ConnectionsPanel
          company={company}
          role={role}
          applicationId={applicationId}
        />

        {/* Fit Score Section */}
        {research.fit_score !== null && (
          <div className="rounded-lg border border-border bg-background/50 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-5">
              <Target className="h-4 w-4" />
              Fit Analysis
              {research.role_analyzed && (
                <span className="text-foreground/60">
                  for {research.role_analyzed}
                </span>
              )}
            </div>

            {/* Settings hint banner */}
            {research.fit_recommendation &&
              (research.fit_recommendation.toLowerCase().includes("profile") ||
                research.fit_recommendation.toLowerCase().includes("settings") ||
                research.fit_recommendation.toLowerCase().includes("general")) && (
                <a
                  href="/dashboard/settings"
                  className="flex items-center gap-2.5 rounded-lg bg-primary/5 border border-primary/15 px-4 py-3 mb-1 text-xs text-primary hover:bg-primary/10 transition-colors"
                >
                  <Target className="h-4 w-4 shrink-0" />
                  <span>Add your skills and experience in <span className="font-semibold underline underline-offset-2">Settings</span> to get a personalized fit score</span>
                </a>
              )}

            {/* Score + Recommendation row */}
            <div className="flex flex-col items-center gap-4 py-2">
              <ScoreRing score={research.fit_score} />

              {research.fit_recommendation && (() => {
                const rec = research.fit_recommendation;
                const label = rec.includes(" - ") ? rec.split(" - ")[0] : rec.split(".")[0];
                const detail = rec.includes(" - ") ? rec.split(" - ").slice(1).join(" - ") : (rec.includes(". ") ? rec.split(". ").slice(1).join(". ") : "");
                const isStrong = label.toLowerCase().includes("strong");
                const isGood = label.toLowerCase().includes("good");
                const isMedium = label.toLowerCase().includes("medium");
                const badgeColor = isStrong
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : isGood
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                    : isMedium
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400";
                return (
                  <div className="flex flex-col items-center gap-2 max-w-md text-center">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-lg border ${badgeColor}`}>
                      {label}
                    </span>
                    {detail && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {detail}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Strengths and Gaps - two column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {research.fit_strengths &&
                research.fit_strengths.length > 0 && (
                  <div className="flex flex-col gap-3 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                      Strengths
                    </div>
                    <ul className="flex flex-col gap-2.5">
                      {research.fit_strengths.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-foreground/85 leading-relaxed"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {research.fit_gaps && research.fit_gaps.length > 0 && (
                <div className="flex flex-col gap-3 rounded-lg border border-amber-500/15 bg-amber-500/[0.03] p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
                    <TrendingDown className="h-4 w-4" />
                    Growth Areas
                  </div>
                  <ul className="flex flex-col gap-2.5">
                    {research.fit_gaps.map((g, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-foreground/85 leading-relaxed"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
