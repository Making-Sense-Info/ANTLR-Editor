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
    options
}: EditorProps) => {
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof Monaco | null>(null);
    const [ready, setReady] = useState<boolean>(false);
    const [vars, setVars] = useState(buildVariables(variables));

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

    if (!ready) return null;

    return (
        <MonacoEditor
            value={script}
            height={height}
            width={width}
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
    );
};

export default Editor;
