import { useState } from "react";
import Editor from "../Editor";
import * as tools from "@making-sense/vtl-2-1-antlr-tools-ts";
import { getSuggestionsFromRange, monarchDefinition } from "@making-sense/vtl-2-1-monaco-tools-ts";

const customTools = { ...tools, getSuggestionsFromRange, monarchDefinition };

const EditorForStories = (props: any) => {
    const { initialRule = "start" } = props;
    return <Editor {...props} tools={{ ...customTools, initialRule }} />;
};

export default {
    title: "EnhancedEditor",
    component: EditorForStories,
    tags: ["autodocs"]
};

export const Default = {
    args: { initialRule: "start" },
    argTypes: {
        initialRule: { control: "select", options: ["start", "expr"] }
    }
};

// Story with resizing test
export const ResizingTest = {
    render: () => {
        const [height, setHeight] = useState("300px");
        const [width, setWidth] = useState("100%");
        const [script, setScript] = useState(`ds_out := ds_in [calc r := random(150, 20)]
                [calc c := case when r < 0.2 then "Low" when r > 0.8 then "High" else "Medium"];
a := datediff(cast("2022Q1", time_period), cast("2023Q2", time_period));
b := dateadd(cast("2022Q1", time_period), 5, "M");
c := getyear(cast("2022Q1", time_period));
d := getmonth(cast("2020-12-14", date));
e := dayofmonth(cast("2020-12-14", date));
f := dayofyear(cast("2020-12-14", date));
g := daytoyear(422);
h := daytomonth(146);
i := yeartoday(cast("P1Y20D", duration));
j := monthtoday(cast("P3M10D", duration));`);

        const resizeButtons = [
            { label: "Small", height: "200px", width: "50%" },
            { label: "Medium", height: "300px", width: "75%" },
            { label: "Large", height: "400px", width: "100%" },
            { label: "Extra Large", height: "500px", width: "100%" }
        ];

        return (
            <div style={{ padding: "20px" }}>
                <h3>Enhanced Editor Resizing Test</h3>
                <p>
                    Test that the editor resizes without remounting. The editor should maintain its state
                    (cursor position, selection, etc.) when resizing.
                </p>

                <div style={{ marginBottom: "20px" }}>
                    <h4>Resize Controls:</h4>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {resizeButtons.map(button => (
                            <button
                                key={button.label}
                                onClick={() => {
                                    setHeight(button.height);
                                    setWidth(button.width);
                                }}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#007acc",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <h4>
                        Current Size: {width} x {height}
                    </h4>
                </div>

                <div style={{ border: "2px solid #ccc", borderRadius: "4px", overflow: "hidden" }}>
                    <EditorForStories
                        script={script}
                        setScript={setScript}
                        height={height}
                        width={width}
                        theme="vs-dark"
                        tools={{ ...customTools, initialRule: "start" }}
                        shortcuts={{
                            "ctrl+s, meta+s": () => console.log("Save triggered"),
                            "ctrl+enter, meta+enter": () => console.log("Run triggered")
                        }}
                        displayFooter={true}
                        options={{
                            lineNumbers: "on",
                            minimap: { enabled: true },
                            readOnly: false
                        }}
                    />
                </div>

                <div
                    style={{
                        marginTop: "20px",
                        padding: "10px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px"
                    }}
                >
                    <h4>Test Instructions:</h4>
                    <ol>
                        <li>Click in the editor and position your cursor somewhere in the middle</li>
                        <li>Select some text</li>
                        <li>Click the resize buttons above</li>
                        <li>Verify that your cursor position and selection are preserved</li>
                        <li>
                            Check the browser console - there should be no "Monaco InstantiationService
                            disposal" errors
                        </li>
                    </ol>
                </div>
            </div>
        );
    }
};

// Story with layout change simulation
export const LayoutChangeTest = {
    render: () => {
        const [layout, setLayout] = useState("horizontal");
        const [script, setScript] = useState(`ds_out := ds_in [calc r := random(150, 20)]
                [calc c := case when r < 0.2 then "Low" when r > 0.8 then "High" else "Medium"];`);

        return (
            <div style={{ padding: "20px" }}>
                <h3>Layout Change Test</h3>
                <p>
                    Simulate layout changes that might occur in a real application. The editor should not
                    remount when the layout changes.
                </p>

                <div style={{ marginBottom: "20px" }}>
                    <h4>Layout Controls:</h4>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            onClick={() => setLayout("horizontal")}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: layout === "horizontal" ? "#007acc" : "#ccc",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Horizontal Layout
                        </button>
                        <button
                            onClick={() => setLayout("vertical")}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: layout === "vertical" ? "#007acc" : "#ccc",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Vertical Layout
                        </button>
                    </div>
                </div>

                <div
                    style={{
                        display: layout === "horizontal" ? "flex" : "block",
                        gap: "10px",
                        height: "400px"
                    }}
                >
                    <div
                        style={{
                            flex: layout === "horizontal" ? "1" : "none",
                            height: layout === "vertical" ? "200px" : "100%"
                        }}
                    >
                        <h4>Editor Panel</h4>
                        <div
                            style={{
                                border: "2px solid #ccc",
                                borderRadius: "4px",
                                overflow: "hidden",
                                height: "calc(100% - 30px)"
                            }}
                        >
                            <EditorForStories
                                script={script}
                                setScript={setScript}
                                height="100%"
                                width="100%"
                                theme="vs-dark"
                                tools={{ ...customTools, initialRule: "start" }}
                                shortcuts={{
                                    "ctrl+s, meta+s": () => console.log("Save triggered"),
                                    "ctrl+enter, meta+enter": () => console.log("Run triggered")
                                }}
                                displayFooter={true}
                                options={{
                                    lineNumbers: "on",
                                    minimap: { enabled: true },
                                    readOnly: false
                                }}
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            flex: layout === "horizontal" ? "1" : "none",
                            height: layout === "vertical" ? "200px" : "100%",
                            backgroundColor: "#f5f5f5",
                            padding: "10px",
                            borderRadius: "4px"
                        }}
                    >
                        <h4>Side Panel</h4>
                        <p>This panel simulates other UI elements that might cause layout changes.</p>
                        <p>
                            Current layout: <strong>{layout}</strong>
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        marginTop: "20px",
                        padding: "10px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px"
                    }}
                >
                    <h4>Test Instructions:</h4>
                    <ol>
                        <li>Click in the editor and position your cursor</li>
                        <li>Type some text or select existing text</li>
                        <li>Switch between horizontal and vertical layouts</li>
                        <li>Verify that the editor content and cursor position are preserved</li>
                        <li>Check the browser console for any disposal errors</li>
                    </ol>
                </div>
            </div>
        );
    }
};

// Story with error boundary test
export const ErrorBoundaryTest = {
    render: () => {
        const [script, setScript] = useState(`ds_out := ds_in [calc r := random(150, 20)]`);
        const [forceError, setForceError] = useState(false);

        return (
            <div style={{ padding: "20px" }}>
                <h3>Error Boundary Test</h3>
                <p>Test the error handling capabilities of the Enhanced Editor.</p>

                <div style={{ marginBottom: "20px" }}>
                    <button
                        onClick={() => setForceError(!forceError)}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: forceError ? "#ff4444" : "#007acc",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        {forceError ? "Disable Error Simulation" : "Simulate Monaco Error"}
                    </button>
                </div>

                {forceError && (
                    <div
                        style={{
                            padding: "10px",
                            backgroundColor: "#fff3cd",
                            border: "1px solid #ffeaa7",
                            borderRadius: "4px",
                            marginBottom: "20px"
                        }}
                    >
                        <strong>Error Simulation Active:</strong> This will trigger Monaco disposal
                        errors to test the error handling and recovery mechanisms.
                    </div>
                )}

                <div
                    style={{
                        border: "2px solid #ccc",
                        borderRadius: "4px",
                        overflow: "hidden",
                        height: "400px"
                    }}
                >
                    <EditorForStories
                        script={script}
                        setScript={setScript}
                        height="100%"
                        width="100%"
                        theme="vs-dark"
                        tools={{ ...customTools, initialRule: "start" }}
                        shortcuts={{
                            "ctrl+s, meta+s": () => console.log("Save triggered"),
                            "ctrl+enter, meta+enter": () => console.log("Run triggered")
                        }}
                        displayFooter={true}
                        options={{
                            lineNumbers: "on",
                            minimap: { enabled: true },
                            readOnly: false
                        }}
                    />
                </div>

                <div
                    style={{
                        marginTop: "20px",
                        padding: "10px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px"
                    }}
                >
                    <h4>Test Instructions:</h4>
                    <ol>
                        <li>Position your cursor and type some text</li>
                        <li>Click "Simulate Monaco Error" to trigger disposal errors</li>
                        <li>Verify that the editor recovers gracefully</li>
                        <li>Check that your content and cursor position are preserved</li>
                        <li>Monitor the browser console for error handling messages</li>
                    </ol>
                </div>
            </div>
        );
    }
};
