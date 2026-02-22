#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const nodeModules = path.join(root, "node_modules");
const lockFile = path.join(root, "package-lock.json");

if (fs.existsSync(nodeModules)) {
  console.log("Removing node_modules...");
  fs.rmSync(nodeModules, { recursive: true });
}
if (fs.existsSync(lockFile)) {
  console.log("Removing package-lock.json...");
  fs.unlinkSync(lockFile);
}
console.log("Running npm install...");
execSync("npm install", { cwd: root, stdio: "inherit" });
console.log("Done.");
