# Mintlify documentation

## Working relationship
- You can push back on ideas-this can lead to better documentation. Cite sources and explain your reasoning when you do so
- ALWAYS ask for clarification rather than making assumptions
- NEVER lie, guess, or make up information

## Project context
- Framework: Mintlify. https://mintlify.com/docs/llms.txt
- Format: MDX files with YAML frontmatter
- Config: docs.json for navigation, theme, settings. Tabs set top level navigation, Groups set sidebar navigation within Tabs.
- Components: We use Mintlify components and documentation. 
    -- Headers and text
    -- Images and embeds
    -- Lists and tables
    -- Code
    -- Reusable snippets
    -- Accordions
    -- Callouts
    -- Cards
    -- Columns
    -- Code groups
    -- Examples
    -- Expandables
    -- Fields
    -- Frames
    -- Icons
    -- Mermaid
    -- Panel
    -- Steps
    -- Tabs
    -- Tooltips
    -- Update

## Content strategy
- Search for existing information before adding new content. Avoid duplication unless it is done for a strategic reason
- Check existing patterns for consistency
- Start by making the smallest reasonable changes
- Document just enough for user success - not too much. Don't be verbose.
- Prioritize accuracy and usability of information
- Make content evergreen

## docs.json

- Refer to the [docs.json schema](https://mintlify.com/docs.json) when building the docs.json file and site navigation
- Tabs
-- Groups
--- Pages

## Frontmatter requirements for pages
- title: Clear, descriptive page title
- sidebarTitle: Concise title for sidebar
- description: Concise summary for SEO/navigation

## Writing standards
- Second-person voice ("you")
- Test all code examples before publishing
- Match style and formatting of existing pages
- Include both basic and advanced use cases
- Language tags on all code blocks
- Alt text on all images
- Relative paths for internal links

## Casing and terminology
CI blocks a PR when a line it adds or changes breaks these rules. Run `npm run lint:casing` before you push (it needs [Vale](https://vale.sh/docs/install)); `npm run lint:casing -- --all <file.mdx>` checks whole files.

- **Headings and titles use sentence case:** capitalize the first word and names only. This covers Markdown headings, frontmatter `title` and `sidebarTitle`, and `title="…"` on Card, Step, Tab, Accordion, Expandable and Update. Acronyms (API, RCA) and mixed-case names (gRPC, OpenTelemetry) are fine. Other names that keep their capitals are listed in `styles/Checkly/proper-nouns.txt`; add a new name there in the same PR.
- **Check and monitor types:** capitalize the type, lowercase the generic noun: Browser check, API check, Multistep check, URL monitor, TCP monitor, DNS monitor, ICMP monitor, SSL monitor, gRPC monitor, Traceroute monitor, Heartbeat monitor. Keep "Playwright Check Suite" and "Agentic Check" as they are (product names).
- **Checkly features:** lowercase a single instance ("a status page", "each private location", "your alert channel"). Capitalize only when the text names the feature itself ("Keep your customers informed with Status Pages"). When in doubt, lowercase.
- **Third-party names:** official casing, such as GitHub, GitLab, JavaScript, TypeScript, Node.js, OpenTelemetry, Opsgenie, PagerDuty, HashiCorp, Microsoft Teams.
- **Never change** code, commands, URLs, file paths, construct names (`BrowserCheck`) or UI labels quoted exactly as the app shows them (in **bold** or quotes). The check skips those too.
- The rules live in `styles/Checkly/` (Vale) and `.github/scripts/check-casing.mjs`.

## Component usage rules
- Use Steps component for sequential procedures sparingly.
- Don't use Cards to display information. Only for navigation on Overview type pages
- Use CodeGroups and Dropdowns for code examples that show the same example in different languages
- Use Note/Tip/Warning callouts appropriately

## Code snippet typecheck
CI typechecks Checkly CLI snippets in `.mdx` files against the latest `checkly` release. Run it locally with `npm run check:snippets`.

- Complete snippets (with a `checkly` import or `require`) and fragments that use a checkly export (`new ApiCheck(`, `Frequency.EVERY_5M`) are checked automatically.
- `/* More options... */` marks a shortened snippet. Missing required props are allowed; wrong or unknown props still fail.
- Add a marker comment on the line before the code fence when you need one:
  - `{/* typecheck-wrap: ApiCheck */}`: checks a property fragment like `request: {...}` inside that construct.
  - `{/* typecheck-wrap */}`: checks a statement like `export default defineConfig(...)`, adding imports only.
  - `{/* typecheck-skip */}`: opts the block out. Use it only when the snippet can't match the latest CLI.

## CodeGroup Dropdown
- Use `<CodeGroup dropdown={true}>` for code examples that show the same functionality in different programming languages
- The dropdown automatically creates a language selector based on the code block language identifiers
- Example usage:

<CodeGroup dropdown={true}>
```typescript example.ts
// TypeScript code here
```

```javascript example.js
// JavaScript code here
```
</CodeGroup>

- This replaces the older `<Tabs>` pattern for language-specific code examples

## Guides
- Any change under `guides/`, `samples/guides/`, or `images/guides/` follows the `guide-authoring` skill in `.claude/skills/guide-authoring/SKILL.md`: agent path first, tested samples, real screenshots, brand diagrams.

## Git workflow
- NEVER use --no-verify when committing
- Ask how to handle uncommitted changes before starting
- Create a new branch when no clear branch exists for changes
- Commit frequently throughout development
- NEVER skip or disable pre-commit hooks

## Do not
- Skip frontmatter on any MDX file
- Use absolute URLs for internal links
- Include untested code examples
- Make assumptions - always ask for clarification
- overuse components like Cards or Accordion
​
