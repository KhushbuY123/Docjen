const fs = require("fs");

function extractTables(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  const tables = [];

  // SQL pattern
  const sqlRegex = /create\s+table\s+(\w+)/gi;

  // Sequelize pattern
  const sequelizeRegex = /sequelize\.define\(["'`](\w+)["'`]/gi;

  // Mongoose pattern
  const mongooseRegex = /model\(["'`](\w+)["'`]/gi;

  let match;

  while ((match = sqlRegex.exec(content)) !== null) {
    tables.push(match[1]);
  }

  while ((match = sequelizeRegex.exec(content)) !== null) {
    tables.push(match[1]);
  }

  while ((match = mongooseRegex.exec(content)) !== null) {
    tables.push(match[1]);
  }

  return tables;
}

module.exports = extractTables;
