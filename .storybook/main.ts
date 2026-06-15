import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-webpack5";

const storybookDir = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
    stories: ["../src/stories/**/*.stories.@(ts|tsx)"],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-webpack5-compiler-swc",
        "@storybook/addon-docs",
        "storybook-dark-mode"
    ],
    framework: {
        name: "@storybook/react-webpack5",
        options: {}
    },
    staticDirs: ["./static"],
    webpackFinal: async webpackConfig => {
        webpackConfig.resolve ??= {};
        webpackConfig.resolve.alias = {
            ...webpackConfig.resolve.alias,
            "monaco-editor": path.resolve(storybookDir, "../node_modules/monaco-editor")
        };

        webpackConfig.module ??= { rules: [] };
        webpackConfig.module.rules ??= [];
        webpackConfig.module.rules.push({
            test: /\.ttf$/,
            type: "asset/resource"
        });

        return webpackConfig;
    }
};

export default config;
