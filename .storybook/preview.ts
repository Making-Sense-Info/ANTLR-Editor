import type { Preview } from "@storybook/react-webpack5";

import { darkTheme, lightTheme } from "./customTheme";

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: "^on[A-Z].*" },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/
            }
        },
        backgrounds: { disabled: true },
        darkMode: {
            stylePreview: true,
            light: lightTheme,
            dark: darkTheme,
            current: "dark"
        },
        options: {
            storySort: (a, b) => (a.title < b.title ? -1 : 1)
        }
    }
};

export default preview;
