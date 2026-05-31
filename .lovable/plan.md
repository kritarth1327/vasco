## Problem

In `src/routes/chat.tsx`, AI replies are wrapped in `<div className="prose prose-sm ... prose-h2:... prose-p:my-4 ...">`. None of those `prose-*` classes are active because **`@tailwindcss/typography` is not installed**, and it isn't loaded in `src/styles.css` either. Result: every reply renders with default browser styles — same font size for headings and body, no list bullets, no paragraph spacing, no H2 divider. It looks like one long paragraph, exactly what the screenshot shows.

That's why my last 2 attempts (bumping `prose-p:my-4`, adding `prose-h2:border-b`, etc.) changed nothing visible — the classes weren't doing anything to begin with.

## Fix

1. Install the plugin: `bun add -d @tailwindcss/typography`.
2. Register it in `src/styles.css` using Tailwind v4 syntax — add `@plugin "@tailwindcss/typography";` near the top (next to the existing `@import "tailwindcss";`).
3. Leave the existing `prose ...` classes in `src/routes/chat.tsx` as-is — once the plugin loads, they will finally apply (H2 larger + underlined, bullets indented with primary-colored markers, generous paragraph spacing, blockquote/hr styling, etc.).

No other files change. No backend / system-prompt changes — the markdown the model returns is already correct; it just isn't being styled.

## Verification

After the change, an AI reply should show: visibly larger bold H2 with an underline divider, blank space between paragraphs, indented bullet lists with colored markers, and clear separation between sections — matching the spacious format requested.
