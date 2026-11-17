#!/usr/bin/env bash
# Runs the docs checks before a pull request: the site-wide CI checks, the line checks on the .mdx
# files changed against origin/main, and a search for [UNVERIFIED] markers. Prints a summary and
# exits 1 if anything failed. Run from anywhere in the repo:
#   .claude/scripts/check-docs.sh
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

base=$(git merge-base origin/main HEAD 2>/dev/null || git merge-base main HEAD 2>/dev/null || echo HEAD)
changed=()
while IFS= read -r f; do
  [[ -f "$f" ]] && changed+=("$f")
done < <( { git diff --name-only --diff-filter=d "$base" -- '*.mdx'; git ls-files --others --exclude-standard -- '*.mdx'; } | sort -u)

failed=()
run () {
  local name=$1; shift
  echo "== $name"
  if "$@"; then echo "   ok"; else failed+=("$name"); fi
}

run "frontmatter" python3 .github/scripts/check_frontmatter.py
run "anchors" npm run --silent check:anchors
run "links" npm run --silent check:links
run "snippet typecheck" npm run --silent check:snippets
if [[ -f .github/scripts/check-casing.mjs ]]; then
  run "casing" node .github/scripts/check-casing.mjs
fi

if (( ${#changed[@]} > 0 )); then
  run "line checks" node .claude/hooks/check-mdx.mjs "${changed[@]}"
  echo "== [UNVERIFIED] markers"
  if grep -n '\[UNVERIFIED\]' "${changed[@]}"; then failed+=("[UNVERIFIED] markers"); else echo "   ok"; fi
  echo "== words per changed page"
  wc -w "${changed[@]}" | sed 's/^/   /'
else
  echo "== no changed .mdx files against $base"
fi

if (( ${#failed[@]} > 0 )); then
  echo
  echo "FAILED: ${failed[*]}"
  exit 1
fi
echo
echo "All docs checks passed."
