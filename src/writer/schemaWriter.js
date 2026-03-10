function writeSchemaDocs(tables) {
  let content = "# Database Schema\n\n";

  if (tables.length === 0) {
    content += "No tables detected.\n";
    return content;
  }

  tables.forEach((table) => {
    content += `## ${table}\n\n`;
  });

  return content;
}

module.exports = writeSchemaDocs;
