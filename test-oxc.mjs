import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join, dirname, resolve, extname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const root = "/Users/nicolaval/MS/Projects/ANTLR-Editor";
process.chdir(root);

const { parseWithOxc } = await import("storybook/internal/oxc-parser");

async function parseFile(f) {
  const abs = resolve(root, f);
  const src = readFileSync(abs, "utf8");
  return parseWithOxc(abs, src);
}

const storiesDir = join(root, "src/stories");
const files = readdirSync(storiesDir)
  .filter((f) => /\.(tsx?|jsx?)$/.test(f))
  .map((f) => join("src/stories", f));

const configs = [
  ".storybook/preview.ts",
  ".storybook/main.ts",
  ".storybook/manager.ts",
  ".storybook/customTheme.ts",
];

for (const f of [...files, ...configs]) {
  try {
    const r = await parseFile(f);
    console.log("OK", f, Array.isArray(r) ? `imports=${r.length}` : typeof r);
  } catch (e) {
    console.log("FAIL", f, e.message);
  }
}

// Walk story imports recursively within workspace, skip node_modules first then try key packages
const queue = files.map((f) => resolve(root, f));
const seen = new Set();
const importRe = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)|import\(\s*["']([^"']+)["']\s*\)/g;

function resolveImport(fromFile, spec) {
  if (spec.startsWith(".")) {
    const base = resolve(dirname(fromFile), spec);
    for (const ext of ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js"]) {
      try {
        readFileSync(base + ext);
        return base + ext;
      } catch {}
    }
    return null;
  }
  try {
    return require.resolve(spec, { paths: [dirname(fromFile)] });
  } catch {
    return null;
  }
}

while (queue.length) {
  const file = queue.pop();
  if (seen.has(file)) continue;
  seen.add(file);
  if (file.includes("node_modules")) continue; // skip for now
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  try {
    await parseWithOxc(file, src);
  } catch (e) {
    console.log("WALK FAIL", file, e.message);
    continue;
  }
  let m;
  const re = /from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
  while ((m = re.exec(src))) {
    const spec = m[1] || m[2];
    const resolved = resolveImport(file, spec);
    if (resolved && !seen.has(resolved) && !resolved.includes("node_modules")) {
      queue.push(resolved);
    }
  }
}
console.log("walked", seen.size, "files outside node_modules");
