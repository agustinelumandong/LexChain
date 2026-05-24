#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OPENAPI_URL = "https://temeka-nonrelenting-corey.ngrok-free.dev/openapi.json";
const OUTPUT_PATH = resolve(__dirname, "../openapi-updated.json");

const res = await fetch(OPENAPI_URL, {
  headers: { "ngrok-skip-browser-warning": "true" },
});

if (!res.ok) {
  console.error(`❌ Failed to fetch OpenAPI spec: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const remote = JSON.stringify(await res.json(), null, 2) + "\n";

let local = "";
try { local = readFileSync(OUTPUT_PATH, "utf-8"); } catch {}

if (remote === local) {
  console.log("✅ OpenAPI spec is already up to date — skipping type generation.");
  process.exit(2);
}

writeFileSync(OUTPUT_PATH, remote);
console.log("📝 Updated openapi-updated.json with new spec from backend.");
