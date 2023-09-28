const config = {
    stories: ["../src/stories/**/*.stories.mdx", "../src/stories/**/*.stories.@(ts|tsx)"],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/preset-create-react-app",
        "storybook-dark-mode"
    ],
    core: {
        "builder": "webpack5"
    },
    staticDirs: ["../.storybook/static"]
};

export default config;
