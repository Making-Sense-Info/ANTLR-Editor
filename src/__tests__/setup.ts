import { vi } from "vitest";

// Mock global objects
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
}));

// Mock performance API
Object.defineProperty(window, "performance", {
    writable: true,
    value: {
        now: vi.fn(() => Date.now()),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByName: vi.fn(() => []),
        getEntriesByType: vi.fn(() => []),
        memory: {
            usedJSHeapSize: 1000000,
            totalJSHeapSize: 2000000,
            jsHeapSizeLimit: 4000000
        }
    }
});

// Mock console methods to reduce noise in tests
const originalConsole = console;
global.console = {
    ...originalConsole,
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn()
};

// Mock Monaco Editor globals
global.monaco = {
    editor: {
        setModelMarkers: vi.fn(),
        MarkerSeverity: { Error: 1, Warning: 2, Info: 3, Hint: 4 }
    },
    KeyMod: { CtrlCmd: 1, Shift: 2, Alt: 4 },
    KeyCode: { KeyS: 1, Enter: 2, KeyZ: 3, KeyY: 4 }
};

// Mock React for tests
global.React = {
    useState: vi.fn(),
    useEffect: vi.fn(),
    useRef: vi.fn(),
    useCallback: vi.fn(),
    useMemo: vi.fn(),
    memo: vi.fn(),
    Component: vi.fn(),
    createElement: vi.fn()
};

// Mock Monaco Editor module
vi.mock("monaco-editor", () => ({
    editor: {
        setModelMarkers: vi.fn(),
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
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() }))
    },
    MarkerSeverity: { Error: 1, Warning: 2, Info: 3, Hint: 4 }
}));

// Mock Monaco Editor ESM import
vi.mock("monaco-editor/esm/vs/editor/editor.api", () => ({
    editor: {
        setModelMarkers: vi.fn(),
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
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() }))
    },
    MarkerSeverity: { Error: 1, Warning: 2, Info: 3, Hint: 4 }
}));

// Mock @monaco-editor/react
vi.mock("@monaco-editor/react", () => ({
    default: vi.fn(({ onMount, ...props }) => {
        // Simulate component mounting
        if (onMount) {
            setTimeout(() => {
                const mockEditor = {
                    dispose: vi.fn(),
                    getValue: vi.fn(() => ""),
                    setValue: vi.fn(),
                    onDidChangeModelContent: vi.fn(() => ({ dispose: vi.fn() })),
                    onDidChangeCursorPosition: vi.fn(() => ({ dispose: vi.fn() })),
                    onDidChangeCursorSelection: vi.fn(() => ({ dispose: vi.fn() })),
                    addCommand: vi.fn(),
                    onKeyDown: vi.fn(() => ({ dispose: vi.fn() })),
                    getModel: vi.fn(() => ({ dispose: vi.fn() }))
                };
                const mockMonaco = {
                    editor: {
                        setModelMarkers: vi.fn(),
                        MarkerSeverity: { Error: 1, Warning: 2, Info: 3, Hint: 4 }
                    },
                    KeyMod: { CtrlCmd: 1, Shift: 2, Alt: 4 },
                    KeyCode: { KeyS: 1, Enter: 2, KeyZ: 3, KeyY: 4 }
                };
                onMount(mockEditor, mockMonaco);
            }, 0);
        }
        return null;
    }),
    loader: {
        config: vi.fn()
    }
}));
