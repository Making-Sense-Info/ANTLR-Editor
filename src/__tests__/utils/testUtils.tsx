import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

// Custom render function that includes providers
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) => {
    return render(ui, {
        // Add any global providers here if needed
        ...options
    });
};

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

// Test utilities
export const createMockTools = (overrides = {}) => ({
    id: "vtl",
    initialRule: "start",
    grammar: "grammar VTL;",
    Lexer: vi.fn(),
    Parser: vi.fn(),
    ...overrides
});

export const createMockMonacoEditor = (overrides = {}) => ({
    dispose: vi.fn(),
    getValue: vi.fn(() => ""),
    setValue: vi.fn(),
    onDidChangeModelContent: vi.fn(() => ({ dispose: vi.fn() })),
    onDidChangeCursorPosition: vi.fn(() => ({ dispose: vi.fn() })),
    onDidChangeCursorSelection: vi.fn(() => ({ dispose: vi.fn() })),
    addCommand: vi.fn(),
    onKeyDown: vi.fn(() => ({ dispose: vi.fn() })),
    getModel: vi.fn(() => ({ dispose: vi.fn() })),
    ...overrides
});

export const createMockMonaco = (overrides = {}) => ({
    editor: {
        setModelMarkers: vi.fn(),
        MarkerSeverity: { Error: 1, Warning: 2, Info: 3, Hint: 4 }
    },
    KeyMod: { CtrlCmd: 1, Shift: 2, Alt: 4 },
    KeyCode: { KeyS: 1, Enter: 2, KeyZ: 3, KeyY: 4 },
    ...overrides
});

export const createMockError = (message: string) => {
    const error = new Error(message);
    Object.defineProperty(error, "message", {
        value: message,
        writable: false
    });
    return error;
};

export const createMockErrorEvent = (error: Error) => {
    const event = new ErrorEvent("error", { error });
    Object.defineProperty(event, "preventDefault", {
        value: vi.fn()
    });
    return event;
};

export const createMockRejectionEvent = (reason: any) => {
    const event = new PromiseRejectionEvent("unhandledrejection", {
        reason,
        promise: Promise.reject()
    });
    Object.defineProperty(event, "preventDefault", {
        value: vi.fn()
    });
    return event;
};

// Performance testing utilities
export const measurePerformance = (fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    return end - start;
};

export const waitForAsync = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Accessibility testing utilities
export const checkAriaAttributes = (element: HTMLElement, expected: Record<string, string>) => {
    Object.entries(expected).forEach(([attr, value]) => {
        expect(element).toHaveAttribute(attr, value);
    });
};

export const checkRole = (element: HTMLElement, expectedRole: string) => {
    expect(element).toHaveAttribute("role", expectedRole);
};

export const checkAriaLabel = (element: HTMLElement, expectedLabel: string) => {
    expect(element).toHaveAttribute("aria-label", expectedLabel);
};

// Mock data generators
export const generateLargeScript = (lines: number = 1000) => "a := 1;\n".repeat(lines);

export const generateMockVariables = (count: number = 10) => {
    const variables: Record<string, any> = {};
    for (let i = 0; i < count; i++) {
        variables[`var${i}`] = {
            type: i % 2 === 0 ? "STRING" : "INTEGER",
            role: i % 3 === 0 ? "IDENTIFIER" : "MEASURE"
        };
    }
    return variables;
};

export const generateMockErrors = (count: number = 5) => {
    const errors = [];
    for (let i = 0; i < count; i++) {
        errors.push({
            line: i + 1,
            column: (i + 1) * 5,
            message: `Error ${i + 1}`
        });
    }
    return errors;
};
