import VtlEditor from "./VtlEditor20";

export default {
    title: "VtlEditor-2.0",
    component: VtlEditor,
    tags: ["autodocs"]
};

export const Default = {
    args: { initialRule: "start" },
    argTypes: {
        initialRule: { control: "select", options: ["start", "expr"] }
    }
};

export const WithInvalidScript = {
    args: { initialRule: "start", "script": "ds := " },
    argTypes: {
        initialRule: { control: "select", options: ["start", "expr"] }
    }
};

export const Styled = {
    args: {
        initialRule: "start",
        theme: "vs-dark",
        height: "50vh",
        width: "80%",
        options: { lineNumbers: true, minimap: { enabled: true }, readOnly: false }
    },
    argTypes: {
        initialRule: { control: "select", options: ["start", "expr"] },
        theme: { control: "select", options: ["vs-dark", "vs-light"] },
        options: { control: "object" }
    }
};

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

const variables = {
    name: { type: VariableType.STRING, role: VariableRole.IDENTIFIER },
    age: { type: VariableType.INTEGER, role: VariableRole.MEASURE }
};

export const Enriched = {
    args: {
        initialRule: "start",
        variables,
        variablesInputURLs: [
            "https://raw.githubusercontent.com/Making-Sense-Info/ANTLR-Editor/gh-pages/samples/variablesInputFile1.json",
            "https://raw.githubusercontent.com/Making-Sense-Info/ANTLR-Editor/gh-pages/samples/variablesInputFile2.json"
        ]
    },
    argTypes: {
        initialRule: { control: "select", options: ["start", "expr"] },
        variables: { control: "object" },
        variablesInputURLs: { control: "object" }
    }
};
