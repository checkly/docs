/**
 * yaml-lite.mjs
 *
 * Minimal YAML parser — only supports the subset used by .api-doc-ignore:
 *   key: []                  → { key: [] }
 *   key:
 *     - "value"              → { key: ["value"] }
 *     - value                → { key: ["value"] }
 *
 * Does NOT support nested objects, multi-line strings, anchors, etc.
 * For anything more complex, use a real YAML parser.
 */

export function parse(text) {
  const result = {};
  let currentKey = null;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/#.*$/, '').trimEnd(); // strip comments
    if (!line.trim()) continue;

    // Key with inline empty array: "key: []"
    const emptyArrayMatch = line.match(/^(\w[\w\s]*?):\s*\[\]\s*$/);
    if (emptyArrayMatch) {
      currentKey = emptyArrayMatch[1].trim();
      result[currentKey] = [];
      continue;
    }

    // Key declaration: "key:" or "key: value"
    const keyMatch = line.match(/^(\w[\w\s]*?):\s*(.*)$/);
    if (keyMatch && !line.startsWith(' ') && !line.startsWith('-')) {
      currentKey = keyMatch[1].trim();
      const val = keyMatch[2].trim();
      if (val) {
        result[currentKey] = val.replace(/^["']|["']$/g, '');
      } else {
        result[currentKey] = [];
      }
      continue;
    }

    // Array item: "  - value" or '  - "value"'
    const itemMatch = line.match(/^\s+-\s+(.+)$/);
    if (itemMatch && currentKey) {
      const val = itemMatch[1].trim().replace(/^["']|["']$/g, '');
      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = [];
      }
      result[currentKey].push(val);
      continue;
    }
  }

  return result;
}
