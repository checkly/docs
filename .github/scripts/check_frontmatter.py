#!/usr/bin/env python3
"""
Frontmatter & canonical integrity check for docs pages.

Guards the SEO bug class where a malformed YAML frontmatter fence silently
drops a page's title/description/canonical and makes Mintlify fall back to the
default no-slash canonical (which 308-redirects). See the docs SEO audit
(2026-07): four pages shipped with a trailing space on the opening `---` fence
(`--- ` instead of `---`), so Mintlify ignored the whole block.

For every built docs page (all *.mdx except snippets/includes and mint-ignored
trees) this enforces:
  1. Opening fence is EXACTLY `---` (no trailing whitespace / extra dashes / BOM).
  2. A closing `---` fence exists.
  3. A `canonical:` key is present and equals the trailing-slash, www URL
     derived from the file path (self-referential canonical policy).
  4. A `title:` key is present, unless the page is OpenAPI-generated
     (`openapi:` key -> title comes from the spec).
  5. No page lives under a top-level `docs/` folder (would serve at a broken
     double `/docs/docs/...` URL).

Stdlib only (no PyYAML) so it runs in CI without extra install steps.
Exit 1 with a list of violations if any are found.
"""
import os
import re
import sys

BASE = "https://www.checklyhq.com/docs/"
# Trees excluded from the Mintlify build (.mintignore) or that are include-only.
EXCLUDE_PREFIXES = ("api-reference-old/", "skills/", "node_modules/")
SNIPPET_PREFIX = "snippets/"  # reusable includes, not standalone pages


def expected_canonical(rel):
    slug = rel[:-4]  # strip ".mdx"
    if slug == "index":
        return BASE
    return f"{BASE}{slug}/"


def frontmatter_lines(lines):
    """Return (fm_lines, close_idx) for a well-formed `---`...`---` block, else (None, None)."""
    if not lines or lines[0] != "---":
        return None, None
    for i in range(1, len(lines)):
        if lines[i] == "---":
            return lines[1:i], i
    return None, None


def main():
    root = os.getcwd()
    violations = []

    prune = {"node_modules", ".git", "api-reference-old", "skills"}
    mdx_files = []
    for dirpath, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in prune]
        for name in files:
            if name.endswith(".mdx"):
                rel = os.path.relpath(os.path.join(dirpath, name), root)
                mdx_files.append(rel.replace(os.sep, "/"))
    mdx_files.sort()

    for rel in mdx_files:
        if any(rel.startswith(p) for p in EXCLUDE_PREFIXES):
            continue
        if rel.startswith(SNIPPET_PREFIX):
            continue  # includes: no frontmatter expected

        if rel.startswith("docs/"):
            violations.append(
                f"{rel}: page lives under a top-level 'docs/' folder -> would serve "
                f"at a broken double '/docs/docs/...' URL. Move it up one level."
            )

        raw = open(rel, "rb").read()
        if raw.startswith(b"\xef\xbb\xbf"):
            violations.append(f"{rel}: file starts with a UTF-8 BOM (breaks frontmatter parsing).")
            raw = raw[3:]
        # Normalize CRLF/CR so a Windows-authored file isn't misreported as a
        # malformed fence (Mintlify/gray-matter parse CRLF fine). .gitattributes
        # also pins *.mdx to LF as defense-in-depth.
        text = raw.decode("utf-8", errors="replace").replace("\r\n", "\n").replace("\r", "\n")
        lines = text.split("\n")

        first = lines[0] if lines else ""
        if first != "---":
            if first.strip().startswith("---") or first.lstrip("﻿").startswith("---"):
                violations.append(
                    f"{rel}: malformed opening frontmatter fence {first!r} (must be exactly '---'). "
                    f"Trailing whitespace makes Mintlify ignore title/description/canonical."
                )
            else:
                violations.append(f"{rel}: missing opening frontmatter fence (first line {first!r}).")
            continue  # can't trust the rest of the block

        fm, close_idx = frontmatter_lines(lines)
        if fm is None:
            violations.append(f"{rel}: no closing '---' frontmatter fence found.")
            continue

        keys = {}
        for line in fm:
            m = re.match(r"^([A-Za-z0-9_]+):\s*(.*)$", line)
            if m:
                keys[m.group(1)] = m.group(2).strip().strip("'\"")

        is_openapi = "openapi" in keys

        canonical = keys.get("canonical")
        if canonical is None:
            violations.append(f"{rel}: missing 'canonical' in frontmatter.")
        else:
            exp = expected_canonical(rel)
            if canonical != exp:
                violations.append(f"{rel}: canonical {canonical!r} != expected {exp!r}.")

        if not is_openapi and not keys.get("title"):
            violations.append(f"{rel}: missing 'title' in frontmatter.")

    if violations:
        print("Frontmatter check FAILED with the following issues:\n", file=sys.stderr)
        for v in violations:
            print(f"  - {v}", file=sys.stderr)
        print(f"\n{len(violations)} issue(s). See .github/scripts/check_frontmatter.py.", file=sys.stderr)
        return 1

    print(f"Frontmatter check passed ({len(mdx_files)} .mdx files scanned).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
