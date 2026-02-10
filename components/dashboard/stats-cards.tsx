"use client";

import { Application } from "@/lib/types";
import { FileText, MessageSquare, Clock, CalendarClock } from "lucide-react";

interface StatsCardsProps {
  applications: Application[];
}

export function StatsCards({ applications }: StatsCardsProps) {
  const total = applications.length;

  const responded = applications.filter(
    (a) => a.status === "Interview" || a.status === "Offer" || a.status === "Rejected"
  ).length;

  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  const pending = applications.filter(
    (a) => a.status === "Applied"
  ).length;

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = applications.filter((a) => {
    if (!a.deadline) return false;
    const deadline = new Date(a.deadline);
    return deadline >= now && deadline <= nextWeek;
  }).length;

  const stats = [
    {
      label: "Total Applications",
      value: total,
      icon: FileText,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Response Rate",
      value: `${responseRate}%`,
      icon: MessageSquare,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Upcoming Deadlines",
      value: upcomingDeadlines,
      subtext: "next 7 days",
      icon: CalendarClock,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card/80 hover:border-border/80"
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bgColor}`}>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-semibold text-foreground tracking-tight">
                {stat.value}
              </p>
              {stat.subtext && (
                <span className="text-xs text-muted-foreground">
                  {stat.subtext}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
