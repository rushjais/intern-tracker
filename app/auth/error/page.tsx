import { Briefcase, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

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
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
            <h2 className="text-lg font-semibold text-foreground">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {params?.error
                ? `Error: ${params.error}`
                : "An unspecified error occurred."}
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href="/auth/login">Back to login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
