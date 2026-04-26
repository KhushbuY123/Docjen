# AI Doc Generator

Generate backend project documentation from source code using Gemini.

This CLI scans a Node.js/TypeScript project, detects routes/tables, sends context to Gemini, and writes docs into a `docs/` folder.

## What It Generates

- `docs/api-testing-guide.md`
- `docs/database-schema.md`
- `docs/project-overview.md`

## Features

- Scans `*.js` and `*.ts` files
- Ignores common heavy folders (`node_modules`, `.git`, `dist`, `build`, `coverage`)
- Detects Express-style routes
- Detects database table hints
- Uses Gemini to generate markdown docs

## Requirements

- Node.js 18+ (recommended)
- A Gemini API key

## Install

```bash
npm i -g ai-doc-generator
```

## User Flow

1. Open terminal in your backend project.
2. Run:

```bash
docgen .
```

3. On first run (if no saved config and no `GEMINI_API_KEY` is set), the CLI asks for:
   - Gemini API key
   - Gemini model (default: `gemini-2.5-flash`)
4. After successful run, credentials are saved to your user profile and reused automatically.
5. If `GEMINI_API_KEY` is set in environment variables, that value is used and also cached for future runs.
6. Generated docs are written to:
   - `docs/api-testing-guide.md`
   - `docs/database-schema.md`
   - `docs/project-overview.md`

Run against another folder:

```bash
docgen "D:\path\to\your-project"
```

## How It Works

1. Scan project files
2. Extract routes (`get`, `post`, `put`, `patch`, `delete`)
3. Extract table hints
4. Send code + analysis context to Gemini
5. Save output markdown files in `docs/`

## Troubleshooting

- **`models/... not found`**
  - Use a current model (prompt or env var), for example:
  - `GEMINI_MODEL=gemini-2.5-flash`
- **Very slow on large projects**
  - Exclude generated folders and large artifacts
  - Run against a smaller subfolder first
- **No files found**
  - Ensure you are pointing to the correct target path

## Development

Run directly during development:

```bash
node bin/docgen.js .
```

Main files:

- `bin/docgen.js` - CLI entry
- `src/index.js` - workflow orchestration
- `src/scanner/scanFiles.js` - file discovery
- `src/ai/generateDocs.js` - Gemini generation
- `src/writer/saveDoc.js` - writes markdown files



