#!/usr/bin/env python3
"""Generate managed endpoint badges and warnings from OpenAPI lifecycle flags."""

import argparse
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
GROUPS = ("usage", "status-pages", "status-page-incidents", "status-page-services")
NOTICES = {
    "Beta": ("UsageBeta", "/snippets/usage-v2-beta.mdx"),
    "Deprecated": ("StatusPagesDeprecated", "/snippets/status-pages-deprecated.mdx"),
}
STATUS_TAG = re.compile(r"^tag: ['\"]?(?:Beta|Deprecated)['\"]?$(?:\n)?", re.MULTILINE)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail if generated page metadata is out of date")
    args = parser.parse_args()
    spec = json.loads((ROOT / "api-reference/openapi.json").read_text(), strict=False)
    changes = []

    for group in GROUPS:
        for page in sorted((ROOT / "api-reference" / group).glob("*.mdx")):
            original = page.read_text()
            frontmatter = re.match(r"\A---\n(.*?)\n---(?:\n|\Z)", original, re.DOTALL)
            if not frontmatter:
                raise ValueError(f"Invalid frontmatter: {page.relative_to(ROOT)}")
            header = frontmatter[1]
            endpoint = re.search(r"^openapi: (get|post|put|patch|delete|head|options) (\S+)$", header, re.MULTILINE)
            if not endpoint:
                continue
            method, path = endpoint.groups()
            operation = spec["paths"][path][method]
            if operation.get("deprecated") is True:
                status = "Deprecated"
            elif operation.get("x-beta") is True:
                status = "Beta"
            else:
                status = None

            if not status and not STATUS_TAG.search(header) and not any(
                f"<{component}" in original for component, _ in NOTICES.values()
            ):
                continue

            header = STATUS_TAG.sub("", header).rstrip()
            body = original[frontmatter.end():]
            for component, snippet in NOTICES.values():
                body = re.sub(rf"^import {component} from ['\"]{re.escape(snippet)}['\"];?\n?", "", body, flags=re.MULTILINE)
                body = re.sub(rf"^<{component}\s*/>\n?", "", body, flags=re.MULTILINE)

            if status:
                lines = header.splitlines()
                index = next((i for i, line in enumerate(lines) if line.startswith("canonical:")), len(lines))
                lines.insert(index, f"tag: '{status}'")
                header = "\n".join(lines)
                component, snippet = NOTICES[status]
                body = f'import {component} from "{snippet}";\n\n<{component} />\n\n' + body.lstrip("\n")
            updated = f"---\n{header}\n---"
            if body.strip():
                updated += "\n\n" + body.strip("\n") + "\n"
            else:
                updated += "\n"

            if updated != original:
                changes.append(str(page.relative_to(ROOT)))
                if not args.check:
                    page.write_text(updated)

    if changes:
        print(("Out-of-date" if args.check else "Updated") + " endpoint status metadata:")
        print("\n".join(changes))
    else:
        print("Endpoint status metadata matches OpenAPI lifecycle flags.")
    return 1 if args.check and changes else 0


if __name__ == "__main__":
    raise SystemExit(main())
