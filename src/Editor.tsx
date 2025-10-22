import { useState, useEffect, useRef, useCallback } from "react";
import { validate } from "./utils/ParserFacade";
import { getEditorWillMount, cleanupProviders } from "./utils/providers";
import { Tools, Error, Variables } from "./model";
import { buildVariables, buildUniqueVariables } from "./utils/variables";
import EditorFooter from "./EditorFooter";

// Check if we're in a test environment
const isTestEnvironment = typeof process !== "undefined" && process.env.NODE_ENV === "test";

// Import Monaco Editor components directly
import MonacoEditorComponent from "@monaco-editor/react";
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

loader.config({ monaco });

// Mock objects for test environment
const mockMonacoEditor = () => null;

// Use conditional components
const MonacoEditor = isTestEnvironment ? mockMonacoEditor : MonacoEditorComponent;

export type CursorType = { line: number; column: number; selectionLength: number };

// Monaco Editor event types
interface MonacoCursorPositionEvent {
    position: {
        lineNumber: number;
        column: number;
    };
}

interface MonacoSelectionEvent {
    selection: {
        startLineNumber: number;
        startColumn: number;
        endLineNumber: number;
        endColumn: number;
    };
}

interface MonacoKeyDownEvent {
    keyCode: number;
    key: string;
    code: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    preventDefault: () => void;
    stopPropagation: () => void;
}

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
    options?: any;
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
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const [ready, setReady] = useState<boolean>(false);
    const [vars, setVars] = useState(buildVariables(variables));
    const [isEditorReady, setIsEditorReady] = useState(false);

    const [cursor, setCursor] = useState({
        line: 1,
        column: 1,
        selectionLength: 0
    });

    // Cleanup function to properly dispose of Monaco resources
    const cleanupMonaco = useCallback(() => {
        if (editorRef.current) {
            try {
                // Get the model before disposing
                const model = editorRef.current.getModel();

                // Detach the model first to prevent further rendering
                editorRef.current.setModel(null);

                // Dispose the model
                if (model) {
                    model.dispose();
                }

                // Dispose the editor instance
                editorRef.current.dispose();
            } catch (error) {
                // Silently catch dispose errors - they're expected during cleanup
                console.debug("Monaco editor disposal (expected):", error);
            }
            editorRef.current = null;
        }

        // Clear Monaco reference
        monacoRef.current = null;
        setIsEditorReady(false);

        // Cleanup providers
        cleanupProviders();
    }, []);

    // Handle Monaco disposal errors gracefully - suppress instead of remounting
    useEffect(() => {
        const handleMonacoError = (event: ErrorEvent) => {
            const message = event.error?.message || "";
            if (
                message.includes("InstantiationService has been disposed") ||
                message.includes("domNode") ||
                message.includes("renderText") ||
                message.includes("AnimationFrameQueueItem")
            ) {
                // Suppress Monaco cleanup errors - they're harmless during layout changes
                console.debug("Monaco cleanup error suppressed:", message);
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
            return true;
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const message = event.reason?.message || "";
            if (
                message.includes("InstantiationService has been disposed") ||
                message.includes("domNode") ||
                message.includes("renderText")
            ) {
                // Suppress Monaco cleanup errors in promises
                console.debug("Monaco cleanup promise error suppressed:", message);
                event.preventDefault();
                return false;
            }
            return true;
        };

        window.addEventListener("error", handleMonacoError, true);
        window.addEventListener("unhandledrejection", handleUnhandledRejection);

        return () => {
            window.removeEventListener("error", handleMonacoError, true);
            window.removeEventListener("unhandledrejection", handleUnhandledRejection);
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupMonaco();
        };
    }, [cleanupMonaco]);

    // Track if component is mounted to prevent layout operations after unmount
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const onMount = useCallback(
        (editor: any, mon: any, t: Tools) => {
            editorRef.current = editor;
            monacoRef.current = mon;
            setIsEditorReady(true);

            // Wrap setModel to prevent multiple View creations during layout changes
            const originalSetModel = editor.setModel.bind(editor);
            editor.setModel = function (model: any) {
                const currentModel = editor.getModel();
                // Only set model if it's actually different
                if (currentModel !== model) {
                    try {
                        originalSetModel(model);
                    } catch (error: any) {
                        if (!error.message?.includes("InstantiationService has been disposed")) {
                            throw error;
                        }
                        console.debug("Suppressed setModel error during layout change");
                    }
                }
            };

            // Safe layout wrapper - only layout if mounted
            const originalLayout = editor.layout.bind(editor);
            editor.layout = function (...args: any[]) {
                if (!isMountedRef.current) {
                    console.debug("Skipped layout call on unmounted editor");
                    return;
                }
                try {
                    originalLayout(...args);
                } catch (error: any) {
                    if (
                        !error.message?.includes("InstantiationService has been disposed") &&
                        !error.message?.includes("domNode")
                    ) {
                        throw error;
                    }
                    console.debug("Suppressed layout error during cleanup");
                }
            };

            // Patch the editor's internal rendering to prevent domNode errors
            // This is a deep patch to prevent errors from bubbling up
            try {
                const editorInternal = (editor as any)._view;
                if (editorInternal && editorInternal._renderingCoordinator) {
                    const coordinator = editorInternal._renderingCoordinator;
                    const originalOnRenderScheduled = coordinator._onRenderScheduled;
                    if (originalOnRenderScheduled) {
                        coordinator._onRenderScheduled = function (this: any) {
                            if (!isMountedRef.current || !editorRef.current) {
                                console.debug("Skipped render on unmounted editor");
                                return;
                            }
                            try {
                                originalOnRenderScheduled.call(this);
                            } catch (error: any) {
                                if (
                                    error.message?.includes("domNode") ||
                                    error.message?.includes("renderText")
                                ) {
                                    console.debug("Suppressed Monaco rendering error:", error.message);
                                    return;
                                }
                                throw error;
                            }
                        };
                    }
                }
            } catch {
                console.debug("Could not patch Monaco rendering coordinator (non-critical)");
            }

            // Monaco Editor markers will automatically show error tooltips on hover
            // No need for custom hover provider as it causes duplicates

            // Ensure theme is applied for proper error highlighting
            if (!isTestEnvironment && mon?.editor) {
                // Force theme application
                mon.editor.setTheme(theme || "vs-dark");
            }

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

            editor.onDidChangeCursorPosition((e: MonacoCursorPositionEvent) => {
                setCursor(prev => ({
                    ...prev,
                    line: e.position.lineNumber,
                    column: e.position.column
                }));
            });

            editor.onDidChangeCursorSelection((e: MonacoSelectionEvent) => {
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
                            if (k === "ctrl") keyMod |= mon?.KeyMod?.CtrlCmd || 1;
                            else if (k === "meta") keyMod |= mon?.KeyMod?.CtrlCmd || 1;
                            else if (k === "shift") keyMod |= mon?.KeyMod?.Shift || 2;
                            else if (k === "alt") keyMod |= mon?.KeyMod?.Alt || 4;
                            else {
                                const upper = k.length === 1 ? k.toUpperCase() : k;
                                if (mon?.KeyCode && `Key${upper}` in mon.KeyCode) {
                                    keyCode = mon.KeyCode[`Key${upper}` as keyof typeof mon.KeyCode];
                                } else if (mon?.KeyCode && upper in mon.KeyCode) {
                                    keyCode = mon.KeyCode[upper as keyof typeof mon.KeyCode];
                                } else {
                                    keyCode = null;
                                }
                            }
                        });

                        if (keyCode !== null) {
                            editor.addCommand(keyMod | keyCode, (e: any) => {
                                e?.preventDefault?.();
                                action();
                            });
                        }
                    });
                });
            }

            editor.onKeyDown((e: MonacoKeyDownEvent) => {
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
        },
        [script, shortcuts]
    );

    const parseContent = useCallback(
        (t: Tools, str?: string) => {
            const editor = editorRef.current;
            if (!editor) return;

            // Check if model exists before parsing
            const model = editor?.getModel();
            if (!model) {
                console.debug("parseContent: model not ready yet");
                return;
            }

            // Use provided string or get value from editor
            const content = str !== undefined ? str : editor.getValue();
            const monacoErrors: any[] = validate(t)(content).map(error => {
                return {
                    startLineNumber: error.startLine,
                    startColumn: error.startCol,
                    endLineNumber: error.endLine,
                    endColumn: error.endCol,
                    message: error.message,
                    severity: isTestEnvironment
                        ? 1
                        : monacoRef.current?.editor?.MarkerSeverity?.Error || 8
                };
            });

            if (!isTestEnvironment && monacoRef.current?.editor) {
                // Clear existing markers first
                monacoRef.current.editor.setModelMarkers(model, "owner", []);
                // Set new markers
                monacoRef.current.editor.setModelMarkers(model, "owner", monacoErrors);
            }

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
                {isTestEnvironment ? (
                    // Test environment - render a simple textarea
                    <textarea
                        data-testid="monaco-editor-mock"
                        value={script || ""}
                        onChange={e => {
                            setScript?.(e.target.value);
                            // Simulate cursor position
                            const textarea = e.target;
                            const cursorPos = textarea.selectionStart;
                            const lines = textarea.value.substring(0, cursorPos).split("\n");
                            setCursor({
                                line: lines.length,
                                column: lines[lines.length - 1].length + 1,
                                selectionLength: 0
                            });
                        }}
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "1px solid #ccc",
                            fontFamily: "monospace",
                            fontSize: "14px",
                            padding: "10px",
                            resize: "none"
                        }}
                        placeholder="Editor content (test mode)"
                    />
                ) : (
                    // Production environment - use Monaco Editor
                    <MonacoEditor
                        value={script}
                        height="100%"
                        width="100%"
                        onMount={(e: any, m: any) => {
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
                )}
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
