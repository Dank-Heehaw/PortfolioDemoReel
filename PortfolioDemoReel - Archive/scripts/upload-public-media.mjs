/**
 * Legacy: upload a local public/ folder to Vercel Blob.
 * Preferred path is Directus File Library + Cloudflare R2
 * (docs/directus-media.md). Keep this script only if you still have
 * leftover files on disk to park on Blob.
 */
import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FOLDERS = [
  "public/projects/Ford",
  "public/projects/Hypedocs",
  "public/projects/Icons",
  "public/projects/NatureCycle",
];

function loadEnvFile(name) {
  const envPath = path.join(ROOT, name);
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function walkFiles(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walkFiles(full)));
      continue;
    }
    if (entry.name.toLowerCase().endsWith(".md")) continue;
    out.push(full);
  }
  return out;
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error(
    "Missing BLOB_READ_WRITE_TOKEN. Create a Vercel Blob store, add the token to .env.local, then re-run."
  );
  process.exit(1);
}

let put;
try {
  ({ put } = await import("@vercel/blob"));
} catch {
  console.error("Install the uploader with: npm i @vercel/blob");
  process.exit(1);
}

let origin = "";
let uploaded = 0;

for (const folder of FOLDERS) {
  const abs = path.join(ROOT, folder);
  const files = await walkFiles(abs);
  if (!files.length) {
    console.warn(`Skip (missing or empty): ${folder}`);
    continue;
  }
  for (const filePath of files) {
    const rel = path.relative(path.join(ROOT, "public"), filePath).split(path.sep).join("/");
    const body = await readFile(filePath);
    const blob = await put(rel, body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      token,
    });
    uploaded += 1;
    if (!origin) {
      try {
        origin = new URL(blob.url).origin;
      } catch {
        origin = blob.url;
      }
    }
    console.log(`${rel} → ${blob.url}`);
  }
}

console.log(`\nUploaded ${uploaded} file(s).`);
if (origin) {
  console.log(`Set NEXT_PUBLIC_MEDIA_BASE_URL=${origin}`);
  console.log("Add the same value in the Vercel project env vars, then redeploy.");
}
