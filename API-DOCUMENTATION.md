# API Reference Documentation Architecture

This document outlines how the API reference section is built, maintained, and potential improvements.

## Current Architecture

### Overview

The API reference documentation uses Mintlify's OpenAPI integration. The system has three main components:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           docs.json                                      │
│  - Defines "API" tab with openapi reference                             │
│  - Contains 22 navigation groups                                         │
│  - Lists all 132 page references                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     api-reference/openapi.json                           │
│  - 514KB OpenAPI 3.0.0 specification                                     │
│  - Auto-updated from https://api.checklyhq.com/openapi.json             │
│  - Contains 94 unique API paths                                          │
│  - Source of truth for all endpoint documentation                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    api-reference/{category}/*.mdx                        │
│  - 132 stub files across 29 subdirectories                              │
│  - Minimal content: just frontmatter with `openapi: METHOD /path`        │
│  - Mintlify auto-generates full documentation from OpenAPI spec          │
└─────────────────────────────────────────────────────────────────────────┘
```

### File Structure

```
api-reference/
├── openapi.json                    # OpenAPI 3.0.0 spec (auto-updated)
├── accounts/                       # 3 files
├── alert-channels/                 # 6 files
├── alert-notifications/            # 1 file
├── analytics/                      # 8 files
├── badges/                         # 2 files
├── check-alerts/                   # 2 files
├── check-groups/                   # 9 files
├── check-results/                  # 3 files
├── check-sessions/                 # 3 files
├── check-status/                   # 2 files
├── checks/                         # 13 files
├── client-certificates/            # 4 files
├── dashboards/                     # 5 files
├── environment-variables/          # 5 files
├── heartbeats/                     # 5 files
├── incident-updates/               # 3 files
├── incidents/                      # 4 files
├── location/                       # 1 file
├── maintenance-windows/            # 5 files
├── monitors/                       # 2 files
├── opentelemetry/                  # 1 file (not in nav)
├── private-locations/              # 8 files
├── reporting/                      # 1 file
├── runtimes/                       # 2 files
├── snippets/                       # 5 files
├── static-ips/                     # 6 files
├── status-page-incidents/          # 10 files
├── status-page-services/           # 5 files
├── status-pages/                   # 7 files
└── triggers/                       # 6 files
```

### MDX File Format

Each MDX file is a minimal stub that references an OpenAPI path:

```yaml
---
openapi: get /v1/accounts
---
```

Optional fields:
- `deprecated: true` - marks endpoint as deprecated

Mintlify automatically generates:
- Endpoint description
- HTTP method badge (GET/POST/PUT/DELETE)
- Request parameters table
- Request body schema
- Response schemas for all status codes
- Code examples (cURL, JavaScript, Python)
- "Try it" interactive playground

### docs.json Configuration

Located at lines 577-863, the API tab is configured as:

```json
{
  "tab": "API",
  "openapi": "api-reference/openapi.json",
  "groups": [
    {
      "group": "Accounts",
      "pages": [
        "api-reference/accounts/fetch-user-accounts",
        "api-reference/accounts/fetch-current-account-details",
        "api-reference/accounts/fetch-a-given-account-details"
      ]
    },
    // ... 21 more groups
  ]
}
```

### Automation

#### GitHub Actions Workflow

**File:** `.github/workflows/update-api-spec.yml`

- **Schedule:** Runs every 48 hours (cron: `0 2 */2 * *`)
- **Trigger:** Also supports manual `workflow_dispatch`
- **Process:**
  1. Fetches spec from `https://api.checklyhq.com/openapi.json`
  2. Converts HTML tags in descriptions to Markdown
  3. Validates with `mintlify openapi-check`
  4. Commits directly to `main` if changed

#### Update Script

**File:** `update-api-spec.sh`

```bash
# Key operations:
1. Fetch live spec from API
2. Convert HTML to Markdown (<a> → [](), <br> → \n, <b> → **, <code> → `)
3. Validate OpenAPI spec
4. Replace local file
```

## Current Issues

### 1. MDX/Navigation Sync Issues

The 132 MDX files correctly map to OpenAPI operations (method + path). A single path like `/v1/checks/{id}` can have multiple methods (GET, PUT, DELETE), each requiring its own MDX file.

| Metric | Count |
|--------|-------|
| MDX files | 132 |
| Unique API paths in MDX | 90 |
| HTTP methods breakdown | GET: 67, POST: 26, PUT: 21, DELETE: 18 |

#### Orphaned MDX Files (exist but not in navigation)

| File | OpenAPI Reference |
|------|-------------------|
| `api-reference/opentelemetry/post-accounts-metrics.mdx` | `post /accounts/{accountId}/metrics` |

#### Broken Navigation Links (in docs.json but no MDX file)

| Missing File |
|--------------|
| `api-reference/snippets/list-all-snippets.mdx` |
| `api-reference/snippets/create-a-snippet.mdx` |
| `api-reference/snippets/retrieve-a-snippet.mdx` |
| `api-reference/snippets/update-a-snippet.mdx` |
| `api-reference/snippets/delete-a-snippet.mdx` |
| `api-reference/detect/uptime-monitoring/url-monitors/overview.mdx` |
| `api-reference/detect/uptime-monitoring/url-monitors/configuration.mdx` |

**Summary:** 1 orphaned file + 7 broken links = 8 total issues

### 2. Navigation Inconsistencies

- 22 groups in docs.json, 29 subdirectories in filesystem
- The `opentelemetry/` directory has 1 file but no group in docs.json
- The `snippets/` group exists in docs.json but files have different names or are missing

### 3. Naming Inconsistencies

- Mixed patterns: `list-all-*` vs `lists-all-*`
- Some verbose names: `retrieve-all-checks-in-a-specific-group-with-group-settings-applied`
- Inconsistent verb usage: `fetch` vs `retrieve` vs `get` vs `list`

### 4. Orphaned Files

- Multiple backup files: `openapi.json.backup*`
- Directories with files not in docs.json navigation

### 5. Manual Synchronization Required

- When API spec adds/removes endpoints, MDX files and docs.json must be manually updated
- No automation for generating new MDX stubs or updating navigation

## Potential Improvements

### Short-term

1. **Audit and cleanup**
   - Remove orphaned MDX files that don't map to OpenAPI paths
   - Delete backup files
   - Add missing pages to docs.json or remove unused directories

2. **Fix broken links**
   - Verify all docs.json page references have corresponding MDX files
   - Verify all MDX `openapi:` references exist in openapi.json

3. **Standardize naming**
   - Establish naming conventions (e.g., always `list-` not `lists-`)
   - Keep names concise but descriptive

### Medium-term

4. **Automate MDX generation**
   - Script to generate MDX stubs from OpenAPI paths
   - Script to update docs.json navigation from OpenAPI tags
   - Run as part of the update-api-spec workflow

5. **Leverage OpenAPI tags**
   - OpenAPI spec likely has tags for grouping endpoints
   - Could auto-generate navigation structure from tags

### Long-term

6. **Consider Mintlify auto-generation**
   - Mintlify can auto-generate pages from OpenAPI spec
   - May eliminate need for individual MDX files
   - Trade-off: less control over URL structure and organization

## API Endpoints Summary

### By Category (from OpenAPI spec paths)

| Category | Endpoints |
|----------|-----------|
| accounts | 3 |
| alert-channels | 3 |
| alert-notifications | 1 |
| analytics | 8 |
| badges | 2 |
| check-alerts | 2 |
| check-groups | 4 |
| check-results | 2 |
| check-sessions | 3 |
| check-statuses | 2 |
| checks | 18 |
| client-certificates | 2 |
| dashboards | 2 |
| incidents | 4 |
| locations | 1 |
| maintenance-windows | 2 |
| private-locations | 5 |
| reporting | 1 |
| runtimes | 2 |
| snippets | 2 |
| static-ips | 6 |
| status-pages | 12 |
| triggers | 2 |
| variables | 2 |

## Related Files

| File | Purpose |
|------|---------|
| `docs.json` | Main config, API nav at lines 577-863 |
| `api-reference/openapi.json` | OpenAPI 3.0.0 specification |
| `update-api-spec.sh` | Script to fetch and process spec |
| `.github/workflows/update-api-spec.yml` | Automation workflow |

## Questions to Resolve

1. Should we automate MDX stub generation when the OpenAPI spec changes?
2. Should we consolidate some navigation groups (22 seems high)?
3. Is the opentelemetry endpoint intentionally hidden from navigation?
4. Should deprecated endpoints be removed or kept for backwards compatibility?
5. Would Mintlify's auto-generation feature be preferable to manual MDX files?
