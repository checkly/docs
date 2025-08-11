#!/bin/bash

# Script to fetch and update the Checkly API specification from the live endpoint
# This converts Swagger 2.0 to OpenAPI 3.0 format for Mintlify compatibility

set -e

LIVE_API_URL="https://api.checklyhq.com/swagger.json"
API_SPEC_PATH="./api-reference/openapi.json"
TEMP_FILE="/tmp/checkly_swagger.json"
TEMP_CONVERTED="/tmp/checkly_openapi3.json"

echo "📥 Fetching live API specification from $LIVE_API_URL..."
curl -s "$LIVE_API_URL" > "$TEMP_FILE"

if [ ! -s "$TEMP_FILE" ]; then
    echo "❌ Failed to fetch API specification"
    exit 1
fi

echo "🔄 Converting Swagger 2.0 to OpenAPI 3.0..."
swagger2openapi "$TEMP_FILE" -o "$TEMP_CONVERTED"

if [ ! -s "$TEMP_CONVERTED" ]; then
    echo "❌ Failed to convert API specification"
    exit 1
fi

echo "🔧 Cleaning up HTML in descriptions..."
# Convert common HTML tags to Markdown in the authorization description
sed -i.tmp 's|<a href="\([^"]*\)" target="_blank">here</a>|[here](\1)|g' "$TEMP_CONVERTED"
sed -i.tmp 's|</br>|\n|g' "$TEMP_CONVERTED"
sed -i.tmp 's|<br>|\n|g' "$TEMP_CONVERTED"
sed -i.tmp 's|<b>\([^<]*\)</b>|**\1**|g' "$TEMP_CONVERTED"
sed -i.tmp 's|<code>\([^<]*\)</code>|`\1`|g' "$TEMP_CONVERTED"

# Clean up any remaining HTML line breaks and improve formatting for curl examples
sed -i.tmp '/curl -H/,/\]/c\
For example, set **Authorization** header while using cURL:\n```bash\ncurl -H "Authorization: Bearer [apiKey]" "X-Checkly-Account: [accountId]"\n```' "$TEMP_CONVERTED"

rm -f "${TEMP_CONVERTED}.tmp"

echo "✅ Validating OpenAPI specification..."
mintlify openapi-check "$TEMP_CONVERTED"

echo "📝 Creating backup of current specification..."
if [ -f "$API_SPEC_PATH" ]; then
    cp "$API_SPEC_PATH" "${API_SPEC_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
fi

echo "🔄 Updating API specification..."
cp "$TEMP_CONVERTED" "$API_SPEC_PATH"

echo "🧹 Cleaning up temporary files..."
rm -f "$TEMP_FILE" "$TEMP_CONVERTED"

echo "🎉 API specification updated successfully!"
echo "📁 Updated file: $API_SPEC_PATH"

# Validate the final result
echo "🔍 Final validation..."
mintlify openapi-check "$API_SPEC_PATH"