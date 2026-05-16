# dead-routes

Your codebase has dead routes and unused exports. This finds them.

One command scans your project and outputs every route that's never called and every export that's never imported. Works with Express, Fastify, and Next.js.

## Install

Run this at your project root:

```bash
npx dead-routes .
```

You'll get a list of dead API routes and unused exports with file paths and line numbers.

## Quick Start

```bash
# Scan current project
npx dead-routes .

# Output as JSON (for CI/CD)
npx dead-routes . --json

# Only high-confidence issues
npx dead-routes . --confidence high

# Ignore patterns
npx dead-routes . --ignore "**/*.test.ts" "components/ui/**"
```

## Output

```
🔍 dead-routes v0.1.0 — scanning [Next.js]

  🔴 Dead API routes (1)
     GET /api/cron/daily-song       → app/api/cron/daily-song/route.ts:1

  🟡 Unused exports (12)
     calculateDiscount              → lib/utils.ts:0
     validateEmail                  → lib/utils.ts:0

──────────────────────────────────
13 issues found  •  1 critical  •  ⏱️  318ms
```

Red 🔴 for dead routes. Yellow 🟡 for unused exports. Summary at the bottom with total count and scan time.

## What It Detects

### Dead API Routes

Endpoints defined in your code that are **never called** by any HTTP client.

```typescript
// server.ts
app.get('/api/users', handler)        // ✅ Called in client.ts
app.get('/api/legacy', handler)       // ❌ Dead — never called
```

```typescript
// client.ts
fetch('/api/users')  // Matches the first route
```

`GET /api/legacy` is flagged as dead.

### Unused Exports

Functions, variables, or components exported but **never imported** anywhere.

```typescript
// utils.ts
export function formatPrice(n) { ... }     // ✅ Used in display.ts
export function calculateTax(n) { ... }    // ❌ Dead — never imported
```

`calculateTax()` is flagged as unused.

## Supported Frameworks

| Framework | Status | Detection |
|-----------|--------|-----------|
| Express | ✅ Full | `app.get()`, `router.post()`, etc. |
| Fastify | ✅ Full | `fastify.get()`, route config |
| Next.js App Router | ✅ Full | `app/api/*/route.ts`, implicit files |
| Next.js Pages Router | ✅ Full | `pages/api/*.ts` |
| Hono | 🟡 Coming | — |
| Remix | 🟡 Coming | — |

## Configuration

Create a `.deadroutesrc.json` in your project root:

```json
{
  "ignore": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "components/ui/**"
  ],
  "confidence": "medium"
}
```

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `ignore` | `string[]` | `[]` | Glob patterns to skip |
| `confidence` | `"high" \| "medium" \| "low"` | `"medium"` | Minimum confidence level |
| `frameworks` | `string[]` | auto-detect | Frameworks to analyze |

CLI flags always override config values.

## CLI Reference

```
Usage: dead-routes [directory] [options]

Options:
  --json              Output as structured JSON
  --confidence <level>  Filter by confidence: high, medium, low
  --ignore <pattern>    Glob patterns to ignore (repeatable)
  -v, --version       Display version number
  -h, --help          Display help
```

`--json` produces a parsable object on stdout. Always valid JSON, even on errors.

## CI/CD Integration

### GitHub Actions

```yaml
name: Check Dead Routes

on:
  pull_request:
  push:
    branches: [main]

jobs:
  dead-routes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npx dead-routes . --json > report.json
      - run: |
          CRITICAL=$(jq '.summary.critical' report.json)
          if [ "$CRITICAL" -gt 0 ]; then
            echo "Found $CRITICAL critical dead code issues"
            jq '.issues[] | select(.severity=="critical")' report.json
            exit 1
          fi
```

### GitLab CI

```yaml
dead-routes:
  stage: test
  script:
    - npx dead-routes . --json --confidence high
  allow_failure: true
```

## How It Works

```
1. Scanning
   └─ Collect all TypeScript/JavaScript files (respects .gitignore)

2. Framework Detection
   └─ Detect Express, Fastify, Next.js based on file structure and imports

3. Parsing
   ├─ Extract all imports/exports using TypeScript AST
   ├─ Extract route definitions (framework-specific)
   └─ Extract HTTP calls (fetch, axios, ky, got, http, https)

4. Analysis
   ├─ Build dependency graph
   ├─ Match routes with HTTP calls
   ├─ Match exports with imports (supports path aliases from tsconfig.json)
   └─ Identify unused routes and exports

5. Reporting
   └─ Format results as Terminal or JSON
```

## Architecture

```
src/
├── cli/              # CLI entry point
├── scanner/          # File system scanning
├── parsers/          # AST parsing
│   ├── importParser.ts
│   ├── routeParser.ts
│   └── httpCallParser.ts
├── adapters/         # Framework-specific parsers
│   ├── expressAdapter.ts
│   ├── fastifyAdapter.ts
│   └── nextjsAdapter.ts
├── analyzers/        # Dead code logic
├── graph/            # Dependency graph
├── reporters/        # Output formatters
└── types/            # TypeScript definitions
```

## Development

```bash
git clone https://github.com/offluisangel/dead-routes
cd dead-routes
npm install
npm run build
npm test
```

Run against any project:

```bash
node dist/cli/index.js /path/to/your/project
```

## Contributing

Contributions welcome! Areas to improve:

- [ ] Monorepo support
- [ ] Component detection (React/Vue/Svelte)
- [ ] Server actions detection (Next.js)
- [ ] More frameworks (Hono, Remix, NestJS)
- [ ] `--fix` flag with auto-delete suggestions
- [ ] HTML report generator
- [ ] Watch mode for development

Find a bug? [Open an issue](https://github.com/offluisangel/dead-routes/issues).

## License

MIT © 2026 Luis Angel Martinez
