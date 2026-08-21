const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const prettier = require("eslint-config-prettier");
const storybook = require("eslint-plugin-storybook");

module.exports = [
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            "storybook-static/**",
            "coverage/**",
            ".yarn_home/**",
            "CHANGELOG.md",
            "eslint.config.cjs",
            "test-app/**",
        ],
    },
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            ...(tsPlugin.configs.recommended?.rules || {}),
            "no-extra-boolean-cast": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "no-debugger": "off",
            ...(prettier.rules || {}),
        },
    },
    ...(storybook.configs?.["flat/recommended"] || []),
];
