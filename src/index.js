const path = require("path");
const chalk = require("chalk");
const oraModule = require("ora");

const writeApiDocs = require("./writer/apiDocWriter");
const writeProjectOverview = require("./writer/projectOverviewWriter");
const writeApiTestingGuide = require("./writer/apiTestingWriter");
const writeSchemaDocs = require("./writer/schemaWriter");
const saveDoc = require("./writer/saveDoc");

const scanFiles = require("./scanner/scanFiles");
const extractRoutes = require("./parser/routeParser");
const extractTables = require("./parser/tableParser");

const ora = typeof oraModule === "function" ? oraModule : oraModule.default;

async function start(projectPath) {
  const resolvedPath = path.resolve(projectPath);

  const spinner = ora({
    text: `Scanning project: ${resolvedPath}`,
    color: "cyan",
  }).start();

  try {
    // 1️⃣ Scan files
    const files = await scanFiles(resolvedPath);

    spinner.succeed(
      chalk.green(`Found ${files.length} JavaScript file(s) to analyze.`),
    );

    if (files.length === 0) {
      console.log(
        chalk.yellow(
          "No .js files were found. Make sure you pointed to the correct project folder.",
        ),
      );
      return;
    }

    // 2️⃣ Extract routes
    let routes = [];

    for (const file of files) {
      const detected = extractRoutes(file);
      routes = routes.concat(detected);
    }

    console.log(chalk.cyan(`Detected routes: ${routes.length}`));

    let tables = [];

    for (const file of files) {
      const detectedTables = extractTables(file);
      tables = tables.concat(detectedTables);
    }

    // 3️⃣ Generate docs
    const apiDocs = writeApiDocs(routes);
    const overview = writeProjectOverview(resolvedPath, files, routes);
    const testingGuide = writeApiTestingGuide(routes);
    const schema = writeSchemaDocs(tables);

    // 4️⃣ Save docs
    saveDoc("api.md", apiDocs, resolvedPath);
    saveDoc("project-overview.md", overview, resolvedPath);
    saveDoc("api-testing.md", testingGuide, resolvedPath);
    saveDoc("database-schema.md", schema, resolvedPath);

    console.log(
      chalk.green.bold("\n✅ Documentation successfully generated.\n"),
    );
  } catch (error) {
    spinner.fail(chalk.red("Failed to process project files."));
    console.error(chalk.red(error.message || error));
    process.exitCode = 1;
  }
}

module.exports = start;
