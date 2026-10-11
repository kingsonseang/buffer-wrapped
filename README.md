# Buffer Wrapped

Your year on Buffer, told as a story. An interactive, story-driven year-in-review
of your social publishing — Spotify Wrapped energy, built entirely in Buffer's
own design language.

## What it is

Not a dashboard. A sequence of full-screen scenes, one idea at a time: how much
you published, where you showed up, your rhythm and streaks, your creator
personality, standout posts, and a set of share cards at the end. Personal,
playful but not childish, and easy to share.

The experience is still early exploration. See [`docs/buffer-wrapped.md`](docs/buffer-wrapped.md)
for the full brief: the 17-scene / 5-act structure, the four visual directions
(After Dark, Full Color, Editorial Yearbook, Playful Internet Culture), motion
principles, and the data assumptions.

## Design rules

- **Buffer-native, not a Spotify clone.** Borrow the storytelling mechanics;
  keep Buffer's colors, type, spacing, and components as the foundation.
- **Mock data first.** Design the strongest version of each scene with sample
  data. Only show metrics we can retrieve or calculate reliably once the API
  integration lands.
- **Kind by default.** Low-activity users get a satisfying experience too —
  never a failure screen.

## Stack

Next.js 16 (App Router) + Tailwind CSS v4 + shadcn/ui (base-luma) + Base UI
primitives. Fonts: Figtree (body), Google Sans Flex (display), Caveat
(Wrapped accents), Inter (insights numerals). Formatting via oxfmt
(`sortImports` + Tailwind class sorting in `.oxfmtrc.json`); lint via oxlint.

## Getting started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                 | Purpose                          |
| ---------------------- | -------------------------------- |
| `bun dev`              | Development server               |
| `bun build`            | Production build                 |
| `bun start`            | Serve the production build       |
| `bun run lint`         | Lint with oxlint                 |
| `bun run format`       | Format with oxfmt                |
| `bun run format:check` | Check formatting without writing |

## Environment

| Variable               | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (metadata, OG images). Optional. |

Without it, the URL resolves from Vercel's system variables
(`VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`) and falls back to
`http://localhost:3000` in local dev.

## Status

Living document — update as the experience takes shape.
