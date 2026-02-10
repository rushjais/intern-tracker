"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Application, ApplicationStatus, STATUS_OPTIONS } from "@/lib/types";
import { TrendingUp, Clock, Zap, BarChart3 } from "lucide-react";

interface InsightsSectionProps {
  applications: Application[];
}

const STATUS_DOT_COLORS: Record<ApplicationStatus, string> = {
  Applied: "#3b82f6",
  Interview: "#f59e0b",
  Offer: "#10b981",
  Rejected: "#ef4444",
  Withdrawn: "#71717a",
};

const STATUS_BAR_BG: Record<ApplicationStatus, string> = {
  Applied: "bg-blue-500",
  Interview: "bg-amber-500",
  Offer: "bg-emerald-500",
  Rejected: "bg-red-500",
  Withdrawn: "bg-zinc-500",
};

function getWeekLabel(date: Date): string {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const weekNum = Math.ceil((diff / 86400000 + startOfYear.getDay() + 1) / 7);

  const weekStart = new Date(date);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - day);

  return weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.toISOString().split("T")[0];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{"Week of "}{label}</p>
      <p className="text-sm font-semibold text-foreground">
        {payload[0].value} {payload[0].value === 1 ? "application" : "applications"}
      </p>
    </div>
  );
}

export function InsightsSection({ applications }: InsightsSectionProps) {
  const weeklyData = useMemo(() => {
    if (applications.length === 0) return [];

    const weekMap = new Map<string, { weekKey: string; label: string; count: number }>();

    for (const app of applications) {
      const date = new Date(app.date_applied);
      const key = getWeekKey(date);
      const label = getWeekLabel(date);

      if (weekMap.has(key)) {
        weekMap.get(key)!.count++;
      } else {
        weekMap.set(key, { weekKey: key, label, count: 0 });
        weekMap.get(key)!.count = 1;
      }
    }

    return Array.from(weekMap.values())
      .sort((a, b) => a.weekKey.localeCompare(b.weekKey))
      .slice(-8);
  }, [applications]);

  const avgResponseTime = useMemo(() => {
    const responded = applications.filter(
      (a) => a.status !== "Applied" && a.status !== "Withdrawn"
    );
    if (responded.length === 0) return null;

    let totalDays = 0;
    let validCount = 0;

    for (const app of responded) {
      const applied = new Date(app.date_applied);
      const updated = new Date(app.updated_at);
      const days = Math.max(
        0,
        Math.round((updated.getTime() - applied.getTime()) / 86400000)
      );
      if (days <= 365) {
        totalDays += days;
        validCount++;
      }
    }

    return validCount > 0 ? Math.round(totalDays / validCount) : null;
  }, [applications]);

  const mostActivePeriod = useMemo(() => {
    if (weeklyData.length === 0) return null;
    return weeklyData.reduce((max, week) =>
      week.count > max.count ? week : max
    );
  }, [weeklyData]);

  const quickTip = useMemo(() => {
    const now = new Date();
    const thisWeekKey = getWeekKey(now);
    const thisWeekApps = applications.filter(
      (a) => getWeekKey(new Date(a.date_applied)) === thisWeekKey
    ).length;

    const pendingCount = applications.filter((a) => a.status === "Applied").length;
    const totalCount = applications.length;
    const offerCount = applications.filter((a) => a.status === "Offer").length;
    const interviewCount = applications.filter((a) => a.status === "Interview").length;

    if (offerCount > 0) {
      return `Congrats on ${offerCount} offer${offerCount > 1 ? "s" : ""}! Review and compare before deciding.`;
    }
    if (interviewCount > 0) {
      return `${interviewCount} interview${interviewCount > 1 ? "s" : ""} in progress - prep your stories and questions.`;
    }
    if (thisWeekApps === 0 && totalCount > 0) {
      return "No applications this week yet - aim for at least 3 to keep momentum.";
    }
    if (thisWeekApps < 3) {
      return `${thisWeekApps} sent this week - apply to ${3 - thisWeekApps} more to stay on track.`;
    }
    if (pendingCount > 10) {
      return `${pendingCount} pending - consider following up on older applications.`;
    }
    if (thisWeekApps >= 5) {
      return "Great pace this week! Quality over quantity - tailor each application.";
    }
    if (totalCount === 0) {
      return "Start by adding your first application to track your progress.";
    }
    return `${thisWeekApps} apps this week. Keep up the consistent effort!`;
  }, [applications]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<ApplicationStatus, number> = {
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Withdrawn: 0,
    };
    for (const app of applications) {
      counts[app.status]++;
    }
    return STATUS_OPTIONS.map((status) => ({
      status,
      count: counts[status],
    })).filter((s) => s.count > 0);
  }, [applications]);

  const maxBarValue = useMemo(() => {
    if (weeklyData.length === 0) return 5;
    return Math.max(...weeklyData.map((w) => w.count), 1);
  }, [weeklyData]);

  if (applications.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Insights
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Bar Chart - Applications per week */}
        <div className="col-span-1 rounded-lg border border-border bg-card p-4 lg:col-span-2">
          <p className="mb-3 text-sm font-medium text-foreground">
            Applications per week
          </p>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={weeklyData}
                margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220 14% 16%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "hsl(215 14% 50%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "hsl(215 14% 50%)" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, maxBarValue + 1]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "hsl(220 14% 12%)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={entry.weekKey}
                      fill={
                        index === weeklyData.length - 1
                          ? "hsl(217 92% 60%)"
                          : "hsl(217 92% 60% / 0.4)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
              Add applications to see weekly trends
            </div>
          )}
        </div>

        {/* Insight cards stack */}
        <div className="col-span-1 flex flex-col gap-3">
          {/* Average response time */}
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10">
              <Clock className="h-4 w-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Avg. response time</p>
              <p className="text-lg font-semibold text-foreground leading-tight">
                {avgResponseTime !== null ? `${avgResponseTime} days` : "--"}
              </p>
            </div>
          </div>

          {/* Most active period */}
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Most active week</p>
              <p className="text-lg font-semibold text-foreground leading-tight">
                {mostActivePeriod
                  ? `${mostActivePeriod.label} (${mostActivePeriod.count})`
                  : "--"}
              </p>
            </div>
          </div>

          {/* Quick tip */}
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Quick tip</p>
              <p className="text-sm text-foreground leading-snug">{quickTip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      {statusBreakdown.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-sm font-medium text-foreground">
            Status breakdown
          </p>
          <div className="flex flex-col gap-2.5">
            {statusBreakdown.map(({ status, count }) => {
              const pct =
                applications.length > 0
                  ? Math.round((count / applications.length) * 100)
                  : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="flex w-24 shrink-0 items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: STATUS_DOT_COLORS[status] }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {status}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${STATUS_BAR_BG[status]} transition-all duration-500`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-medium tabular-nums text-foreground">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
