import VtlEditor from "./VtlEditor";

export default {
    title: "VtlEditor",
    component: VtlEditor,
    tags: ["autodocs"]
};

export const Default = {};

export const Styled = {
    args: {
        theme: "vs-dark",
        height: "50vh",
        width: "80%",
        options: { lineNumbers: true, minimap: { enabled: true }, readOnly: false }
    },
    argTypes: {
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
    args: { variables },
    argTypes: {
        variables: { control: "object" }
    }
};
