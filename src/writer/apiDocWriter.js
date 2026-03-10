const path = require("path");

function writeApiDocs(routes) {
  let content = "# API Documentation\n\n";

  const grouped = {};

  routes.forEach((route) => {
    const fileName = path.basename(route.file);

    if (!grouped[fileName]) {
      grouped[fileName] = [];
    }

    grouped[fileName].push(route);
  });

  for (const file in grouped) {
    const moduleName = file.replace("Routes.js", "").replace(".js", "");

    content += `## ${moduleName.toUpperCase()} APIs\n`;
    content += `File: routes/${file}\n\n`;

    grouped[file].forEach((route) => {
      content += `### ${route.method} ${route.path}\n`;
      content += `Purpose: TBD\n\n`;
    });

    content += "---\n\n";
  }

  return content;
}

module.exports = writeApiDocs;
