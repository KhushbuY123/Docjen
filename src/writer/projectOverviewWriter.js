const fs = require("fs");
const path = require("path");

function writeProjectOverview(projectPath, files, routes) {
  const folders = fs.readdirSync(projectPath).filter((item) => {
    const fullPath = path.join(projectPath, item);
    return fs.statSync(fullPath).isDirectory();
  });

  let content = "# Project Overview\n\n";

  content += `Project Path: ${projectPath}\n\n`;

  content += "## Detected Folders\n\n";

  folders.forEach((folder) => {
    content += `- ${folder}\n`;
  });

  content += "\n";

  content += "## Statistics\n\n";

  content += `- JavaScript Files: ${files.length}\n`;
  content += `- API Routes: ${routes.length}\n`;

  return content;
}

module.exports = writeProjectOverview;
