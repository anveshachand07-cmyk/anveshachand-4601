# Project memory

## Product intent & audience

- **CollabMatch** — two-sided Influencer & Brand Collaboration Marketplace.
- Two user types: creators (influencers) seeking campaigns, and brands seeking creators.
- Single app with a top-level toggle switching between Creator Mode and Brand Mode.

## Brand personality & voice

- Professional marketplace tone; trustworthy, modern, data-driven.
- Emphasizes verified metrics and tier badges as credibility signals.

## Visual design & UX direction

- Clean, modern UI built with Tailwind CSS; production-quality, non-cookie-cutter.
- Icons from `lucide-react`; no extra UI/theme packages.
- Mode switch is a prominent top toggle (Creator ↔ Brand).
- Cards used for campaigns, creator profiles, and applicant rows.
- Creator profile form includes a live preview of engagement rate and tier badge as inputs change.
- Smart Feed shows matched campaigns prominently, with a dimmed "other campaigns" section below.
- Applicant dashboard shows tier badges, engagement stats, approve/reject buttons, and a status progress bar.
- Responsive layout expected (Vite + React).

## Decisions, constraints & rationale

- **Tech stack:** Vite + React, JSX, Tailwind, `lucide-react`, `@/` path alias → `src/`.
- **Persistence:** Supabase database (tables + seed data); Supabase client created in-project.
- **Tier rules:** Nano 500–10K · Micro 10K–100K · Mid 100K–500K · Macro 500K+.
- **Engagement rate** = (avg likes ÷ followers) × 100.
- **High-engagement unlock:** engagement rate > 8% grants access to higher-tier paid campaigns regardless of follower count.
- **Collab types:** Barter, Paid, Affiliate.
- **Application statuses:** Applied → Approved → Content Live → Paid.
- **Seed data:** 5 creators across all tiers (incl. a 15%-engagement food creator who unlocks a Macro campaign), 5 campaigns across niches, 3 applications in various stages.
- `.bolt/prompt` contains authoritative global stack/style instructions; not duplicated here.

## Open questions & assumptions

- Auth/login not implemented; mode toggle assumes a single shared session rather than per-user accounts.
- Rate estimate logic for One-Click Apply is auto-generated; exact pricing formula not user-specified.
- Campaign matching prioritizes tier, engagement rate, and niche; secondary filters/sorting not yet defined.
- Supabase env credentials assumed configured in deployment; local env types added.