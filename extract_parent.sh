#\!/bin/bash

# Initialize arrays for each category
declare -A incidents_files
declare -A kubernetes_files
declare -A monitoring_files
declare -A opentelemetry_files
declare -A playwright_files
declare -A overview_files

# Function to extract parent from frontmatter
extract_parent() {
    local file="$1"
    # Get frontmatter only (between first two --- lines)
    local frontmatter=$(awk '/^---$/{if(++count==2) exit} count==1' "$file")
    
    # Extract parent field
    local parent=$(echo "$frontmatter" | grep -E "^\s*parent:" | sed 's/^\s*parent:\s*//' | sed 's/^["\x27]//' | sed 's/["\x27]$//')
    
    echo "$parent"
}

echo "=== INCIDENTS ==="
for file in learn/incidents/*.mdx; do
    parent=$(extract_parent "$file")
    filename=$(basename "$file")
    if [[ -n "$parent" ]]; then
        echo "$filename: $parent"
    else
        echo "$filename: (no parent)"
    fi
done

echo
echo "=== KUBERNETES ==="
for file in learn/kubernetes/*.mdx; do
    parent=$(extract_parent "$file")
    filename=$(basename "$file")
    if [[ -n "$parent" ]]; then
        echo "$filename: $parent"
    else
        echo "$filename: (no parent)"
    fi
done

echo
echo "=== MONITORING ==="
for file in learn/monitoring/*.mdx; do
    parent=$(extract_parent "$file")
    filename=$(basename "$file")
    if [[ -n "$parent" ]]; then
        echo "$filename: $parent"
    else
        echo "$filename: (no parent)"
    fi
done

echo
echo "=== OPENTELEMETRY ==="
for file in learn/opentelemetry/*.mdx; do
    parent=$(extract_parent "$file")
    filename=$(basename "$file")
    if [[ -n "$parent" ]]; then
        echo "$filename: $parent"
    else
        echo "$filename: (no parent)"
    fi
done

echo
echo "=== PLAYWRIGHT ==="
for file in learn/playwright/*.mdx; do
    parent=$(extract_parent "$file")
    filename=$(basename "$file")
    if [[ -n "$parent" ]]; then
        echo "$filename: $parent"
    else
        echo "$filename: (no parent)"
    fi
done

echo
echo "=== OVERVIEW ==="
for file in learn/overview.mdx; do
    parent=$(extract_parent "$file")
    filename=$(basename "$file")
    if [[ -n "$parent" ]]; then
        echo "$filename: $parent"
    else
        echo "$filename: (no parent)"
    fi
done
