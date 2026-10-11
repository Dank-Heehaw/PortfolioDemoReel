/**
 * Next.js build-trace historically treated readlink failures as "not a symlink"
 * for EINVAL / ENOENT / UNKNOWN — but on Windows non-C: (and exFAT) drives, Node
 * raises EISDIR instead. Swallow that code so local `next build` can succeed.
 *
 * Next 16+ may no longer contain these patterns (tracing changed); this script
 * is a no-op when the needles are missing. Vercel/Linux builds are unaffected.
 * @see https://github.com/vercel/next.js/issues/45067
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const needles = [
  'e.code === "EINVAL" || e.code === "ENOENT" || e.code === "UNKNOWN"',
  "e.code === 'EINVAL' || e.code === 'ENOENT' || e.code === 'UNKNOWN'",
];

const replacements = [
  'e.code === "EINVAL" || e.code === "ENOENT" || e.code === "UNKNOWN" || e.code === "EISDIR"',
  "e.code === 'EINVAL' || e.code === 'ENOENT' || e.code === 'UNKNOWN' || e.code === 'EISDIR'",
];

const candidates = [
  "node_modules/next/dist/build/webpack/plugins/next-trace-entrypoints-plugin.js",
  "node_modules/next/dist/build/collect-build-traces.js",
  "node_modules/next/dist/build/adapter/build-complete.js",
];

let changed = 0;
let scanned = 0;

for (const file of candidates) {
  const target = path.join(root, file);
  if (!fs.existsSync(target)) {
    continue;
  }
  scanned += 1;

  let source = fs.readFileSync(target, "utf8");
  if (source.includes('e.code === "EISDIR"') || source.includes("e.code === 'EISDIR'")) {
    console.log(`[patch-next-exfat] already applied: ${path.basename(file)}`);
    continue;
  }

  let patched = false;
  for (let i = 0; i < needles.length; i += 1) {
    if (!source.includes(needles[i])) continue;
    source = source.replaceAll(needles[i], replacements[i]);
    patched = true;
  }

  if (!patched) {
    console.warn(`[patch-next-exfat] pattern not found in ${file} — skip`);
    continue;
  }

  fs.writeFileSync(target, source);
  console.log(`[patch-next-exfat] patched ${path.basename(file)}`);
  changed += 1;
}

if (!scanned) {
  console.log("[patch-next-exfat] no candidate files found — skip");
} else if (!changed) {
  console.log("[patch-next-exfat] nothing to change");
}
