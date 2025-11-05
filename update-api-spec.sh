#!/bin/bash

# Script to fetch and update the Checkly API specification from the live endpoint

set -e

LIVE_API_URL="https://api.checklyhq.com/openapi.json"
API_SPEC_PATH="./api-reference/openapi.json"
TEMP_FILE="/tmp/checkly_openapi.json"

echo "📥 Fetching live API specification from $LIVE_API_URL..."
curl -s "$LIVE_API_URL" > "$TEMP_FILE"

if [ ! -s "$TEMP_FILE" ]; then
    echo "❌ Failed to fetch API specification"
    exit 1
fi

echo "🔧 Cleaning up HTML in descriptions..."
# Convert common HTML tags to Markdown in the authorization description
# Use cross-platform sed syntax (works on both macOS and Linux)
if sed --version 2>&1 | grep -q GNU; then
  # GNU sed (Linux)
  sed -i 's|<a[^>]*href=\\"\([^"]*\)\\"[^>]*>\([^<]*\)</a>|[\2](\1)|g' "$TEMP_FILE"
  sed -i 's|</br>|\n|g' "$TEMP_FILE"
  sed -i 's|<br>|\n|g' "$TEMP_FILE"
  sed -i 's|<b>\([^<]*\)</b>|**\1**|g' "$TEMP_FILE"
  sed -i 's|<code>\([^<]*\)</code>|`\1`|g' "$TEMP_FILE"
else
  # BSD sed (macOS)
  sed -i.tmp 's|<a[^>]*href=\\"\([^"]*\)\\"[^>]*>\([^<]*\)</a>|[\2](\1)|g' "$TEMP_FILE"
  sed -i.tmp 's|</br>|\n|g' "$TEMP_FILE"
  sed -i.tmp 's|<br>|\n|g' "$TEMP_FILE"
  sed -i.tmp 's|<b>\([^<]*\)</b>|**\1**|g' "$TEMP_FILE"
  sed -i.tmp 's|<code>\([^<]*\)</code>|`\1`|g' "$TEMP_FILE"
fi

echo "✅ Validating OpenAPI specification..."
npm exec mintlify openapi-check "$TEMP_FILE"

echo "🔄 Updating API specification..."
cp "$TEMP_FILE" "$API_SPEC_PATH"

echo "🧹 Cleaning up temporary files..."
rm -f "$TEMP_FILE"

echo "🎉 API specification updated successfully!"
echo "📁 Updated file: $API_SPEC_PATH"

# Validate the final result
echo "🔍 Final validation..."
npm exec mintlify openapi-check "$API_SPEC_PATH"