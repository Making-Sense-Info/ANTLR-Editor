# ANTLR Editor

[![ANTLR Editor CI](https://github.com/Making-Sense-Info/ANTLR-Editor/actions/workflows/ci.yaml/badge.svg)](https://github.com/Making-Sense-Info/ANTLR-Editor/actions/workflows/ci.yaml)
[![NPM version](https://badge.fury.io/js/@making-sense%2Fantlr-editor.svg)](https://badge.fury.io/js/@making-sense%2Fantlr-editor)
[![Storybook](https://cdn.jsdelivr.net/gh/storybookjs/brand@main/badge/badge-storybook.svg)](https://making-sense-info.github.io/ANTLR-Editor)

ANTLR Typescript editor.

## Usage

### Install

```bash
yarn add @making-sense/antlr-editor antlr4ts monaco-editor @monaco-editor/react
```

### Create React app

As far as `antlr4ts` require some node modules which are no longer provided by `Webpack@5`, you have to complete the `webpack` configuration thanks to `react-app-rewired` (or `eject` your CRA application, what we will not recommend here), following these steps:

-   Install `react-app-rewired`, `assert` and `util` as `devDependency`

```bash
yarn add -D react-app-rewired assert util
```

-   Override the create-react-app webpack config file

At the root of your project, create the `config-overrides.js` file and add the following code to it:

```javascript
/*
We use this file to in order to be able to use webpack plugin without ejecting from CRA.
This file is picked up by react-app-rewired that we use in place of react-scripts
*/

module.exports = function override(config) {
    if (!config.resolve.fallback) {
        config.resolve.fallback = {};
    }

    config.resolve.fallback["assert"] = require.resolve("assert");
    config.resolve.fallback["util"] = require.resolve("util");

    if (!config.plugins) {
        config.plugins = [];
    }
    return config;
};
```

-   Switch the existing calls to `react-scripts` in your project scripts for start, build and test

```diff
  /* package.json */

  "scripts": {
-   "start": "react-scripts start",
+   "start": "react-app-rewired start",
-   "build": "react-scripts build",
+   "build": "react-app-rewired build",
-   "test": "react-scripts test",
+   "test": "react-app-rewired test",
    "eject": "react-scripts eject"
}
```

### VTLEditor

```bash
yarn add @making-sense/vtl-2-0-antlr-tools-ts
```

```typescript
import { AntlrEditor as VTLEditor } from "@making-sense/antlr-editor";
import { getSuggestionsFromRange, monarchDefinition } from "./vtl-monaco";
import * as VTLTools from "@making-sense/vtl-2-0-antlr-tools-ts";

const customTools = { ...VTLTools, getSuggestionsFromRange, monarchDefinition };

const Editor = () => {
    return <VTLEditor tools={customTools} />;
};

export default Editor;
```

### Developement mode

#### Storybook

```bash
yarn storybook
```

#### Linked app

```bash
git clone https://github.com/Making-Sense-Info/ANTLR-Editor
cd ANTLR-Editor
yarn

# Start the test app in watch mode
yarn start-test-app

# Link in an external project in watch mode
yarn link-in-app test-app # ../YOUR-APP is supposed to exist
```

## AntlrEditor Props

| Name               |                                                                         Type                                                                          | Default value |
| ------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------: |
| script             |                                                                        string                                                                         |       -       |
| setScript          |                                                                       Function                                                                        |       -       |
| customFetcher      |                                                                      Function \*                                                                      |       -       |
| tools              |                                                                       Tools \*                                                                        |       -       |
| variables          |                                                                     Variables \*                                                                      |      { }      |
| variablesInputURLs |                                                                    VariableURLs \*                                                                    |      [ ]      |
| onListErrors       |                                                                       Function                                                                        |   undefined   |
| height             |                                                                        string                                                                         |    "50vh"     |
| width              |                                                                        string                                                                         |    "100%"     |
| theme              |                                                                        string                                                                         |   "vs-dark"   |
| options            | [IStandaloneEditorConstructionOptions](https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IStandaloneEditorConstructionOptions.html) |      {}       |

See details about \* props below

### Props

#### `tools`

`tools` has to be mainly antlr4 auto-generated Lexer & Parser.

| Name        |     Type      | Default value |
| ----------- | :-----------: | :-----------: |
| id          |    string     |       -       |
| initialRule |    string     |       -       |
| grammar     |    string     |       -       |
| Lexer       | Antlr4 Lexer  |       -       |
| Parser      | Antlr4 Parser |       -       |

Have a look to [VTL 2.0 Antlr Tools](https://github.com/Making-Sense-Info/VTL-2.0-ANTLR-Tools-TS) for example.

For autosuggestion, provide `getSuggestionsFromRange` (example [here](https://github.com/Making-Sense-Info/ANTLR-Editor/blob/main/src/stories/vtl-monaco/suggestions.tsx)).

For highlighting, provide `monarchDefinition` (example [here](https://github.com/Making-Sense-Info/ANTLR-Editor/blob/main/src/stories/vtl-monaco/monarch-definition.json))

#### `customFetcher`

`customFetcher` enable to provide a custom fetch, adding Authorization header for instance:

```javascript
u => fetch(u, headers:{ Authorization: 'Bearer XXX'})
```

This function will be used to fetch `variableURLs` & `sdmxResultURL` props.

#### `variables`

`variables` enable to pass an object to provide auto-suggestion.

The shape of this object is:

```json
const obj = {
    "var1": {"type": "STRING", "role": "IDENTIFIER"},
    "var2": {"type": "INTEGER", "role": "MEASURE"},
}
```

#### `variableURLs`

`variableURLs` enable to pass an array of string to fetch to provide auto-suggestion:

```json
["http://metadata/1", "http://metadata/2"]
```

The shape of each fetched resources has to be:

```json
[
    { "name": "var1", "type": "STRING", "role": "IDENTIFIER" },
    { "name": "var2", "type": "INTEGER", "role": "MEASURE" }
]
```
