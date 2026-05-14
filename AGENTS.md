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
- Prerequisites at start of procedural content - ALWAYS wrap prerequisites in an Accordion component
- Test all code examples before publishing
- Match style and formatting of existing pages
- Include both basic and advanced use cases
- Language tags on all code blocks
- Alt text on all images
- Relative paths for internal links

## Component usage rules
- Prerequisites Should Always be wrapped in an Accordion component with title "Prerequisites" or "Before you begin"
- Use Steps component for sequential procedures sparingly.
- Don't use Cards to display information. Only for navigation on Overview type pages
- Use CodeGroups and Dropdowns for code examples that show the same example in different languages
- Use Note/Tip/Warning callouts appropriately

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
