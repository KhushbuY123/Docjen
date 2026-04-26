const path = require("path");
const fs = require("fs");
const os = require("os");
const readline = require("readline/promises");
const chalk = require("chalk");
const oraModule = require("ora");
require("dotenv").config();

const scanFiles = require("./scanner/scanFiles");
const extractRoutes = require("./parser/routeParser");
const extractTables = require("./parser/tableParser");
const generateDocs = require("./ai/generateDocs");
const saveDoc = require("./writer/saveDoc");

const ora = typeof oraModule === "function" ? oraModule : oraModule.default;
const CONFIG_DIR = path.join(os.homedir(), ".ai-doc-generator");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

/*
Split AI response into sections
*/
function splitDocs(text) {
  return {
    apiTestingGuide:
      text.split("---API_TESTING_GUIDE---")[1]?.split("---DB_SCHEMA---")[0] ||
      text.split("---API_DOCS---")[1]?.split("---DB_SCHEMA---")[0] ||
      "",
    db:
      text.split("---DB_SCHEMA---")[1]?.split("---PROJECT_OVERVIEW---")[0] ||
      "",
    overview: text.split("---PROJECT_OVERVIEW---")[1] || "",
  };
}

async function askGeminiConfig() {
  const envApiKey = (process.env.GEMINI_API_KEY || "").trim();
  const envModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const saved = readSavedGeminiConfig();

  if (envApiKey) {
    const config = { apiKey: envApiKey, model: envModel.trim() };
    saveGeminiConfig(config);
    return config;
  }

  if (saved?.apiKey) {
    return {
      apiKey: saved.apiKey.trim(),
      model: (saved.model || envModel).trim(),
    };
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      "GEMINI_API_KEY is missing. Set it in environment variables (or .env), or run once interactively to save credentials.",
    );
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log(chalk.yellow("Enter Gemini credentials to continue."));
    const enteredKey = await rl.question("Gemini API key: ");
    const enteredModel = await rl.question(
      `Gemini model (default: ${envModel}): `,
    );

    const apiKey = enteredKey.trim();
    const model = enteredModel.trim() || envModel;

    if (!apiKey) {
      throw new Error("Gemini API key is required.");
    }

    const config = { apiKey, model };
    saveGeminiConfig(config);
    return config;
  } finally {
    rl.close();
  }
}

function readSavedGeminiConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw);

    if (typeof parsed?.apiKey !== "string" || parsed.apiKey.trim() === "") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function saveGeminiConfig(config) {
  try {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
  } catch {
    // Ignore save errors; CLI can still run with in-memory credentials.
  }
}

async function start(projectPath) {
  const resolvedPath = path.resolve(projectPath);

  const spinner = ora({
    text: `Scanning project: ${resolvedPath}`,
    color: "cyan",
  }).start();

  try {
    /*
    1️⃣ Scan project files
    */
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

    /*
    2️⃣ Extract routes
    */
    let routes = [];

    for (const file of files) {
      const detected = extractRoutes(file);
      routes = routes.concat(detected);
    }

    console.log(chalk.cyan(`Detected routes: ${routes.length}`));

    /*
    3️⃣ Extract tables
    */
    let tables = [];

    for (const file of files) {
      const detectedTables = extractTables(file);
      tables = tables.concat(detectedTables);
    }

    console.log(chalk.cyan(`Detected tables: ${tables.length}`));

    /*
    4️⃣ Generate AI docs
    */
    const geminiConfig = await askGeminiConfig();

    const aiSpinner = ora({
      text: "Generating AI documentation...",
      color: "yellow",
    }).start();

    const aiOutput = await generateDocs(routes, tables, files, geminiConfig);

    aiSpinner.succeed("AI documentation generated.");

    /*
    5️⃣ Split AI response
    */
    const docs = splitDocs(aiOutput);

    /*
    6️⃣ Save docs
    */
    saveDoc("api-testing-guide.md", docs.apiTestingGuide, resolvedPath);
    saveDoc("database-schema.md", docs.db, resolvedPath);
    saveDoc("project-overview.md", docs.overview, resolvedPath);

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
