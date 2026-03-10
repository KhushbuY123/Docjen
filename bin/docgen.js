const path = require("path");
const start = require("../src/index");

const target = process.argv[2] || ".";

const projectPath = path.resolve(process.cwd(), target);

start(projectPath);
