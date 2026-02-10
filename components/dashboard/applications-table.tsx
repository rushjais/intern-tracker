"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Application,
  ApplicationStatus,
  CompanyResearch,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Loader2,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { ApplicationForm } from "./application-form";
import { ResearchPanel } from "./research-panel";

interface ApplicationsTableProps {
  applications: Application[];
  onRefresh: () => void;
}

type SortField = "date_applied" | "company" | "priority" | "deadline";
type SortDirection = "asc" | "desc";

const priorityOrder = { High: 0, Medium: 1, Low: 2 };

export function ApplicationsTable({
  applications,
  onRefresh,
}: ApplicationsTableProps) {
  const [sortField, setSortField] = useState<SortField>("date_applied");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [researchData, setResearchData] = useState<
    Record<string, CompanyResearch>
  >({});
  const [loadingResearch, setLoadingResearch] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sorted = [...applications].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "date_applied":
        cmp =
          new Date(a.date_applied).getTime() -
          new Date(b.date_applied).getTime();
        break;
      case "company":
        cmp = a.company.localeCompare(b.company);
        break;
      case "priority":
        cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case "deadline": {
        const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        cmp = da - db;
        break;
      }
    }
    return sortDirection === "asc" ? cmp : -cmp;
  });

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Failed to delete application");
    } else {
      toast.success("Application deleted");
      onRefresh();
    }
  };

  const handleResearch = async (app: Application, forceRefresh = false) => {
    // Toggle off if already expanded and not forcing refresh
    if (expandedRow === app.id && !forceRefresh) {
      setExpandedRow(null);
      return;
    }

    // If we already have cached data and not forcing, just expand
    if (researchData[app.id] && !forceRefresh) {
      setExpandedRow(app.id);
      return;
    }

    setExpandedRow(app.id);
    setLoadingResearch(app.id);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: app.company, role: app.role }),
      });

      let data: { research?: CompanyResearch; error?: string; warnings?: string[] };
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid response from server. Please try again.");
      }

      if (!res.ok) {
        throw new Error(data.error || `Research failed (${res.status})`);
      }

      if (!data.research) {
        throw new Error("No research data returned. Please try again.");
      }

      if (data.warnings && data.warnings.length > 0) {
        toast.warning(`Partial results: ${data.warnings[0]}`);
      }

      setResearchData((prev) => ({ ...prev, [app.id]: data.research as CompanyResearch }));
    } catch (err) {
      toast.error(
        `Failed to research ${app.company}: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      setExpandedRow(null);
    } finally {
      setLoadingResearch(null);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return (
        <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground/50" />
      );
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-foreground" />
    ) : (
      <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-foreground" />
    );
  };

  if (applications.length === 0) {
    const suggestions = [
      { company: "Google", role: "Software Engineer Intern" },
      { company: "Stripe", role: "Product Design Intern" },
      { company: "Vercel", role: "Frontend Engineer Intern" },
    ];

    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-14 px-4 animate-in fade-in duration-500">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <Briefcase className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Ready to start your internship search?
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-sm text-center text-pretty">
          Add your first application to track your progress, get AI-powered insights, and never miss a deadline.
        </p>

        <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
          <p className="text-xs text-muted-foreground/60 text-center">
            Popular companies to track
          </p>
          {suggestions.map((s) => (
            <div
              key={s.company}
              className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3.5 py-2.5 transition-colors hover:bg-muted/30"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {s.company}
                </span>
                <span className="text-xs text-muted-foreground">
                  {s.role}
                </span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead>
                  <button
                    type="button"
                    onClick={() => handleSort("company")}
                    className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Company
                    <SortIcon field="company" />
                  </button>
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Role
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Status
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => handleSort("priority")}
                    className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Priority
                    <SortIcon field="priority" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => handleSort("date_applied")}
                    className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Applied
                    <SortIcon field="date_applied" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => handleSort("deadline")}
                    className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Deadline
                    <SortIcon field="deadline" />
                  </button>
                </TableHead>
                <TableHead className="w-20">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((app) => {
                const isExpanded = expandedRow === app.id;
                const isLoading = loadingResearch === app.id;
                const hasResearch = !!researchData[app.id];

                return (
                  <TableRow
                    key={app.id}
                    className="border-border group"
                    data-state={isExpanded ? "expanded" : undefined}
                  >
                    <TableCell
                      colSpan={7}
                      className="p-0"
                    >
                      {/* Main row content */}
                      <div className={`flex items-center hover:bg-muted/30 transition-colors ${isExpanded ? "bg-muted/20" : ""}`}>
                        <div className="flex-1 grid grid-cols-[1fr_1fr_auto_auto_auto_auto] items-center gap-0">
                          <div className="px-4 py-3 font-medium text-foreground">
                            {app.company}
                          </div>
                          <div className="px-4 py-3 text-muted-foreground">
                            {app.role}
                          </div>
                          <div className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status as ApplicationStatus]}`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <div className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[app.priority]}`}
                            >
                              {app.priority}
                            </span>
                          </div>
                          <div className="px-4 py-3 text-muted-foreground text-sm">
                            {format(
                              new Date(app.date_applied + "T00:00:00"),
                              "MMM d, yyyy"
                            )}
                          </div>
                          <div className="px-4 py-3 text-muted-foreground text-sm">
                            {app.deadline ? (
                              format(
                                new Date(app.deadline + "T00:00:00"),
                                "MMM d, yyyy"
                              )
                            ) : (
                              <span className="text-muted-foreground/40">
                                --
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Actions column */}
                        <div className="flex items-center gap-1 px-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 transition-colors ${
                              isExpanded
                                ? "text-primary bg-primary/10"
                                : hasResearch
                                  ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                  : "text-muted-foreground hover:text-foreground"
                            }`}
                            onClick={() => handleResearch(app)}
                            disabled={isLoading}
                            title={hasResearch ? "View research" : "Research company"}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              Research {app.company}
                            </span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-card border-border"
                            >
                              <DropdownMenuItem
                                onClick={() => setEditApp(app)}
                                className="cursor-pointer"
                              >
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(app.id)}
                                className="cursor-pointer text-red-400 focus:text-red-400"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Loading state */}
                      {isLoading && (
                        <div className="border-t border-border bg-card/50 px-4 py-8 animate-slide-down">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="relative">
                              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <p className="text-sm font-medium text-foreground">
                                Researching {app.company}...
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Analyzing company data, tech stack, culture, and
                                fit score
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <div
                                className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              />
                              <div
                                className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              />
                              <div
                                className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Research panel */}
                      {isExpanded && !isLoading && researchData[app.id] && (
                        <ResearchPanel
                          research={researchData[app.id]}
                          onRefresh={() => handleResearch(app, true)}
                          company={app.company}
                          role={app.role}
                          applicationId={app.id}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {editApp && (
        <ApplicationForm
          open={!!editApp}
          onOpenChange={(open) => {
            if (!open) setEditApp(null);
          }}
          onSuccess={onRefresh}
          editApplication={editApp}
        />
      )}
    </>
  );
}
