"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { Application, ApplicationStatus, ApplicationPriority } from "@/lib/types";
import { DashboardHeader } from "./dashboard-header";
import { StatsCards } from "./stats-cards";
import { FilterBar } from "./filter-bar";
import { ApplicationsTable } from "./applications-table";
import { ApplicationForm } from "./application-form";
import { InsightsSection } from "./insights-section";

interface DashboardClientProps {
  initialApplications: Application[];
  userEmail: string;
}

async function fetchApplications(): Promise<Application[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function DashboardClient({
  initialApplications,
  userEmail,
}: DashboardClientProps) {
  const { data: applications = initialApplications, mutate } = useSWR(
    "applications",
    fetchApplications,
    {
      fallbackData: initialApplications,
      revalidateOnFocus: false,
    }
  );

  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<ApplicationPriority | "All">("All");

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        search === "" ||
        app.company.toLowerCase().includes(search.toLowerCase()) ||
        app.role.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || app.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || app.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [applications, search, statusFilter, priorityFilter]);

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <DashboardHeader
            onAddClick={() => setFormOpen(true)}
            onRefresh={() => mutate()}
            userEmail={userEmail}
          />

          <StatsCards applications={applications} />

          <InsightsSection applications={applications} />

          <FilterBar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
          />

          <ApplicationsTable
            applications={filtered}
            onRefresh={() => mutate()}
          />
        </div>
      </div>

      <ApplicationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
