const fs = require("fs");
const path = require("path");

function saveDoc(name, content, projectPath) {
  const docsDir = path.join(projectPath, "docs");

  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
  }

  fs.writeFileSync(path.join(docsDir, name), content);
}

module.exports = saveDoc;
