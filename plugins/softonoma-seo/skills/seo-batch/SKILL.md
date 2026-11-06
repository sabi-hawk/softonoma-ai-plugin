---
name: seo-batch
description: Create many SEO pages at once from a sheet or list (up to 50 per PR)
argument-hint: "<Google Sheet link, CSV path or pasted list>"
---

<!-- In-house command (Softonoma): HolidayMarket.ae SEO Page Studio. The real instructions live in the madmax repo's .claude/seo-studio/PLAYBOOK.md. -->

# seo-batch

## Preconditions
- First confirm you are in the HolidayMarket monorepo: `.claude/seo-studio/PLAYBOOK.md` must exist. If not, stop and tell the user to open Claude Code in the madmax repository.
- Confirm Studio mode is on: the environment variable `HM_SEO_STUDIO` is `1`. If not, stop and tell the user to run `/seo-setup` with an engineer.
- Read `.claude/seo-studio/PLAYBOOK.md` in full and follow it. It overrides anything in this command if they disagree.

## The task
Run the **Create many** section of the playbook for: `$ARGUMENTS`.

- If you are given a Google Sheet link and cannot read it, ask the user to share it as a CSV or paste the keywords instead.
- Create at most 50 pages per PR.
- Before committing, show a plain summary of what will change and ask the user to confirm with the word "publish". Do not open the PR without that word.
- Finish with a table with these columns: keyword, page address, result (created, or skipped and why).

## Guardrail reminder
You may only create, edit or remove `.json` files under `apps/web/content/seo-pages/`. Never change code, settings or data, never push to `develop` or `main`, never merge, never deploy. If the user asks for something outside this, explain in plain English that it needs engineering and stop.

## Voice
The user is on the SEO team and is not technical. Use plain English, no code terms, no em dashes. End with exactly one clear next step for them.
