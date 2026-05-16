# 🔍 dead-routes

> Find dead routes, unused exports, and unreachable code in your Node.js/TypeScript codebase

[![Tests](https://img.shields.io/badge/tests-38%2F38%20passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue)]()
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-green)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

**dead-routes** scans your project and identifies code that's no longer needed — routes that are never called, exports that are never imported, and more. Perfect for keeping your codebase clean and finding code bloat.

## 🚀 Features

- ✅ **Dead API Route Detection** — Find HTTP endpoints that aren't called
- ✅ **Unused Export Detection** — Identify functions/variables that are never imported
- ✅ **Multi-Framework Support** — Express, Fastify, Next.js (with extensibility)
- ✅ **Smart HTTP Detection** — Tracks `fetch()`, `axios`, `ky`, `got`, and more
- ✅ **AST-Based Analysis** — Uses TypeScript parser for reliable detection
- ✅ **Confidence Scoring** — Minimize false positives with certainty levels
- ✅ **CI/CD Ready** — JSON output for automation
- ✅ **Zero Configuration** — Works out of the box

## 📦 Installation

```bash
npm install -D dead-routes
```

Or use directly with `npx`:

```bash
npx dead-routes .
```

## 🎯 Quick Start

### Basic Usage

Scan your current project for dead code:

```bash
npx dead-routes .
```

**Output:**
```
🔍 dead-routes v0.1.0 — scanning

  🔴 Dead API routes (2)
     GET /api/legacy/items        → server.ts:15
     DELETE /api/legacy/items/:id → server.ts:19

  🟡 Unused exports (8)
     calculateTax()               → services.ts:5
     validateEmail()              → services.ts:12

──────────────────────────────────
10 issues found  •  2 critical  •  ⏱️  51ms
```

### What's the difference between outputs?

**1. Terminal Output (default)**
```bash
npx dead-routes .
```
- 🎨 Colored, human-readable format
- 📊 Grouped by issue type
- ⏱️ Shows performance metrics
- Perfect for: **Local development, quick checks**

**Example:**
```
🔴 Dead API routes (2)
   GET /api/legacy/items        → server.ts:15
   DELETE /api/legacy/items/:id → server.ts:19

🟡 Unused exports (8)
   calculateTax()               → services.ts:5
```

**2. JSON Output** (`--json` flag)
```bash
npx dead-routes . --json
```
- 📋 Machine-readable JSON format
- 🔍 Detailed metadata for each issue
- 🤖 Parseable for CI/CD pipelines
- Perfect for: **CI/CD integration, reports, automation**

**Example:**
```json
{
  "version": "0.1.0",
  "timestamp": "2026-05-15T04:14:05.491Z",
  "framework": "express",
  "duration": 59,
  "summary": {
    "total": 10,
    "critical": 2,
    "warning": 8
  },
  "issues": [
    {
      "type": "dead-route",
      "identifier": "GET /api/legacy/items",
      "file": "server.ts",
      "line": 15,
      "confidence": "high",
      "severity": "critical",
      "reason": "Route defined but never called by any HTTP client in the codebase"
    }
  ]
}
```

### How do they work?

**Terminal Output** is designed for developers:
- Colored groups (red 🔴 for critical, yellow 🟡 for warnings)
- File paths with line numbers for quick navigation
- Summary stats at the bottom
- Fast visual scanning

**JSON Output** is designed for automation:
- Every issue has metadata (confidence, severity, reason)
- Structured data for parsing in scripts
- Timestamp for tracking changes over time
- Can be piped into other tools or uploaded to dashboards

## 📖 Usage Guide

### Scan Your Project

```bash
# Scan current directory
npx dead-routes .

# Scan specific folder
npx dead-routes ./src
```

### Filter Results

```bash
# Only show high-confidence issues (fewer false positives)
npx dead-routes . --confidence high

# Medium confidence (default)
npx dead-routes . --confidence medium

# Include low-confidence issues
npx dead-routes . --confidence low
```

### Ignore Patterns

```bash
# Ignore test files
npx dead-routes . --ignore "**/*.test.ts" "**/*.spec.ts"

# Ignore multiple patterns
npx dead-routes . --ignore "**/*.test.*" "migrations/**" "dist/**"
```

### Export Results

```bash
# Output as JSON (for CI/CD)
npx dead-routes . --json > dead-routes-report.json

# Pretty-print JSON
npx dead-routes . --json | jq .

# Use in shell script
if npx dead-routes . --json | jq '.summary.critical' | grep -q '[1-9]'; then
  echo "Critical dead code found!"
  exit 1
fi
```

## ⚙️ Configuration

Create a `.deadroutesrc.json` file in your project root:

```json
{
  "ignore": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/dist/**",
    "**/build/**",
    "migrations/**"
  ],
  "confidence": "medium",
  "frameworks": ["express", "fastify", "nextjs"]
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ignore` | `string[]` | `[]` | Glob patterns to ignore |
| `confidence` | `"high" \| "medium" \| "low"` | `"medium"` | Minimum confidence level for issues |
| `frameworks` | `Framework[]` | auto-detect | Which frameworks to analyze |

### Environment Variables

Override config with environment variables:

```bash
DEAD_ROUTES_CONFIDENCE=high \
DEAD_ROUTES_IGNORE="**/*.test.ts,**/*.spec.ts" \
npx dead-routes .
```

## 🔎 What It Detects

### 🔴 Dead API Routes

Endpoints defined in your code that are **never called** by any HTTP client.

**Example:**
```typescript
// server.ts
app.get('/api/users', handler)        // ✅ Called in client.ts
app.get('/api/legacy', handler)       // ❌ Dead - never called
```

```typescript
// client.ts
fetch('/api/users')  // Matches the first route
```

**Result:** `GET /api/legacy` is flagged as dead.

### 🟡 Unused Exports

Functions, variables, or components exported but **never imported** anywhere.

**Example:**
```typescript
// utils.ts
export function formatPrice(n) { ... }     // ✅ Used in display.ts
export function calculateTax(n) { ... }    // ❌ Dead - never imported
export function validateEmail(e) { ... }   // ❌ Dead - never imported
```

**Result:** `calculateTax()` and `validateEmail()` are flagged as unused.

## 🌐 Supported Frameworks

| Framework | Status | Detection | Route Patterns |
|-----------|--------|-----------|-----------------|
| **Express** | ✅ Full | `app.get()`, `router.post()`, etc. | `/api/users`, `/users/:id` |
| **Fastify** | ✅ Full | `fastify.get()`, route config | `/api/users`, `/users/:id` |
| **Next.js** | ✅ Full | App Router API routes | `/api/users`, `/api/[slug]` |
| **Hono** | 🟡 Ready | Decorator-based routing | Coming soon |
| **Remix** | 🟡 Ready | File-based routing | Coming soon |

## 🧪 Testing Your Own Project

### Before You Start

1. **Commit your code** — Dead routes detection is based on analysis, but it's good practice to have a clean git state
2. **Choose output format** — Use terminal output for quick checks, JSON for detailed analysis
3. **Start with high confidence** — Fewer false positives

### Step-by-Step Guide

**Step 1:** Run a quick scan
```bash
npx dead-routes . --confidence high
```

**Step 2:** Review the results
- Look for routes/exports that are truly unused
- Check the file paths to verify
- Compare with your git history (was it recently removed?)

**Step 3:** Export to JSON for deeper analysis
```bash
npx dead-routes . --json > report.json
```

**Step 4:** Filter by severity
```bash
# Show only critical issues
npx dead-routes . --confidence high

# Show everything
npx dead-routes . --confidence low
```

### Common Issues & Troubleshooting

**"I see exports as unused but they're actually used"**
→ This usually means the import path doesn't match. Check if you're using path aliases (`@/utils` vs `./utils`). This is a known limitation in v0.1.0.

**"A route is showing as dead but it's actually called"**
→ Make sure the HTTP call uses the exact same path format:
- ✅ `fetch('/api/users')` matches `app.get('/api/users')`
- ❌ `fetch('/api/users/')` (trailing slash) might not match

**"Some files are being ignored unexpectedly"**
→ Check your `.deadroutesrc.json` or `--ignore` patterns. By default, `node_modules`, `.git`, and `dist` are ignored.

## 📊 Example Reports

### Express Project
```
🔴 Dead API routes (3)
   POST /api/v1/users/export      → src/routes/users.ts:34
   GET  /api/v1/reports/weekly    → src/routes/reports.ts:12
   PUT  /api/v1/settings/theme    → src/routes/settings.ts:89

🟡 Unused exports (5)
   formatCurrency()               → src/utils/format.ts:23
   parseQueryString()             → src/lib/url.ts:8
   validatePhoneNumber()          → src/validators.ts:15
```

### Next.js Project
```
🟡 Unused exports (2)
   getServerSideProps()           → pages/old-feature.tsx:1
   LegacyComponent()              → components/Legacy.tsx:5
```

### Mixed Codebase
```
🔴 Dead API routes (2)
   GET /api/legacy/items          → server.ts:15
   DELETE /api/legacy/items/:id   → server.ts:19

🟡 Unused exports (8)
   calculateTax()                 → services.ts:5
   validateEmail()                → services.ts:12
```

## 🔗 CI/CD Integration

### GitHub Actions

```yaml
name: Check Dead Routes

on: [push, pull_request]

jobs:
  dead-routes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: |
          npx dead-routes . --json > report.json
          CRITICAL=$(jq '.summary.critical' report.json)
          if [ "$CRITICAL" -gt 0 ]; then
            echo "❌ Found $CRITICAL critical dead code issues"
            jq '.issues[] | select(.severity=="critical")' report.json
            exit 1
          fi
          echo "✅ No critical dead code found"
```

### GitLab CI

```yaml
dead-routes:
  stage: test
  script:
    - npm install
    - npx dead-routes . --json --confidence high
  allow_failure: true
```

## 🏗️ Architecture

```
src/
├── cli/              # CLI entry point
├── scanner/          # File system scanning
├── parsers/          # AST parsing
│   ├── importParser.ts    # import/export analysis
│   ├── routeParser.ts     # route detection interface
│   └── httpCallParser.ts  # HTTP call detection
├── adapters/         # Framework-specific parsers
│   ├── expressAdapter.ts
│   ├── fastifyAdapter.ts
│   └── nextjsAdapter.ts
├── analyzers/        # Dead code logic
├── graph/            # Dependency graph
├── reporters/        # Output formatters
└── types/            # TypeScript definitions
```

## 🤝 Contributing

Contributions welcome! Areas to improve:

- [ ] Path alias support (`@/utils` → `./utils`)
- [ ] Monorepo support
- [ ] Component detection (React/Vue/Svelte)
- [ ] Environment variable analysis
- [ ] More frameworks (Hono, Remix, etc.)

### Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Watch mode
npm test -- --watch

# Build
npm run build

# Type checking
npm run type-check
```

## 📝 Known Limitations

- **v0.1.0 is an MVP** — Some edge cases may have false positives/negatives
- **Path aliases** — `@/utils` imports aren't matched with `./src/utils` exports yet
- **Dynamic routes** — Template literals like ``/api/${endpoint}`` are detected with lower confidence
- **Monorepos** — Requires per-package configuration

## 📚 How It Works

```
1. Scanning
   └─ Traverse filesystem, collect all TypeScript/JavaScript files
   
2. Framework Detection
   └─ Detect Express, Fastify, Next.js, etc. based on imports
   
3. Parsing
   ├─ Extract all imports/exports using AST
   ├─ Extract route definitions (framework-specific)
   └─ Extract HTTP calls (fetch, axios, etc.)
   
4. Analysis
   ├─ Build dependency graph
   ├─ Match routes with HTTP calls
   └─ Identify unused exports
   
5. Reporting
   └─ Format results as Terminal or JSON
```

## ✨ Coming Soon

- [ ] Auto-delete suggestions with `--fix` flag
- [ ] HTML report generator
- [ ] Watch mode for development
- [ ] Performance profiling
- [ ] Component detection (React/Vue/Svelte)
- [ ] Unused dependencies detection

## 📄 License

MIT © 2026

## 🙋 Questions?

- 📖 Read the docs above
- 💬 Open an issue on GitHub
- 💡 Check the fixture projects in `tests/fixtures/`

---

<div align="center">

**Made with ❤️ for keeping codebases clean**

Found a bug? Have a feature request? [Open an issue](https://github.com/yourusername/dead-routes/issues)

</div>
