import { darkTheme, lightTheme } from "./customTheme";
import { DocsContainer } from "./DocsContainer";

export const parameters = {
    "actions": { argTypesRegex: "^on[A-Z].*" },
    "controls": {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/
        }
    },
    "backgrounds": { disable: true },
    "darkMode": {
        "stylePreview": true,
        "light": lightTheme,
        "dark": darkTheme,
        "current": "dark"
    },
    "docs": {
        container: DocsContainer
    },
    "options": {
        storySort: (a, b) => {
            const aName = a[0];
            const bName = b[0];

            return aName < bName ? -1 : 1;
        }
    }
};
