import { useState, useRef, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { validate } from "./utils/ParserFacade";
import { getEditorWillMount } from "./utils/providers";
import { Tools, Error, CursorPosition, Variables, SdmxResult } from "./model";
import { buildVariables } from "./utils/variables";

type EditorProps = {
    // script: string;
    setScript: (value: string) => void;
    // customFetcher?: (url: string) => Promise<any>;
    sdmxResult?: SdmxResult;
    // sdmxResultURL?: string;
    // readOnly?: boolean;
    variables: Variables;
    // variableURLs: string[];
    tools: Tools;
    // options: Options;
    onCursorChange: (position: CursorPosition) => void;
    onListErrors?: (errors: Error[]) => void;
    // movedCursor?: CursorPosition;
    // resizeLayout?: any;
};

const Editor = ({
    setScript,
    onListErrors,
    onCursorChange,
    variables,
    sdmxResult,
    tools
}: EditorProps) => {
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof Monaco | null>(null);
    const [vars] = useState(buildVariables(variables));
    const [sdmxRes] = useState(sdmxResult);

    const onMount = (editor: Monaco.editor.IStandaloneCodeEditor, mon: typeof Monaco, t: Tools) => {
        editorRef.current = editor;
        monacoRef.current = mon;
        let parseContentTO: NodeJS.Timeout;
        let contentChangeTO: NodeJS.Timeout | undefined;
        editor.onDidChangeModelContent(() => {
            if (parseContentTO) clearTimeout(parseContentTO);
            parseContentTO = setTimeout(() => parseContent(t), 0);
            if (!contentChangeTO) {
                if (setScript) {
                    contentChangeTO = setTimeout(() => {
                        setScript(editor.getValue());
                        contentChangeTO = undefined;
                    }, 200);
                }
            }
        });

        editor.onDidChangeCursorPosition(() => {
            if (onCursorChange) {
                const position = editor.getPosition();
                if (position)
                    onCursorChange({
                        line: position.lineNumber,
                        column: position.column
                    });
            }
        });
    };

    const parseContent = useCallback(
        (t: Tools) => {
            const editor = editorRef.current;
            if (editor) {
                const monacoErrors: Monaco.editor.IMarkerData[] = validate(t)(editor?.getValue()).map(
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
            }
        },
        [onListErrors]
    );

    function showValue() {
        alert(editorRef.current?.getValue());
    }

    return (
        <>
            <button onClick={showValue}>Show value</button>
            <MonacoEditor
                height="50vh"
                onMount={(e, m) => {
                    onMount(e, m, tools);
                    getEditorWillMount(tools)({
                        variables: vars,
                        sdmxResult: sdmxRes
                    })(m);
                }}
                onChange={() => {
                    parseContent(tools);
                }}
                theme="vs-dark"
                language={tools.id}
            />
        </>
    );
};

export default Editor;
