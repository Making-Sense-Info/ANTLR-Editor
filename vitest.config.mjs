import { defineConfig } from "vitest/config";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./src/__tests__/setup.ts"],
        env: {
            NODE_ENV: "test"
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["src/**/*.{ts,tsx}"],
            exclude: [
                "node_modules/",
                "src/__tests__/",
                "**/*.d.ts",
                "**/*.config.*",
                "**/stories/**",
                "**/storybook-static/**",
                "**/scripts/**",
                "**/test-app/**",
                "**/.storybook/**",
                "**/dist/**",
                "**/coverage/**",
                "**/vitest.config.*",
                "**/eslint.config.*",
                "**/.eslintrc.*",
                "**/storybook-static/**",
                "**/test-app/**"
            ]
        }
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
            "monaco-editor": resolve(__dirname, "./src/__tests__/mocks/monaco-editor.js"),
            "monaco-editor/esm/vs/editor/editor.api": resolve(
                __dirname,
                "./src/__tests__/mocks/monaco-editor/esm/vs/editor/editor.api.js"
            ),
            "@making-sense/antlr4ng": resolve(__dirname, "./src/__tests__/mocks/antlr4ng.js")
        }
    },
    define: {
        global: "globalThis"
    },
    optimizeDeps: {
        exclude: ["monaco-editor"]
    },
    esbuild: {
        target: "es2020"
    }
});
