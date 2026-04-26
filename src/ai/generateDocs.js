const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/** Gemini 1.5 model IDs are retired for many keys; use 2.5+ IDs. See https://ai.google.dev/gemini-api/docs/models/gemini */
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateDocs(routes, tables, files) {
  const model = genAI.getGenerativeModel({
    model: MODEL,
  });

  let codeContext = "";

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    codeContext += `\nFILE: ${file}\n${content}\n`;
  }

  const routesSummary =
    routes.length > 0 ? JSON.stringify(routes, null, 2) : "(none detected)";
  const tablesSummary =
    tables.length > 0 ? JSON.stringify(tables, null, 2) : "(none detected)";

  const prompt = `
You are a senior backend developer.

Detected routes (from static analysis):
${routesSummary}

Detected database tables (from static analysis):
${tablesSummary}

Analyze the following Node.js backend project code and generate 3 markdown documents:

1. API Testing Guide (how to call endpoints: curl examples, query/body/params, auth if any)
2. Database Schema
3. Project Overview

Requirements:
- Explain API purpose
- Include request body, params, query
- Provide curl examples
- Detect database tables if possible
- Group APIs by module

Return the result in this format:

---API_TESTING_GUIDE---
(markdown)

---DB_SCHEMA---
(markdown)

---PROJECT_OVERVIEW---
(markdown)

Code:
${codeContext}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = generateDocs;
