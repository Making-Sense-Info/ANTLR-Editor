import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./src/__tests__/setup.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: ["node_modules/", "src/__tests__/", "**/*.d.ts", "**/*.config.*", "**/stories/**"]
        }
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
            "monaco-editor": resolve(__dirname, "./src/__tests__/mocks/monaco-global.js"),
            "monaco-editor/esm/vs/editor/editor.api": resolve(
                __dirname,
                "./src/__tests__/mocks/monaco-global.js"
            ),
            "@making-sense/antlr4ng": resolve(__dirname, "./src/__tests__/mocks/antlr4ng.js")
        }
    },
    define: {
        global: "globalThis"
    },
    optimizeDeps: {
        exclude: ["monaco-editor", "@monaco-editor/react"]
    },
    esbuild: {
        target: "es2020"
    }
});
