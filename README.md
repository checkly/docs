# Checkly docs

Documentation for Checkly, built with [Mintlify](https://mintlify.com).

## Development

The [Mintlify CLI](https://www.npmjs.com/package/mint) is installed as a `devDependency` so you can preview documentation changes locally.

Run the following command at the root of the docs (where `docs.json` lives):

```
npm run dev
```

## Editing content

Add content directly in `.mdx` files with MDX syntax and React components. The Mintlify component reference is the best place to look up what's available:

- [Text and headers](https://mintlify.com/docs/text)
- [Code blocks](https://mintlify.com/docs/code)
- [Images and embeds](https://mintlify.com/docs/image-embeds)
- [Reusable snippets](https://mintlify.com/docs/reusable-snippets)

See `CLAUDE.md` for project-specific writing conventions (frontmatter, voice, component usage rules).

## Publishing changes

The Mintlify GitHub app auto-propagates changes from this repo to the live docs. Changes pushed to `main` deploy to production automatically.

## Troubleshooting

- **Dev environment isn't running:** run `mint update` to ensure you have the most recent version of the CLI.
- **Page loads as a 404:** make sure you're running in a folder with `docs.json`.
