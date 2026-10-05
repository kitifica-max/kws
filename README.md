# kws

Contains the **pinterest-design-research** Claude Code skill: turns your own
curated Pinterest boards into a structured, cited Design System Brief (color,
typography, layout, components, navigation, motion/micro-interactions, data
viz) for web, mobile, SaaS and other product UIs.

## Setup

1. Copy `.env.example` to `.env` and follow
   `.claude/skills/pinterest-design-research/references/api-reference.md` to
   create a Pinterest developer app and run the OAuth flow. `.env` is
   gitignored — your credentials never get committed.
2. In Claude Code, just describe what you're designing ("necesito
   referencias de UI para un dashboard SaaS tipo fintech") — the skill
   triggers automatically and walks you through curating boards on Pinterest,
   then pulling and analyzing them.

See the skill's `SKILL.md` for the full workflow and
`scripts/pinterest_client.py -h` for the underlying Pinterest API commands.
