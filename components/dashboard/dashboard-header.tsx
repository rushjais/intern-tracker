"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Briefcase, Plus, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { EmailImport } from "./email-import";

interface DashboardHeaderProps {
  onAddClick: () => void;
  onRefresh: () => void;
  userEmail?: string;
}

export function DashboardHeader({
  onAddClick,
  onRefresh,
  userEmail,
}: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Briefcase className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            InternTracker
          </h1>
          {userEmail && (
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <EmailImport onSuccess={onRefresh} />
        <Button onClick={onAddClick} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Application
        </Button>
        <Link href="/dashboard/settings">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground bg-transparent"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </Link>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground bg-transparent"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
