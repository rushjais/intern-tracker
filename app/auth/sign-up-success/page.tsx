"use client";

import { Briefcase, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-foreground">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold tracking-tight">
              InternTracker
            </span>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-emerald-400" />
            <h2 className="text-lg font-semibold text-foreground">
              Account created
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              If email confirmation is enabled, check your inbox for a
              verification link. Otherwise, you can sign in now.
            </p>
            <Link href="/auth/login" className="mt-4 block">
              <Button className="w-full">Sign in to get started</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
