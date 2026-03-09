# Fix: OpenAPI Spec Validation Failure in `update-api-spec.sh`

## Problem

The GitHub Actions workflow at `.github/workflows/update-api-spec.yml` fails during the `mintlify openapi-check` validation step with:

```
Failed to validate OpenAPI schema:/components/schemas/IcmpMonitorCreate:
    must have required property '$ref'.
```

## Root Cause

The **upstream API spec** at `https://api.checklyhq.com/openapi.json` contains invalid OpenAPI 3.0 syntax. Specifically, two schemas have a `minimum` field set to a **Joi-style internal reference object** instead of a **number** (which is what OpenAPI 3.0 requires).

### Affected schemas

1. `components.schemas.IcmpMonitorCreate.properties.maxPacketLossThreshold`
2. `components.schemas.IcmpMonitorUpdate.properties.maxPacketLossThreshold`

### What the upstream spec returns (invalid)

```json
"maxPacketLossThreshold": {
  "type": "number",
  "description": "The packet loss percentage threshold for failed state...",
  "default": 20,
  "nullable": true,
  "minimum": {
    "ref": {
      "path": ["degradedPacketLossThreshold"]
    }
  },
  "maximum": 100,
  "x-constraint": {
    "greater": 0
  }
}
```

The `minimum` field is an object (`{ "ref": { "path": ["degradedPacketLossThreshold"] } }`). This is an internal Joi validation reference that leaked into the public OpenAPI spec from Checkly's backend. In OpenAPI 3.0, `minimum` must be a number.

### What it should look like (valid)

```json
"maxPacketLossThreshold": {
  "type": "number",
  "description": "The packet loss percentage threshold for failed state...",
  "default": 20,
  "nullable": true,
  "maximum": 100,
  "x-constraint": {
    "greater": 0
  }
}
```

The invalid `minimum` should simply be removed. The cross-field validation rule ("must be >= degradedPacketLossThreshold") cannot be expressed in OpenAPI 3.0 and is already documented in the `description` text.