const { glob } = require("glob");

async function scanFiles(projectPath) {
  const files = await glob("**/*.{js,ts}", {
    cwd: projectPath,
    ignore: [
      "node_modules/**",
      ".git/**",
      "dist/**",
      "build/**",
      "coverage/**",
    ],
    absolute: true,
  });

  console.log("files detected:", files.length);

  return files;
}

module.exports = scanFiles;
