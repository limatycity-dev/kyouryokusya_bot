// build_features_spec.ts

import fs from "fs";
import path from "path";

// プロジェクトルートを基準にする
const docsRoot = path.join(process.cwd(), "@docs");
const specRoot = path.join(docsRoot, "spec");
const featuresDir = path.join(specRoot, "08_features");
const outputFile = path.join(specRoot, "08_features.md");

function buildFeaturesSpec() {
  if (!fs.existsSync(featuresDir)) {
    console.error("❌ featuresDir が存在しません:", featuresDir);
    return;
  }

  const files = fs
    .readdirSync(featuresDir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  let output = "";

  for (const file of files) {
    const filePath = path.join(featuresDir, file);
    const content = fs.readFileSync(filePath, "utf-8");

    output += `\n\n========================================\n`;
    output += `# ${file}\n`;
    output += `========================================\n\n`;
    output += content.trim() + "\n";
  }

  fs.writeFileSync(outputFile, output, "utf-8");
  console.log("✅ 08_features.txt generated.");
}

buildFeaturesSpec();