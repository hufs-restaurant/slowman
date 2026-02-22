#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "외대로고.jpeg");
const dest = path.join(__dirname, "..", "public", "외대로고.jpeg");
const destDir = path.dirname(dest);

if (!fs.existsSync(src)) {
  console.warn("⚠ 외대로고.jpeg를 프로젝트 루트에 두고 다시 실행하세요.");
  process.exit(0);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}
fs.copyFileSync(src, dest);
console.log("✓ public/외대로고.jpeg 복사 완료");
