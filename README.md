# Kanoniv Spec

**The open standard for declarative identity resolution**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

---

## What is Kanoniv?

Kanoniv is a **specification** for defining entity truth as code. It provides:

- **A declarative YAML format** for identity resolution rules
- **A JSON Schema** for validation
- **A CLI validator** for CI/CD integration
- **dbt integration** for data pipelines

Kanoniv answers the question: *"When are two records the same thing?"*

---

## Quick Example

```yaml
# identity.kanoniv.yaml
apiVersion: kanoniv.io/v1
kind: IdentitySpec
metadata:
  name: customer-identity
  version: "1.0.0"

spec:
  entity: customer
  
  sources:
    - name: shopify_customers
      table: raw.shopify.customers
      key: email
      
    - name: stripe_customers  
      table: raw.stripe.customers
      key: email

  matching:
    - rule: email-exact
      type: exact
      field: email
      weight: 0.95
      
    - rule: name-fuzzy
      type: fuzzy
      field: full_name
      algorithm: jaro_winkler
      threshold: 0.85
      weight: 0.7

  survivorship:
    - field: email
      strategy: most_recent
    - field: phone
      strategy: most_complete
```

---

## Validate Your Spec

```bash
# Install the validator
cargo install kanoniv-validator

# Validate your spec
kanoniv validate identity.kanoniv.yaml

# Output:
# ✓ Schema valid
# ✓ Sources defined: 2
# ✓ Matching rules: 2
# ✓ No circular dependencies
```

---

## dbt Integration

```bash
# Install the dbt package
dbt deps  # with packages.yml pointing to kanoniv/dbt-kanoniv

# Generate canonical views
dbt run --select kanoniv.*
```

This generates:
- `canonical_customers` — Resolved identity table
- `customer_lineage` — Source attribution

---

## Specification Reference

| Field | Type | Description |
|-------|------|-------------|
| `apiVersion` | string | Always `kanoniv.io/v1` |
| `kind` | string | Always `IdentitySpec` |
| `metadata.name` | string | Unique identifier |
| `metadata.version` | semver | Spec version |
| `spec.entity` | string | Entity type (customer, product, etc.) |
| `spec.sources[]` | array | Data sources to resolve |
| `spec.matching[]` | array | Matching rules |
| `spec.survivorship[]` | array | Field-level merge strategies |

Full schema: [`schema/identity-spec.json`](schema/identity-spec.json)

---

## Repository Structure

```
kanoniv-spec/
├── spec/                    # Specification documents
│   └── v1.md               # v1 specification
├── schema/                  # JSON Schema
│   └── identity-spec.json  # Validation schema
├── examples/                # Example specs
│   ├── customer.yaml       # Customer identity
│   ├── product.yaml        # Product identity
│   └── multi-source.yaml   # Complex example
└── README.md
```

---

## Related Projects

| Project | Description |
|---------|-------------|
| [kanoniv/validator](https://github.com/kanoniv/validator) | CLI validator |
| [kanoniv/dbt-kanoniv](https://github.com/kanoniv/dbt-kanoniv) | dbt package |
| [kanoniv/examples](https://github.com/kanoniv/examples) | Tutorials |

---

## Commercial Runtime

Need reconciliation, persistence, and orchestration?

**[Kanoniv Cloud](https://kanoniv.com/pricing)** provides:
- Managed identity resolution engine
- REST API
- Dashboard & observability
- SSO, compliance, support

---

## License

Apache 2.0 — See [LICENSE](LICENSE) for details.
