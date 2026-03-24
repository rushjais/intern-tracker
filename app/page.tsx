import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Sparkles,
  BarChart3,
  CalendarClock,
  ArrowRight,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">
              InternTracker
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground bg-transparent"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="gap-1.5">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden">
          {/* Subtle grid background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--muted-foreground)) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />

          <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8 lg:pt-36">
            <div className="flex flex-col items-center text-center">
              {/* Pill */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground">
                  Free to use. No credit card required.
                </span>
              </div>

              {/* Headline */}
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                Track Your Internship Applications{" "}
                <span className="text-primary">Smarter</span>
              </h1>

              {/* Subheadline */}
              <p className="mt-5 max-w-xl text-base text-muted-foreground leading-relaxed sm:text-lg text-pretty">
                One dashboard for every application. AI-powered research,
                smart analytics, and deadline tracking to land your dream
                internship.
              </p>

              {/* CTA */}
              <div className="mt-8 flex items-center gap-3">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="gap-2 px-6">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-6 bg-transparent"
                  >
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="relative mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-xl border border-border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 shadow-2xl shadow-primary/5 p-12 text-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                Live Dashboard
              </div>

              <h3 className="text-3xl font-bold">
                Track Every Application in One Place
              </h3>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Beautiful analytics, smart insights, and deadline tracking to help you stay organized throughout your entire internship search journey.
              </p>

              <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-8">
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Organized</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Tracking</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Missed Deadlines</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-foreground tracking-tight sm:text-3xl text-balance">
              Everything you need to stay organized
            </h2>
            <p className="mt-3 text-muted-foreground sm:text-lg">
              Built for students who take their internship search seriously.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Feature 1 */}
            <div className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-card/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  AI-Powered Research
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  One click to research any company. Get funding data, tech
                  stack, culture notes, and a personalized fit score powered
                  by AI.
                </p>
              </div>
              <div className="mt-auto flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Learn more
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-card/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Smart Analytics
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  See your response rate, weekly trends, and actionable
                  tips. Know where you stand and what to improve at a
                  glance.
                </p>
              </div>
              <div className="mt-auto flex items-center gap-1 text-xs font-medium text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100">
                Learn more
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-card/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10">
                <CalendarClock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Never Miss a Deadline
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Track deadlines, sort by priority, and get reminders for
                  upcoming due dates. Stay on top of every opportunity.
                </p>
              </div>
              <div className="mt-auto flex items-center gap-1 text-xs font-medium text-amber-400 opacity-0 transition-opacity group-hover:opacity-100">
                Learn more
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-10 text-center sm:p-14">
            <h2 className="text-2xl font-bold text-foreground tracking-tight sm:text-3xl text-balance">
              Ready to organize your internship search?
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              Join students who track their applications smarter. Start free
              in seconds.
            </p>
            <Link href="/auth/sign-up" className="mt-6">
              <Button size="lg" className="gap-2 px-8">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Upcoming Features */}
        <section className="container py-20 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground">
              We&apos;re constantly improving InternTracker. Here&apos;s what&apos;s next.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 border rounded-lg bg-card">
              <div className="text-4xl mb-3">🔔</div>
              <h3 className="font-semibold mb-2">Job Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Get notified the instant new internships are posted at your target companies. Never miss an opening again.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 border rounded-lg bg-card">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">Startup Matcher</h3>
              <p className="text-sm text-muted-foreground">
                Discover early-stage startups hiring your class year. Find high-upside opportunities beyond big tech.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 border rounded-lg bg-card">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="font-semibold mb-2">Resume Optimizer</h3>
              <p className="text-sm text-muted-foreground">
                Auto-tailor your resume for each company. Highlight the right skills and projects for every application.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 border rounded-lg bg-card">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="font-semibold mb-2">Alumni Network</h3>
              <p className="text-sm text-muted-foreground">
                Find and connect with alumni at your target companies. Get warm referrals and insider advice.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 border rounded-lg bg-card">
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-semibold mb-2">Email Auto-Sync</h3>
              <p className="text-sm text-muted-foreground">
                Automatically detect and import application updates from your inbox. Status changes update in real time.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 border rounded-lg bg-card">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">Predictive Analytics</h3>
              <p className="text-sm text-muted-foreground">
                ML-powered offer probability scores, optimal apply timing, and response rate benchmarks by industry.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                InternTracker
              </span>
            </div>
            <p className="text-xs text-muted-foreground/60">
              Built with Next.js, Supabase, and AI.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
