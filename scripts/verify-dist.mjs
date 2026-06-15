import { accessSync } from "node:fs";
import { join } from "node:path";

const required = [
    "dist/index.js",
    "dist/Editor.js",
    "dist/monaco-patch.js",
    "dist/utils/log.js",
    "dist/utils/variables.js",
    "dist/utils/selection.js",
    "dist/utils/constants.js",
    "dist/utils/monaco-errors.js",
    "dist/utils/ParserFacade.js",
    "dist/utils/providers.js",
    "dist/grammar-graph/syntaxLink.js"
];

const missing = required.filter(file => {
    try {
        accessSync(join(process.cwd(), file));
        return false;
    } catch {
        return true;
    }
});

if (missing.length > 0) {
    console.error("Incomplete dist/ — missing files:");
    for (const file of missing) {
        console.error(`  - ${file}`);
    }
    process.exit(1);
}

console.log(`dist/ OK (${required.length} required files present)`);
