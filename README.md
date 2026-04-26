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

## Quick Start

```bash
git clone <your-repo-url>
cd ai-doc-generator
npm install
```

Create a `.env` file in the root (recommended):

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

The CLI prompts for Gemini credentials at runtime.  
If `GEMINI_API_KEY` already exists in your environment, you can press Enter on the API key prompt to reuse it.

Run on the current folder:

```bash
docgen .
```

Run on another project path:

```bash
docgen "D:\path\to\your-project"
```

## Global CLI Usage (optional)

To use it as a command from anywhere:

```bash
npm link
```

Then run in any target project:

```bash
docgen .
```

## How It Works

1. Scan project files
2. Extract routes (`get`, `post`, `put`, `patch`, `delete`)
3. Extract table hints
4. Send code + analysis context to Gemini
5. Save output markdown files in `docs/`

## Troubleshooting

- **`models/... not found`**
  - Use a current model in `.env`, for example:
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



