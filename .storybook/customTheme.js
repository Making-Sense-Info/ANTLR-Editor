import { create } from "@storybook/theming";
import antlrLogo from "./static/antlr-logo.svg";

export const darkTheme = create({
    "base": "dark",
    "brandTitle": "ANTLR Editor",
    "brandImage": antlrLogo,
    "brandUrl": "https://github.com/Making-Sense-Info/ANTLR-Editor",

    "appBg": "#323137",
    "appContentBg": "#323137",

    "barBg": "#323137",

    "colorSecondary": "#9211ff",

    "textColor": "#f1f0eb",
    "textInverseColor": "#ffc0cb",

    "fontBase": '"Montserrat", sans-serif',
    "fontCode": "monospace"
});

export const lightTheme = create({
    "base": "light",
    "brandTitle": "ANTLR Editor",
    "brandImage": antlrLogo,
    "brandUrl": "https://github.com/Making-Sense-Info/ANTLR-Editor",

    "appBg": "#f2f2f3",
    "appContentBg": "#f2f2f3",
    "barBg": "#f2f2f3",

    "colorSecondary": "#9211ff",

    "textColor": "#0F417A",
    "textInverseColor": "#ffc0cb",

    "fontBase": '"Montserrat", sans-serif',
    "fontCode": "monospace"
});
