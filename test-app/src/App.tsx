import { AntlrEditor } from "@making-sense/antlr-editor";
import * as tools from "@making-sense/vtl-2-0-antlr-tools-ts";
import { getSuggestionsFromRange, monarchDefinition } from "@making-sense/vtl-2-0-monaco-tools-ts";

const customTools = { ...tools, getSuggestionsFromRange, monarchDefinition };

const App = () => (
    <AntlrEditor
        onListErrors={e => {
            console.log(e);
        }}
        tools={customTools}
    />
);

export default App;
