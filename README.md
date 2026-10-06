# kws

**[pinterest-design-research](https://pinplug.kitifica.com)** — a Claude Code
plugin that turns a curated Pinterest board into a structured, cited Design
System Brief: color tokens, type scale, spacing, component inventory,
navigation patterns, motion/micro-interaction notes, data viz — for web, mobile,
SaaS and other product UIs.

## Install

```bash
claude plugin marketplace add kitifica-max/kws
claude plugin install pinterest-design-research@kws
```

Inside a session the equivalent is
`/plugin marketplace add kitifica-max/kws` and
`/plugin install pinterest-design-research@kws`.

## Use it

No command to memorize — just describe what you're designing, in any project
where the plugin is installed:

> "necesito referencias de UI para un dashboard SaaS tipo fintech"

> "convierte lo que tenemos pineado en design tokens para esta landing"

Claude recognizes the intent on its own and writes the brief to
`design-system/<project>/brief.md` (plus `tokens.json` if you want
machine-readable tokens).

## Why there's nothing to configure

Pinterest's API only exposes keyword search to approved content partners, so
the skill doesn't try to search Pinterest — it reads one **already curated
board** (164+ pins, growing) through a small proxy that ships with the plugin.

That means: **no Pinterest account, no developer app, no API keys, no OAuth
screen, no `.env`.** The proxy holds every credential server-side; the plugin
only needs the board. See `.claude/skills/pinterest-design-research/SKILL.md`
for the full workflow.

## Repo layout

| Path | What it is |
|---|---|
| `.claude/` | the plugin: `SKILL.md`, reference docs, scripts |
| `.claude-plugin/marketplace.json` | the Claude Code marketplace manifest |
| `netlify/functions/` | the proxy (`/api/boards`, `/api/pull`, `/api/status`, plus owner-only OAuth seeding) |
| `netlify/public/` | the install landing page (https://pinplug.kitifica.com) |
| `design-system/` | example briefs produced by the skill |

Deploying or maintaining the proxy — env vars, the one-time token seed, and the
board allowlist — lives in
`.claude/skills/pinterest-design-research/references/remote-proxy.md`.
