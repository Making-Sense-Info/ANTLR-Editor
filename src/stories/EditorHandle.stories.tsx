import { useRef, useState, type CSSProperties, type Ref } from "react";
import Editor, { EditorHandle } from "../Editor";
import * as tools from "@making-sense/vtl-2-1-antlr-tools-ts";
import { getSuggestionsFromRange, monarchDefinition } from "@making-sense/vtl-2-1-monaco-tools-ts";

const customTools = { ...tools, getSuggestionsFromRange, monarchDefinition };

const SAMPLE_SCRIPT = `// Jump targets are marked with comments
line1 := 1;
line2 := 2;
line3 := 3;
line4 := 4;
target_line := "reveal here"; // line 6
line7 := 7;
line8 := 8;
line9 := 9;
line10 := 10;
line11 := 11;
line12 := 12;
line13 := 13;
line14 := 14;
line15 := 15;
line16 := 16;
line17 := 17;
line18 := 18;
line19 := 19;
line20 := 20;`;

function EditorForStories({
    ref,
    initialRule = "start",
    shortcuts = {},
    displayFooter = true,
    ...rest
}: {
    ref?: Ref<EditorHandle>;
    initialRule?: string;
    shortcuts?: Record<string, () => void>;
    displayFooter?: boolean;
    [key: string]: unknown;
}) {
    return (
        <Editor
            ref={ref}
            {...rest}
            shortcuts={shortcuts}
            displayFooter={displayFooter}
            tools={{ ...customTools, initialRule }}
        />
    );
}

export default {
    title: "EditorHandle",
    component: EditorForStories,
    tags: ["autodocs"]
};

const buttonStyle: CSSProperties = {
    padding: "8px 16px",
    backgroundColor: "#9211FF",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
};

export const RevealPosition = {
    render: () => {
        const editorRef = useRef<EditorHandle>(null);
        const [script, setScript] = useState(SAMPLE_SCRIPT);
        const [lastAction, setLastAction] = useState("—");

        const jumpTo = (line: number, column: number, label: string) => {
            editorRef.current?.revealPosition(line, column);
            setLastAction(`${label} → line ${line}, column ${column}`);
        };

        return (
            <div style={{ padding: "20px" }}>
                <h3>EditorHandle — revealPosition / focus</h3>
                <p>
                    Use the buttons to scroll the editor and place the caret at a given line/column
                    (1-based, Monaco-compatible). This is the API used by host apps to navigate from log
                    errors to source positions.
                </p>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                    <button
                        type="button"
                        style={buttonStyle}
                        onClick={() => jumpTo(6, 1, "Target line")}
                    >
                        Go to line 6 (target_line)
                    </button>
                    <button
                        type="button"
                        style={buttonStyle}
                        onClick={() => jumpTo(15, 10, "Mid script")}
                    >
                        Go to line 15, col 10
                    </button>
                    <button type="button" style={buttonStyle} onClick={() => jumpTo(20, 1, "End")}>
                        Go to line 20
                    </button>
                    <button
                        type="button"
                        style={{ ...buttonStyle, backgroundColor: "#007acc" }}
                        onClick={() => {
                            editorRef.current?.focus();
                            setLastAction("focus()");
                        }}
                    >
                        Focus editor
                    </button>
                </div>

                <p style={{ marginBottom: "16px", fontFamily: "monospace", color: "#666" }}>
                    Last action: {lastAction}
                </p>

                <EditorForStories
                    ref={editorRef}
                    script={script}
                    setScript={setScript}
                    height="400px"
                    width="100%"
                    theme="vs-dark"
                    displayFooter
                    shortcuts={{}}
                    options={{ lineNumbers: "on", minimap: { enabled: false } }}
                />
            </div>
        );
    }
};
