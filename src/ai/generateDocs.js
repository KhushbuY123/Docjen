const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function generateDocs(routes, tables, files, geminiConfig) {
  const modelName = geminiConfig?.model || "gemini-2.5-flash";
  const apiKey = geminiConfig?.apiKey;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
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
