#\!/bin/bash

extract_parent() {
    local file="$1"
    # Get frontmatter only (between first two --- lines)
    local frontmatter=$(awk '/^---$/{if(++count==2) exit} count==1' "$file")
    
    # Extract parent field, handling both quoted and unquoted values
    local parent=$(echo "$frontmatter" | grep -E "^\s*parent:" | sed 's/^\s*parent:\s*//' | sed 's/^["\x27]//' | sed 's/["\x27]$//')
    
    echo "$parent"
}

echo "# Parent Field Analysis for /learn Directory MDX Files"
echo
echo "## Summary by Main Directory"
echo

echo "### INCIDENTS (learn/incidents/)"
incidents_parents=()
for file in learn/incidents/*.mdx; do
    parent=$(extract_parent "$file")
    filename=$(basename "$file")
    if [[ -n "$parent" ]]; then
        incidents_parents+=("$parent")
        echo "- $filename → **$parent**"
    else
        echo "- $filename → *(no parent)*"
    fi
done

echo
echo "### KUBERNETES (learn/kubernetes/)"
kubernetes_parents=()
for file in learn/kubernetes/*.mdx; do
    parent=$(extract_parent "$file")
    filename=$(basename "$file")
    if [[ -n "$parent" ]]; then
        kubernetes_parents+=("$parent")
        echo "- $filename → **$parent**"
    else
        echo "- $filename → *(no parent)*"
    fi
done

echo
echo "### MONITORING (learn/monitoring/)"
monitoring_parents=()
for file in learn/monitoring/*.mdx; do
    parent=$(extract_parent "$file")
    filename=$(basename "$file")
    if [[ -n "$parent" ]]; then
        monitoring_parents+=("$parent")
        echo "- $filename → **$parent**"
    else
        echo "- $filename → *(no parent)*"
    fi
done

echo
echo "### OPENTELEMETRY (learn/opentelemetry/)"
opentelemetry_parents=()
for file in learn/opentelemetry/*.mdx; do
    parent=$(extract_parent "$file")
    filename=$(basename "$file")
    if [[ -n "$parent" ]]; then
        opentelemetry_parents+=("$parent")
        echo "- $filename → **$parent**"
    else
        echo "- $filename → *(no parent)*"
    fi
done

echo
echo "### PLAYWRIGHT (learn/playwright/)"
playwright_parents=()
for file in learn/playwright/*.mdx; do
    parent=$(extract_parent "$file")
    filename=$(basename "$file")
    if [[ -n "$parent" ]]; then
        playwright_parents+=("$parent")
        echo "- $filename → **$parent**"
    else
        echo "- $filename → *(no parent)*"
    fi
done

echo
echo "### OVERVIEW (learn/)"
overview_parents=()
for file in learn/overview.mdx; do
    parent=$(extract_parent "$file")
    filename=$(basename "$file")
    if [[ -n "$parent" ]]; then
        overview_parents+=("$parent")
        echo "- $filename → **$parent**"
    else
        echo "- $filename → *(no parent)*"
    fi
done

echo
echo "## Unique Parent Values by Category"
echo

echo "### INCIDENTS Parents:"
printf '%s\n' "${incidents_parents[@]}" | sort -u | while read -r parent; do
    echo "- $parent"
done

echo
echo "### MONITORING Parents:"
printf '%s\n' "${monitoring_parents[@]}" | sort -u | while read -r parent; do
    echo "- $parent"
done

echo
echo "### OPENTELEMETRY Parents:"
printf '%s\n' "${opentelemetry_parents[@]}" | sort -u | while read -r parent; do
    echo "- $parent"
done

echo
echo "### PLAYWRIGHT Parents:"
printf '%s\n' "${playwright_parents[@]}" | sort -u | while read -r parent; do
    echo "- $parent"
done

