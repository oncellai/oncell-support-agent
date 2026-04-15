// Setup script — creates an OnCell cell with the support agent code and uploads docs.
// Reads keys from .env.local or environment variables.

import { OnCell } from "@oncell/sdk";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, extname } from "path";

// Load .env.local if it exists
const envPath = new URL("../.env.local", import.meta.url).pathname;
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^(\w+)=(.+)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  }
}

async function main() {
  if (!process.env.ONCELL_API_KEY) { console.error("Set ONCELL_API_KEY in .env.local or environment"); process.exit(1); }
  if (!process.env.OPENROUTER_API_KEY) { console.error("Set OPENROUTER_API_KEY in .env.local or environment"); process.exit(1); }

  const oncell = new OnCell({ apiKey: process.env.ONCELL_API_KEY });
  const agentCode = readFileSync(new URL("../lib/agent-raw.js", import.meta.url), "utf-8");

  console.log("Creating cell...");
  const cell = await oncell.cells.create({
    customerId: "support-agent",
    tier: "starter",
    permanent: true,
    secrets: {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      LLM_MODEL: process.env.LLM_MODEL || "google/gemini-2.5-flash",
    },
    agent: agentCode,
  });
  console.log(`Cell: ${cell.id}`);

  // Upload docs
  const docsDir = new URL("../example-docs", import.meta.url).pathname;
  if (existsSync(docsDir)) {
    const files = readdirSync(docsDir).filter(f => [".md", ".txt"].includes(extname(f)));
    for (const file of files) {
      const content = readFileSync(join(docsDir, file), "utf-8");
      await oncell.cells.writeFile(cell.id, `docs/${file}`, content);
      console.log(`Uploaded: ${file}`);
    }

    console.log("Indexing...");
    const result = await oncell.cells.request(cell.id, "index_docs");
    console.log(`Indexed: ${result.indexed} chunks from ${result.files} files`);
  }

  // Auto-write cell ID to .env.local
  let envContent = existsSync(envPath) ? readFileSync(envPath, "utf-8") : "";
  if (envContent.includes("ONCELL_CELL_ID=")) {
    envContent = envContent.replace(/ONCELL_CELL_ID=.*/, `ONCELL_CELL_ID=${cell.id}`);
  } else {
    envContent = envContent.trimEnd() + `\nONCELL_CELL_ID=${cell.id}\n`;
  }
  if (!envContent.includes("ONCELL_API_KEY=")) {
    envContent = `ONCELL_API_KEY=${process.env.ONCELL_API_KEY}\n` + envContent;
  }
  writeFileSync(envPath, envContent);
  console.log(`\nSaved ONCELL_CELL_ID=${cell.id} to .env.local`);
  console.log(`Run: npm run dev`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
