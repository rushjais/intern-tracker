# InternTracker

A full-stack internship application tracker built for students who take their search seriously. Track every application, get AI-powered company research, parse emails automatically, and never miss a deadline.

Built with Next.js, Supabase, and Claude (Anthropic).

## Features

- **Application Tracking** — add and manage applications with company, role, status (Applied / Interview / Offer / Rejected / Withdrawn), priority, deadlines, and notes
- **AI Company Research** — one-click research on any company: funding stage, tech stack, culture notes, and a personalized fit score based on your profile
- **Email Import** — paste any internship email and AI parses the company, status, role, interview date, and deadline — then auto-updates your tracker
- **Smart Insights** — weekly application volume chart, avg. response time, most active week, status breakdown, and contextual tips
- **Filter & Sort** — filter by status and priority, sort by company, date applied, deadline, or priority
- **Personalized Fit Scores** — fill in your skills, coursework, and projects in Settings and the AI fit analysis becomes specific to your actual background

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database & Auth**: Supabase (Postgres + Row Level Security)
- **AI**: Claude Sonnet via Anthropic API + Vercel AI SDK
- **Styling**: Tailwind CSS + shadcn/ui
- **Data Fetching**: SWR

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

### Setup

1. Clone the repo:
```bash
git clone https://github.com/rushjais/intern-tracker.git
cd intern-tracker
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

4. Run the database migration in your Supabase SQL editor:
```
scripts/001_create_applications.sql
```

> You'll also need `company_research`, `email_imports`, and `user_profiles` tables in Supabase. See the API routes for the expected schema.

5. Start the dev server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  api/
    research/       # AI company research + personalized fit score
    email-parse/    # AI email parsing + auto status update
    connections/    # Alumni/connections panel
  auth/             # Login, signup pages
  dashboard/
    page.tsx        # Main dashboard (server component)
    settings/       # User profile (skills, education, experience)
components/
  dashboard/
    dashboard-client.tsx      # Client shell with SWR data fetching
    applications-table.tsx    # Sortable table with inline research panel
    stats-cards.tsx           # Total, response rate, pending, deadlines
    insights-section.tsx      # Chart + avg response time + quick tips
    filter-bar.tsx            # Search + status + priority filters
    application-form.tsx      # Add/edit application dialog
    email-import.tsx          # Email paste + parse dialog
    research-panel.tsx        # Inline company research display
lib/
  supabase/         # Supabase client (server + client + middleware)
  types.ts          # Shared TypeScript types and constants
scripts/
  001_create_applications.sql  # Applications table + RLS policies
```

## Roadmap

- [ ] Job alerts — get notified when new internships are posted at target companies
- [ ] Startup Matcher — discover early-stage startups hiring your class year
- [ ] Resume Optimizer — auto-tailor resume per company using your profile
- [ ] Alumni Network — find connections at target companies
- [ ] Email Auto-Sync — automatically detect updates from inbox without manual pasting
- [ ] Predictive Analytics — offer probability scores and optimal apply timing

## License

MIT