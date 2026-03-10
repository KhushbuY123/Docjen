const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");

/**
 * Simple heuristic documentation generator:
 * - For each JS file, reads the source
 * - Extracts top-level function and class names
 * - Writes a Markdown file under a /docs folder with a short summary
 *
 * This does not call any external AI service – it just gives you
 * structured, automatically-generated docs you can extend later.
 *
 * @param {string[]} files - Absolute paths to JavaScript files.
 * @param {string} projectRoot - Absolute path to the project root being scanned.
 */
async function generateDocs(files, projectRoot) {
  const docsDir = path.join(projectRoot, "docs");
  await fs.ensureDir(docsDir);

  const indexLines = ["# Project Documentation", ""];

  for (const filePath of files) {
    const relative = path.relative(projectRoot, filePath);
    const source = await fs.readFile(filePath, "utf8");

    const functions = extractFunctions(source);
    const classes = extractClasses(source);

    const docContent = buildFileDoc(relative, functions, classes);

    // One markdown file per source file, mirroring the directory structure.
    const targetPath = path.join(
      docsDir,
      relative.replace(/\.js$/, ".md")
    );

    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, docContent, "utf8");

    indexLines.push(
      `- [${relative.replace(/\\/g, "/")}](${relative
        .replace(/\.js$/, ".md")
        .replace(/\\/g, "/")})`
    );
  }

  const indexPath = path.join(docsDir, "index.md");
  await fs.writeFile(indexPath, indexLines.join("\n") + "\n", "utf8");

  console.log(
    chalk.cyan(
      `\n📚 Docs generated in: ${
        path.relative(process.cwd(), docsDir) || docsDir
      }`
    )
  );
}

function extractFunctions(source) {
  const names = new Set();

  const functionDecl = /function\s+([A-Za-z0-9_$]+)\s*\(/g;
  const funcExpr = /const\s+([A-Za-z0-9_$]+)\s*=\s*(async\s*)?\(/g;
  const arrowFunc =
    /const\s+([A-Za-z0-9_$]+)\s*=\s*(async\s*)?\([\s\S]*?\)\s*=>/g;

  let match;
  while ((match = functionDecl.exec(source))) {
    names.add(match[1]);
  }
  while ((match = funcExpr.exec(source))) {
    names.add(match[1]);
  }
  while ((match = arrowFunc.exec(source))) {
    names.add(match[1]);
  }

  return Array.from(names);
}

function extractClasses(source) {
  const names = new Set();
  const classDecl = /class\s+([A-Za-z0-9_$]+)/g;
  let match;
  while ((match = classDecl.exec(source))) {
    names.add(match[1]);
  }
  return Array.from(names);
}

function buildFileDoc(relativePath, functions, classes) {
  const lines = [];

  lines.push(`# ${relativePath}`);
  lines.push("");

  if (classes.length === 0 && functions.length === 0) {
    lines.push(
      "_No top-level functions or classes were detected in this file._"
    );
    lines.push("");
    return lines.join("\n");
  }

  if (classes.length) {
    lines.push("## Classes");
    lines.push("");
    for (const name of classes) {
      lines.push(`- **${name}**: Class defined in \`${relativePath}\`.`);
    }
    lines.push("");
  }

  if (functions.length) {
    lines.push("## Functions");
    lines.push("");
    for (const name of functions) {
      lines.push(`- **${name}**: Function defined in \`${relativePath}\`.`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

module.exports = generateDocs;

