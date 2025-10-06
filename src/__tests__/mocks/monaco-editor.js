// Mock Monaco Editor for testing
export const editor = {
    setModelMarkers: () => {},
    MarkerSeverity: { Error: 1, Warning: 2, Info: 3, Hint: 4 },
    IStandaloneEditorConstructionOptions: {},
    IEditorOptions: {},
    ITextModel: {},
    IStandaloneCodeEditor: {},
    ICodeEditor: {}
};

export const KeyMod = { CtrlCmd: 1, Shift: 2, Alt: 4 };
export const KeyCode = { KeyS: 1, Enter: 2, KeyZ: 3, KeyY: 4 };

export const languages = {
    register: () => {},
    setMonarchTokensProvider: () => {},
    setLanguageConfiguration: () => {},
    registerCompletionItemProvider: () => ({ dispose: () => {} })
};

export const MarkerSeverity = { Error: 1, Warning: 2, Info: 3, Hint: 4 };

// Mock for the ESM import
export * from "./monaco-editor.js";

export default {
    editor,
    KeyMod,
    KeyCode,
    languages,
    MarkerSeverity
};
