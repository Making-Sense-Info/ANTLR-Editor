// Global Monaco Editor mock
global.monaco = {
    editor: {
        setModelMarkers: () => {},
        MarkerSeverity: { Error: 1, Warning: 2, Info: 3, Hint: 4 },
        IStandaloneEditorConstructionOptions: {},
        IEditorOptions: {},
        ITextModel: {},
        IStandaloneCodeEditor: {},
        ICodeEditor: {}
    },
    KeyMod: { CtrlCmd: 1, Shift: 2, Alt: 4 },
    KeyCode: { KeyS: 1, Enter: 2, KeyZ: 3, KeyY: 4 },
    languages: {
        register: () => {},
        setMonarchTokensProvider: () => {},
        setLanguageConfiguration: () => {},
        registerCompletionItemProvider: () => ({ dispose: () => {} })
    },
    MarkerSeverity: { Error: 1, Warning: 2, Info: 3, Hint: 4 }
};

// Mock Monaco Editor module
module.exports = {
    editor: global.monaco.editor,
    KeyMod: global.monaco.KeyMod,
    KeyCode: global.monaco.KeyCode,
    languages: global.monaco.languages,
    MarkerSeverity: global.monaco.MarkerSeverity
};
