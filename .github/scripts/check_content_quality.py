#!/usr/bin/env python3
"""Fail when documentation content introduces a new quality violation.

The committed baseline makes adoption incremental: existing violations are
reported but do not fail CI. A violation disappears automatically when its
content is fixed; regenerate the baseline in the same change to remove resolved
entries. Do not add a new baseline entry without reviewing the underlying page.
"""

import argparse
import json
import pathlib
import re
import sys
from collections import defaultdict


ROOT = pathlib.Path(__file__).resolve().parents[2]
BASELINE = ROOT / ".github" / "content-quality-baseline.json"
EXCLUDED_DIRS = {".git", "node_modules", "api-reference-old", "skills"}
EDITORIAL_EXCLUDED_PREFIXES = ("api-reference/", "snippets/")
INTERNAL_DOCS_HOSTS = ("checklyhq.com/docs", "www.checklyhq.com/docs", "docs.checklyhq.com")


def mdx_files():
    return sorted(
        path
        for path in ROOT.rglob("*.mdx")
        if not any(part in EXCLUDED_DIRS for part in path.relative_to(ROOT).parts)
    )


def frontmatter(text):
    lines = text.splitlines()
    if not lines or lines[0] != "---":
        return {}, 0
    for index in range(1, len(lines)):
        if lines[index] == "---":
            values = {}
            active_key = None
            for line in lines[1:index]:
                match = re.match(r"^([A-Za-z0-9_]+):\s*(.*)$", line)
                if match:
                    active_key = match.group(1)
                    values[active_key] = match.group(2).strip().strip("'\"")
                elif active_key and re.match(r"^\s+\S", line) and not line.lstrip().startswith("-"):
                    continuation = line.strip().strip("'\"")
                    values[active_key] = " ".join(part for part in (values[active_key], continuation) if part)
                elif line and not line[0].isspace():
                    active_key = None
            return values, index + 1
    return {}, 0


def navigation_pages():
    docs = json.loads((ROOT / "docs.json").read_text(encoding="utf-8"))
    pages = set()

    def walk(value):
        if isinstance(value, list):
            for item in value:
                walk(item)
        elif isinstance(value, dict):
            for key, item in value.items():
                if key == "pages" and isinstance(item, list):
                    for page in item:
                        if isinstance(page, str):
                            pages.add(page.strip("/"))
                        else:
                            walk(page)
                else:
                    walk(item)

    walk(docs.get("navigation", {}))
    return pages


def add(violations, rule, path, detail):
    violation_id = f"{rule}|{path}|{detail}"
    violations[violation_id] = {"rule": rule, "path": path, "detail": detail}


def scan():
    violations = {}
    titles = defaultdict(list)
    descriptions = defaultdict(list)
    nav_pages = navigation_pages()

    for path in mdx_files():
        rel = path.relative_to(ROOT).as_posix()
        text = path.read_text(encoding="utf-8")
        metadata, body_start = frontmatter(text)
        lines = text.splitlines()
        editorial = not rel.startswith(EDITORIAL_EXCLUDED_PREFIXES)

        if editorial:
            for key in ("title", "sidebarTitle", "description"):
                if not metadata.get(key):
                    add(violations, f"frontmatter-{key}", rel, f"missing {key}")

            title = metadata.get("title", "").strip().casefold()
            description = metadata.get("description", "").strip().casefold()
            if title:
                titles[title].append(rel)
            if description:
                descriptions[description].append(rel)

            raw_description = metadata.get("description", "")
            if len(raw_description) > 160:
                add(violations, "description-length", rel, f"{len(raw_description)} characters")

            slug = rel[:-4]
            indexed = slug == "index" or slug in nav_pages
            intentionally_hidden = metadata.get("hidden", "").casefold() == "true"
            intentionally_noindex = metadata.get("noindex", "").casefold() == "true"
            if not indexed and not intentionally_hidden and not intentionally_noindex:
                add(violations, "indexation", rel, "not in navigation and not marked hidden/noindex")

        in_fence = False
        for line_number, line in enumerate(lines[body_start:], start=body_start + 1):
            fence = re.match(r"^\s*```(.*)$", line)
            if fence:
                if not in_fence and not fence.group(1).strip():
                    add(violations, "code-fence-language", rel, f"line {line_number}")
                in_fence = not in_fence
                continue
            if in_fence:
                continue

            if re.match(r"^#\s+\S", line):
                add(violations, "source-h1", rel, f"line {line_number}")

            destinations = re.findall(r"(?:\[[^\]]*\]\(|\bhref=[\"'])(https?://[^\s)\"']+)", line)
            for destination in destinations:
                host_and_path = re.sub(r"^https?://", "", destination).casefold()
                if any(host_and_path.startswith(host) for host in INTERNAL_DOCS_HOSTS):
                    add(violations, "absolute-internal-link", rel, f"line {line_number}: {destination}")

    for rule, groups in (("duplicate-title", titles), ("duplicate-description", descriptions)):
        for value, paths in groups.items():
            if len(paths) > 1:
                members = ", ".join(sorted(paths))
                add(violations, rule, members, value)

    return violations


def load_baseline():
    if not BASELINE.exists():
        return set()
    data = json.loads(BASELINE.read_text(encoding="utf-8"))
    return set(data.get("violations", []))


def write_baseline(violations):
    payload = {
        "description": "Accepted pre-AEO-003 content violations. Fix entries; do not add regressions.",
        "violations": sorted(violations),
    }
    BASELINE.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {BASELINE.relative_to(ROOT)} with {len(violations)} violations.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--update-baseline", action="store_true")
    args = parser.parse_args()
    violations = scan()

    if args.update_baseline:
        write_baseline(violations)
        return 0

    baseline = load_baseline()
    current = set(violations)
    new = sorted(current - baseline)
    resolved = sorted(baseline - current)

    if resolved:
        print(f"Resolved baseline violations: {len(resolved)} (run with --update-baseline to prune them).")
    if new:
        print(f"Content quality check FAILED with {len(new)} new violation(s):", file=sys.stderr)
        for violation_id in new:
            item = violations[violation_id]
            print(f"  - [{item['rule']}] {item['path']}: {item['detail']}", file=sys.stderr)
        return 1

    print(f"Content quality check passed ({len(current)} accepted baseline violations, 0 new).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
