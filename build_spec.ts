// build_spec.ts
import fs from "fs";
import path from "path";

const docsDir = path.join(process.cwd(), "@docs");
const specDir = path.join(docsDir, "spec");
const outputFile = path.join(specDir, "spec_full.md");

const order = [
  "00_overview.md",
  "01_directory_structure.md",
  "02_db_schema.md",
  "03_state_machine.md",
  "04_commands.md",
  "05_ui_spec.md",
  "06_operation_flow.md",
  "07_error_handling.md",
];

function buildSpec() {
  let output = "";

  for (const file of order) {
    const filePath = path.join(docsDir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      output += `\n\n---\n# ${file}\n\n${content}\n`;
    }
  }

  fs.writeFileSync(outputFile, output, "utf-8");
  console.log("spec_full.md generated.");
}

buildSpec();
