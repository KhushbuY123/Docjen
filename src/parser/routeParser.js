const fs = require("fs");

const routeRegex =
  /(app|router)\.(get|post|put|delete|patch)\(["'`](.*?)["'`]/g;

function extractRoutes(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  const routes = [];
  let match;

  while ((match = routeRegex.exec(content)) !== null) {
    routes.push({
      method: match[2].toUpperCase(),
      path: match[3],
      file: filePath,
    });
  }

  return routes;
}

module.exports = extractRoutes;
