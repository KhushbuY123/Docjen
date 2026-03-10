const fs = require("fs");
const path = require("path");

function writeDocs(routes, projectPath) {
  const docsDir = path.join(projectPath, "docs");

  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
  }

  let content = "# API Documentation\n\n";

  routes.forEach((route) => {
    content += `## ${route.method} ${route.path}\n`;
    content += `File: ${route.file}\n\n`;
  });

  fs.writeFileSync(path.join(docsDir, "api.md"), content);
}

module.exports = writeDocs;
