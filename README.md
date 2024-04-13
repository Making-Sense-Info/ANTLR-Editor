# ANTLR Editor

[![ANTLR Editor CI](https://github.com/Making-Sense-Info/ANTLR-Editor/actions/workflows/ci.yaml/badge.svg)](https://github.com/Making-Sense-Info/ANTLR-Editor/actions/workflows/ci.yaml)
[![NPM version](https://badge.fury.io/js/@making-sense%2Fantlr-editor.svg)](https://badge.fury.io/js/@making-sense%2Fantlr-editor)
[![Storybook](https://cdn.jsdelivr.net/gh/storybookjs/brand@main/badge/badge-storybook.svg)](https://making-sense-info.github.io/ANTLR-Editor)

ANTLR Typescript editor.

## Usage

### Install

```bash
yarn add @making-sense/antlr-editor
```

### Example: VTLEditor

```bash
yarn add @making-sense/antlr-editor @making-sense/vtl-2-0-antlr-tools-ts @making-sense/vtl-2-0-monaco-tools-ts
```

```typescript
import { AntlrEditor as VTLEditor } from "@making-sense/antlr-editor";
import * as VTLTools from "@making-sense/vtl-2-0-antlr-tools-ts";
import { getSuggestionsFromRange, monarchDefinition } from "@making-sense/vtl-2-0-monaco-tools-ts";

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

### Props details

#### `tools`

`tools` has to be Antlr4 auto-generated Lexer & Parser.

| Name        |     Type      | Default value |
| ----------- | :-----------: | :-----------: |
| id          |    string     |       -       |
| initialRule |    string     |       -       |
| grammar     |    string     |       -       |
| Lexer       | Antlr4 Lexer  |       -       |
| Parser      | Antlr4 Parser |       -       |

Have a look to [VTL 2.0 Antlr Tools](https://github.com/Making-Sense-Info/VTL-2.0-ANTLR-Tools-TS) for example.

### `getSuggestionsFromRange` & `monarchDefinition`

Have a look to [VTL 2.0 Monaco Tools](https://github.com/Making-Sense-Info/VTL-2.0-Monaco-Tools-TS) for autosuggestion & highlighting example.

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
