function writeApiTestingGuide(routes) {
  let content = "# API Testing Guide\n\n";

  routes.forEach((route) => {
    content += `## ${route.method} ${route.path}\n\n`;

    if (route.params?.length) {
      content += "Path Params\n";
      route.params.forEach((p) => (content += `- ${p}\n`));
      content += "\n";
    }

    if (route.query?.length) {
      content += "Query Params\n";
      route.query.forEach((q) => (content += `- ${q}\n`));
      content += "\n";
    }

    if (route.body?.length) {
      content += "Request Body\n";
      route.body.forEach((b) => (content += `- ${b}\n`));
      content += "\n";
    }

    content += "Example curl:\n\n";

    content += "```bash\n";
    content += `curl -X ${route.method} http://localhost:3000${route.path}\n`;
    content += "```\n\n";
  });

  return content;
}

module.exports = writeApiTestingGuide;
