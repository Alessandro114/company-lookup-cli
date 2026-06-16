# company

Look up any company in the terminal.

```bash
npx company Ferrero
```

```
  Ferrero International S.A.
  ──────────────────────────────
  📍 Alba, IT
  🏭 Cocoa, chocolate and sugar confectionery
  📋 S.A.
  📊 active

  Revenue     €17.0B
  Employees   41,000
  Health      ████████████████████░░░░ 92/100

  Founded:  1946
  VAT:      IT02727330014

  Web:      ferrero.com
```

**250M+ companies. 50+ countries. No signup needed.**

## Install

```bash
npm install -g company
```

Or use directly (no install):

```bash
npx company "Siemens AG"
```

## Usage

```bash
# Search by name
company Tesla
company "Deutsche Bank"

# Filter by country
company Ferrero --country IT
company Siemens -c DE

# Look up by VAT number
company IT02727330014

# JSON output
company LVMH --json

# Multiple results
company pizza
```

## What you get

| Field | Description |
|-------|-------------|
| Revenue | Annual revenue in EUR |
| Employees | Headcount |
| Health Score | 0-100 credit/health rating |
| NACE code | Industry classification |
| Legal form | Company type (S.r.l., GmbH, etc.) |
| Status | Active / Inactive |
| Location | City, country |
| VAT | Tax identification number |
| Founded | Incorporation date |
| Contact | Website, phone, email |

## Data

- **250M+ companies** across 50+ countries
- Sources: official government business registries
- Free tier: 50 lookups/month, no signup

## Related tools

| Tool | What it does |
|------|-------------|
| **[enrich-companies](https://www.npmjs.com/package/enrich-companies)** | Enrich a CSV file with company data |
| **[enrich-companies (Python)](https://pypi.org/project/enrich-companies/)** | Same, but Python |
| **[scala-mcp-server](https://www.npmjs.com/package/scala-mcp-server)** | MCP server for AI agents |
| **[Score Company Lookup](https://chromewebstore.google.com/detail/score-company-lookup/)** | Chrome extension |
| **[scala-score](https://pypi.org/project/scala-score/)** | Python SDK |
| **[world-company-database](https://github.com/Alessandro114/world-company-database)** | Bulk dataset |

## License

MIT
