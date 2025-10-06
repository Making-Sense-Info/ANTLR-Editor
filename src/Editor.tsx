import { useState, useEffect, useRef, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";
import { validate } from "./utils/ParserFacade";
import { getEditorWillMount, cleanupProviders } from "./utils/providers";
import { Tools, Error, Variables } from "./model";
import { buildVariables, buildUniqueVariables } from "./utils/variables";
import EditorFooter from "./EditorFooter";

loader.config({
    monaco
});

export type CursorType = { line: number; column: number; selectionLength: number };

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
    FooterComponent?: React.FC<{ cursor: CursorType }>;
    displayFooter: boolean;
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
    shortcuts,
    FooterComponent,
    displayFooter = true
}: EditorProps) => {
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof Monaco | null>(null);
    const [ready, setReady] = useState<boolean>(false);
    const [vars, setVars] = useState(buildVariables(variables));
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [editorKey, setEditorKey] = useState(0);

    const [cursor, setCursor] = useState({
        line: 1,
        column: 1,
        selectionLength: 0
    });

    // Cleanup function to properly dispose of Monaco resources
    const cleanupMonaco = useCallback(() => {
        if (editorRef.current) {
            try {
                // Dispose the editor instance
                editorRef.current.dispose();
            } catch (error) {
                console.warn("Error disposing Monaco editor:", error);
            }
            editorRef.current = null;
        }

        // Clear Monaco reference
        monacoRef.current = null;
        setIsEditorReady(false);

        // Cleanup providers
        cleanupProviders();
    }, []);

    // Handle Monaco disposal errors gracefully
    useEffect(() => {
        const handleMonacoError = (event: ErrorEvent) => {
            if (event.error?.message?.includes("InstantiationService has been disposed")) {
                console.warn("Monaco InstantiationService disposal detected, cleaning up...");
                cleanupMonaco();
                // Force a remount with a new key
                setEditorKey(prev => prev + 1);
                event.preventDefault();
                return false;
            }
            return true;
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            if (event.reason?.message?.includes("InstantiationService has been disposed")) {
                console.warn("Monaco InstantiationService disposal detected in promise, cleaning up...");
                cleanupMonaco();
                setEditorKey(prev => prev + 1);
                event.preventDefault();
                return false;
            }
            return true;
        };

        window.addEventListener("error", handleMonacoError);
        window.addEventListener("unhandledrejection", handleUnhandledRejection);

        return () => {
            window.removeEventListener("error", handleMonacoError);
            window.removeEventListener("unhandledrejection", handleUnhandledRejection);
        };
    }, [cleanupMonaco]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupMonaco();
        };
    }, [cleanupMonaco]);

    const onMount = (editor: Monaco.editor.IStandaloneCodeEditor, mon: typeof Monaco, t: Tools) => {
        editorRef.current = editor;
        monacoRef.current = mon;
        setIsEditorReady(true);

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
            setCursor(prev => ({
                ...prev,
                line: e.position.lineNumber,
                column: e.position.column
            }));
        });

        editor.onDidChangeCursorSelection(e => {
            const selection = e.selection;
            const length = editor?.getModel()?.getValueInRange(selection).length;
            setCursor(prev => ({
                ...prev,
                selectionLength: length || 0
            }));
        });

        if (shortcuts) {
            Object.entries(shortcuts).forEach(([comboString, action]) => {
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
                            if (`Key${upper}` in monaco.KeyCode) {
                                keyCode = monaco.KeyCode[`Key${upper}` as keyof typeof monaco.KeyCode];
                            } else if (upper in monaco.KeyCode) {
                                keyCode = monaco.KeyCode[upper as keyof typeof monaco.KeyCode];
                            } else {
                                keyCode = null;
                            }
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
            if (!editor || !monacoRef.current) return;

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
        if (isEditorReady) {
            parseContent(tools);
        }
    }, [tools.initialRule, isEditorReady, parseContent, tools]);

    const isDark = theme.includes("dark");

    if (!ready) return null;

    const bannerHeight = displayFooter ? 22 : 0;

    return (
        <div style={{ position: "relative", height, width }}>
            <div style={{ height: `calc(100% - ${bannerHeight}px)` }}>
                <MonacoEditor
                    key={editorKey} // Use key to force remount when needed
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
                        if (isEditorReady) {
                            parseContent(tools);
                        }
                    }}
                    theme={theme}
                    language={tools.id}
                    options={options}
                />
            </div>
            {displayFooter && (
                <div
                    style={{
                        position: "absolute",
                        height: bannerHeight,
                        width: "100%",
                        bottom: 0,
                        left: 0,
                        gap: "12px",
                        padding: "4px 8px",
                        background: isDark ? "#1e1e1e" : "#f3f3f3",
                        color: isDark ? "#ccc" : "#333",
                        borderTop: `1px solid ${isDark ? "#333" : "#ccc"}`,
                        zIndex: 10,
                        boxSizing: "border-box"
                    }}
                >
                    <EditorFooter cursor={cursor} FooterComponent={FooterComponent} />
                </div>
            )}
        </div>
    );
};

export default Editor;
