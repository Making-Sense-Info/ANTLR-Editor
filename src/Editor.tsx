import { useState, useEffect, useRef, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";
import { validate } from "./utils/ParserFacade";
import { getEditorWillMount } from "./utils/providers";
import { Tools, Error, Variables } from "./model";
import { buildVariables, buildUniqueVariables } from "./utils/variables";

loader.config({
    monaco
});

type EditorProps = {
    script?: string;
    setScript?: (value: string) => void;
    customFetcher?: (url: string) => Promise<any>;
    variables?: Variables;
    variablesInputURLs?: string[];
    tools: Tools;
    onListErrors?: (errors: Error[]) => void;
    height?: string;
    width?: string;
    theme?: string;
    options?: Monaco.editor.IStandaloneEditorConstructionOptions;
    shortcuts: Record<string, () => void>;
};

const Editor = ({
    script,
    setScript,
    onListErrors,
    customFetcher,
    variables,
    variablesInputURLs,
    tools,
    height = "50vh",
    width = "100%",
    theme = "vs-dark",
    options,
    shortcuts
}: EditorProps) => {
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof Monaco | null>(null);
    const [ready, setReady] = useState<boolean>(false);
    const [vars, setVars] = useState(buildVariables(variables));

    const [status, setStatus] = useState({
        line: 1,
        column: 1,
        selectionLength: 0
    });

    const onMount = (editor: Monaco.editor.IStandaloneCodeEditor, mon: typeof Monaco, t: Tools) => {
        editorRef.current = editor;
        monacoRef.current = mon;
        let parseContentTO: NodeJS.Timeout;
        let contentChangeTO: NodeJS.Timeout | undefined;
        parseContent(t, script);
        editor.onDidChangeModelContent(() => {
            if (parseContentTO) clearTimeout(parseContentTO);
            parseContentTO = setTimeout(() => {
                parseContent(t, script);
            }, 0);
            if (!contentChangeTO) {
                if (setScript) {
                    contentChangeTO = setTimeout(() => {
                        setScript(editor.getValue());
                        contentChangeTO = undefined;
                    }, 200);
                }
            }
        });

        editor.onDidChangeCursorPosition(e => {
            setStatus(prev => ({
                ...prev,
                line: e.position.lineNumber,
                column: e.position.column
            }));
        });

        editor.onDidChangeCursorSelection(e => {
            const selection = e.selection;
            const length = editor?.getModel()?.getValueInRange(selection).length;
            if (length) {
                setStatus(prev => ({
                    ...prev,
                    selectionLength: length
                }));
            }
        });

        if (shortcuts) {
            Object.entries(shortcuts).forEach(([comboString, action]) => {
                // Chaque combo peut avoir plusieurs variantes séparées par ","
                comboString.split(",").forEach(combo => {
                    const keys = combo.trim().toLowerCase().split("+");
                    let keyCode = null;
                    let keyMod = 0;

                    keys.forEach(k => {
                        if (k === "ctrl") keyMod |= monaco.KeyMod.CtrlCmd;
                        else if (k === "meta") keyMod |= monaco.KeyMod.CtrlCmd;
                        else if (k === "shift") keyMod |= monaco.KeyMod.Shift;
                        else if (k === "alt") keyMod |= monaco.KeyMod.Alt;
                        else {
                            const upper = k.length === 1 ? k.toUpperCase() : k;
                            keyCode = monaco.KeyCode[`Key${upper}`] || monaco.KeyCode[upper];
                        }
                    });

                    if (keyCode !== null) {
                        editor.addCommand(keyMod | keyCode, e => {
                            e?.preventDefault?.();
                            action();
                        });
                    }
                });
            });
        }

        editor.onKeyDown(e => {
            const isMac = /Mac/.test(navigator.userAgent);
            const metaPressed = e.metaKey;
            const ctrlPressed = e.ctrlKey;

            if (
                (isMac && metaPressed && e.code === "Enter") ||
                (!isMac && ctrlPressed && e.code === "Enter")
            ) {
                e.preventDefault();
                e.stopPropagation();
                shortcuts["ctrl+enter, meta+enter"]?.();
            }
        });
    };

    const parseContent = useCallback(
        (t: Tools, str?: string) => {
            const editor = editorRef.current;
            const monacoErrors: Monaco.editor.IMarkerData[] = validate(t)(editor?.getValue() || str).map(
                error => {
                    return {
                        startLineNumber: error.startLine,
                        startColumn: error.startCol,
                        endLineNumber: error.endLine,
                        endColumn: error.endCol,
                        message: error.message,
                        severity: Monaco.MarkerSeverity.Error
                    } as Monaco.editor.IMarkerData;
                }
            );
            const model = editor?.getModel();
            if (model) monacoRef.current?.editor.setModelMarkers(model, "owner", monacoErrors);
            if (onListErrors) {
                onListErrors(
                    monacoErrors.map(error => {
                        return {
                            line: error.startLineNumber,
                            column: error.startColumn,
                            message: error.message
                        } as Error;
                    })
                );
            }
        },
        [onListErrors]
    );

    useEffect(() => {
        if (!Array.isArray(variablesInputURLs) || variablesInputURLs.length === 0) setReady(true);
        const f = customFetcher || fetch;
        if (variablesInputURLs && variablesInputURLs.length > 0 && !ready) {
            Promise.all(variablesInputURLs.map(v => f(v)))
                .then(res =>
                    Promise.all(res.map(r => r.json())).then(res => {
                        const uniqueVars = buildUniqueVariables(res);
                        setVars(v => [...v, ...uniqueVars]);
                        setReady(true);
                    })
                )
                .catch(() => {
                    setReady(true);
                });
        }
    }, [variablesInputURLs]);

    useEffect(() => {
        parseContent(tools);
    }, [tools.initialRule]);

    const isDark = theme.includes("dark");

    if (!ready) return null;

    const bannerHeight = 22;

    return (
        <div style={{ position: "relative", height, width }}>
            <div style={{ height: `calc(100% - ${bannerHeight}px)` }}>
                <MonacoEditor
                    value={script}
                    height="100%"
                    width="100%"
                    onMount={(e, m) => {
                        parseContent(tools, script);
                        onMount(e, m, tools);
                        getEditorWillMount(tools)({
                            variables: vars,
                            editor: e
                        })(m);
                    }}
                    onChange={() => {
                        parseContent(tools);
                    }}
                    theme={theme}
                    language={tools.id}
                    options={options}
                />
            </div>
            <div
                style={{
                    position: "absolute",
                    height: bannerHeight,
                    width: "100%",
                    bottom: 0,
                    left: 0,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    padding: "4px 8px",
                    background: isDark ? "#1e1e1e" : "#f3f3f3",
                    color: isDark ? "#ccc" : "#333",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    borderTop: `1px solid ${isDark ? "#333" : "#ccc"}`,
                    zIndex: 10,
                    boxSizing: "border-box"
                }}
            >
                <span>
                    Line {status.line} - Column {status.column}
                </span>
                {status.selectionLength > 0 && <span>({status.selectionLength} selected)</span>}
            </div>
        </div>
    );
};

export default Editor;
