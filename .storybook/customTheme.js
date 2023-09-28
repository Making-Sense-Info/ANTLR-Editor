import { create } from "@storybook/theming";
import logo from "./static/onyxiaLogo.png";
import antlrLogo from "./static/antlr-logo.svg";

export const darkTheme = create({
    "base": "dark",
    "brandTitle": "ANTLR Editor",
    "brandImage": antlrLogo,
    "brandUrl": "https://github.com/Making-Sense-Info/ANTLR-Editor",

    "appBg": "#0A192E",
    "appContentBg": "#0A192E",

    "barBg": "#0A192E",

    "colorSecondary": "#FBD616",

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

    "appBg": "#F5F7FA",
    "appContentBg": "#F5F7FA",
    "barBg": "#F5F7FA",

    "colorSecondary": "#3A4657",

    "textColor": "#0F417A",
    "textInverseColor": "#ffc0cb",

    "fontBase": '"Montserrat", sans-serif',
    "fontCode": "monospace"
});
