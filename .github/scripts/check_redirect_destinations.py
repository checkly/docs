#!/usr/bin/env python3
"""Verify every legacy /reference/* redirect in docs.json points at an on-disk page.

These redirects (generated from .github/reference-slug-map.json, the frozen
ReadMe-era slug set) are inbound-only: no docs page links to /reference/*, so
`mint broken-links` never walks them and a page rename/delete would dead-end
their destinations silently. This check closes that gap. It must run on any
PR that touches .mdx files or docs.json — a rename PR is exactly the event
it exists to catch.
"""
import json
import pathlib
import sys

root = pathlib.Path(__file__).resolve().parents[2]
docs = json.loads((root / "docs.json").read_text())

pages = {
    "/" + str(p.relative_to(root))[: -len(".mdx")]
    for p in root.rglob("*.mdx")
    if "node_modules" not in p.parts
}

broken = []
for redirect in docs.get("redirects", []):
    if not redirect["source"].startswith("/reference/"):
        continue
    destination = redirect["destination"].split("#")[0]
    if destination not in pages:
        broken.append(f"{redirect['source']} -> {redirect['destination']}")

if broken:
    print(f"{len(broken)} /reference/* redirect destination(s) have no matching .mdx page:")
    print("\n".join(broken))
    sys.exit(1)

checked = sum(1 for r in docs.get("redirects", []) if r["source"].startswith("/reference/"))
print(f"OK: {checked} /reference/* redirect destinations all resolve to on-disk pages")
