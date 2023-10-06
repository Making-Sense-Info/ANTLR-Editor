import Editor from "../Editor";
import * as tools from "@making-sense/vtl-2-0-antlr-tools-ts";
import { getSuggestions, monarchTokens } from "./vtl-monaco";

enum VariableType {
    STRING = "STRING",
    INTEGER = "INTEGER",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN"
}

enum VariableRole {
    IDENTIFIER = "IDENTIFIER",
    MEASURE = "MEASURE",
    DIMENSION = "DIMENSION"
}

const customTools = { ...tools, getSuggestions, monarchTokens };

const App = () => (
    <Editor
        setScript={s => console.log("script: ", s)}
        onCursorChange={c => console.log("onCursorChange: ", c)}
        variables={{
            name: { type: VariableType.STRING, role: VariableRole.IDENTIFIER },
            age: { type: VariableType.INTEGER, role: VariableRole.MEASURE }
        }}
        tools={customTools}
    />
);

export default App;
