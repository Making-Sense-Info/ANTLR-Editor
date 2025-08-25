import VtlEditor from "./VtlEditor20";
import { type CursorType } from "../Editor";

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

const shortcuts = {
    "ctrl+s, meta+s": () => {
        console.log("Save triggered!");
        // ta logique sauvegarde ici
    },
    "ctrl+enter, meta+enter": () => {
        console.log("Run triggered!");
        // ta logique d'exécution ici
    }
};

export const Enriched = {
    args: {
        initialRule: "start",
        variables,
        variablesInputURLs: [
            "https://raw.githubusercontent.com/Making-Sense-Info/ANTLR-Editor/gh-pages/samples/variablesInputFile1.json",
            "https://raw.githubusercontent.com/Making-Sense-Info/ANTLR-Editor/gh-pages/samples/variablesInputFile2.json"
        ],
        shortcuts,
        FooterComponent: ({ cursor }: { cursor: CursorType }) => (
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    width: "100%"
                }}
            >
                <div>Custom footer</div>
                <div>
                    Line {cursor.line} - Column {cursor.column}
                    {cursor.selectionLength > 0 && <span> ({cursor.selectionLength} selected)</span>}
                </div>
            </div>
        )
    },
    argTypes: {
        initialRule: { control: "select", options: ["start", "expr"] },
        variables: { control: "object" },
        variablesInputURLs: { control: "object" },
        displayFooter: { control: "boolean" }
    }
};
