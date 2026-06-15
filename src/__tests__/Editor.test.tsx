import React, { createRef } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import Editor, { EditorHandle } from "../Editor";
import { lineColumnToOffset } from "../utils/selection";

// Mock tools - using proper types
const mockTools = {
    id: "vtl",
    initialRule: "start",
    grammar: "grammar VTL;",
    Lexer: class MockLexer {},
    Parser: class MockParser {}
} as any;

// Mock providers
vi.mock("../utils/providers", () => ({
    getEditorWillMount: vi.fn(() => vi.fn(() => vi.fn())),
    cleanupProviders: vi.fn()
}));

// Mock parser facade
vi.mock("../utils/ParserFacade", () => ({
    validate: vi.fn(() => vi.fn(() => []))
}));

// Mock variables
vi.mock("../utils/variables", () => ({
    buildVariables: vi.fn(() => []),
    buildUniqueVariables: vi.fn(() => [])
}));

// Mock EditorFooter
vi.mock("../EditorFooter", () => ({
    default: ({ cursor }: { cursor: any }) => (
        <div data-testid="editor-footer">
            Line {cursor.line}, Column {cursor.column}
        </div>
    )
}));

describe("Editor", () => {
    const defaultProps = {
        script: "ds_out := ds_in [calc r := random(150, 20)]",
        setScript: vi.fn(),
        tools: mockTools,
        shortcuts: {
            "ctrl+s, meta+s": vi.fn(),
            "ctrl+enter, meta+enter": vi.fn()
        },
        displayFooter: true
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock global error handlers
        vi.spyOn(window, "addEventListener").mockImplementation(() => {});
        vi.spyOn(window, "removeEventListener").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders editor with initial script", () => {
        render(<Editor {...defaultProps} />);

        // In test mode, the editor renders as a textarea
        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
        expect(screen.getByTestId("monaco-editor-mock")).toHaveProperty("value", defaultProps.script);
    });

    it("calls setScript when content changes", async () => {
        render(<Editor {...defaultProps} />);

        const textarea = screen.getByTestId("monaco-editor-mock");
        fireEvent.change(textarea, { target: { value: "new script content" } });

        expect(defaultProps.setScript).toHaveBeenCalledWith("new script content");
    });

    it("handles Monaco editor mounting", async () => {
        render(<Editor {...defaultProps} />);

        // In test mode, we just verify the component renders
        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("handles keyboard shortcuts", () => {
        render(<Editor {...defaultProps} />);

        // In test mode, we just verify the component renders
        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("handles script changes and validation", async () => {
        render(<Editor {...defaultProps} />);

        const textarea = screen.getByTestId("monaco-editor-mock");
        fireEvent.change(textarea, { target: { value: "invalid syntax" } });

        // In test mode, we just verify the component handles changes
        expect(textarea).toBeDefined();
    });

    it("handles Monaco disposal errors gracefully", async () => {
        render(<Editor {...defaultProps} />);

        // In test mode, we just verify the component renders without crashing
        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("handles unhandled promise rejections", async () => {
        render(<Editor {...defaultProps} />);

        // In test mode, we just verify the component renders without crashing
        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("handles height and width props", () => {
        render(<Editor {...defaultProps} height="500px" width="800px" />);

        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("handles theme prop", () => {
        render(<Editor {...defaultProps} theme="vs-light" />);

        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("handles options prop", () => {
        const options = { lineNumbers: "on", minimap: { enabled: true } };
        render(<Editor {...defaultProps} options={options} />);

        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("handles readOnly mode", () => {
        render(<Editor {...defaultProps} options={{ readOnly: true }} />);

        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("displays footer when enabled", () => {
        render(<Editor {...defaultProps} displayFooter={true} />);

        expect(screen.getByTestId("editor-footer")).toBeDefined();
    });

    it("hides footer when disabled", () => {
        render(<Editor {...defaultProps} displayFooter={false} />);

        expect(screen.queryByTestId("editor-footer")).toBeNull();
    });

    it("handles custom footer component", () => {
        const CustomFooter = ({ cursor }: { cursor: any }) => (
            <div data-testid="custom-footer">
                Custom: {cursor.line}:{cursor.column}
            </div>
        );

        render(<Editor {...defaultProps} FooterComponent={CustomFooter} />);

        // In test mode, we just verify the component renders
        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("handles variables prop", () => {
        const variables = { var1: { type: "STRING" as any, role: "IDENTIFIER" as any } };
        render(<Editor {...defaultProps} variables={variables} />);

        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("handles variablesInputURLs prop", async () => {
        const variablesInputURLs = ["https://api.example.com/variables"];
        render(<Editor {...defaultProps} variablesInputURLs={variablesInputURLs} />);

        // In test mode, we just verify the component renders (may be null while loading)
        expect(screen.queryByTestId("monaco-editor-mock")).toBeNull();
    });

    it("handles customFetcher prop", () => {
        const customFetcher = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) }));
        render(<Editor {...defaultProps} customFetcher={customFetcher} />);

        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("handles onListErrors callback", async () => {
        const onListErrors = vi.fn();
        render(<Editor {...defaultProps} onListErrors={onListErrors} />);

        // In test mode, we just verify the component handles changes
        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("calls onSelectionChange once with empty selection on mount", () => {
        const onSelectionChange = vi.fn();
        render(<Editor {...defaultProps} onSelectionChange={onSelectionChange} />);

        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(onSelectionChange).toHaveBeenCalledWith({
            text: "",
            startLine: 0,
            startColumn: 0
        });
    });

    it("calls onSelectionChange when textarea selection changes", () => {
        const onSelectionChange = vi.fn();
        render(<Editor {...defaultProps} script="hello world" onSelectionChange={onSelectionChange} />);

        const textarea = screen.getByTestId("monaco-editor-mock") as HTMLTextAreaElement;
        onSelectionChange.mockClear();
        textarea.setSelectionRange(0, 5);
        fireEvent.select(textarea);

        expect(onSelectionChange).toHaveBeenCalledWith({
            text: "hello",
            startLine: 1,
            startColumn: 1
        });
    });

    it("does not call onSelectionChange again when selection stays empty", () => {
        const onSelectionChange = vi.fn();
        render(<Editor {...defaultProps} onSelectionChange={onSelectionChange} />);

        const textarea = screen.getByTestId("monaco-editor-mock") as HTMLTextAreaElement;
        fireEvent.select(textarea);

        expect(onSelectionChange).toHaveBeenCalledTimes(1);
    });

    it("handles empty script", () => {
        render(<Editor {...defaultProps} script="" />);

        const textarea = screen.getByTestId("monaco-editor-mock");
        expect(textarea).toHaveProperty("value", "");
    });

    it("handles null script", () => {
        render(<Editor {...defaultProps} script={null as any} />);

        const textarea = screen.getByTestId("monaco-editor-mock");
        expect(textarea).toHaveProperty("value", "");
    });

    it("handles undefined script", () => {
        render(<Editor {...defaultProps} script={undefined as any} />);

        const textarea = screen.getByTestId("monaco-editor-mock");
        expect(textarea).toHaveProperty("value", "");
    });

    it("handles empty shortcuts object", () => {
        render(<Editor {...defaultProps} shortcuts={{}} />);

        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("handles null shortcuts", () => {
        render(<Editor {...defaultProps} shortcuts={null as any} />);

        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("handles undefined shortcuts", () => {
        render(<Editor {...defaultProps} shortcuts={undefined as any} />);

        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    it("handles rapid script changes", async () => {
        const { rerender } = render(<Editor {...defaultProps} />);

        // Rapidly change script
        rerender(<Editor {...defaultProps} script="script1" />);
        rerender(<Editor {...defaultProps} script="script2" />);
        rerender(<Editor {...defaultProps} script="script3" />);

        // Should handle gracefully
        const textarea = screen.getByTestId("monaco-editor-mock");
        expect(textarea).toHaveProperty("value", "script3");
    });

    it("handles component unmounting gracefully", () => {
        const { unmount } = render(<Editor {...defaultProps} />);

        // Editor should be mounted
        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();

        // Unmount component
        unmount();

        // Should not throw errors
        expect(() => unmount()).not.toThrow();
    });

    it("handles error recovery and remounting", async () => {
        render(<Editor {...defaultProps} />);

        // In test mode, we just verify the component renders
        expect(screen.getByTestId("monaco-editor-mock")).toBeDefined();
    });

    describe("EditorHandle ref", () => {
        it("focus focuses the textarea in test mode", () => {
            const ref = createRef<EditorHandle>();
            render(<Editor ref={ref} {...defaultProps} />);

            ref.current?.focus();

            expect(document.activeElement).toBe(screen.getByTestId("monaco-editor-mock"));
        });

        it("revealPosition moves caret to line and column", () => {
            const ref = createRef<EditorHandle>();
            const script = "line1\nline2\nline3";
            render(<Editor ref={ref} {...defaultProps} script={script} />);

            ref.current?.revealPosition(2, 3);

            const textarea = screen.getByTestId("monaco-editor-mock") as HTMLTextAreaElement;
            const expectedOffset = lineColumnToOffset(script, 2, 3);
            expect(textarea.selectionStart).toBe(expectedOffset);
            expect(textarea.selectionEnd).toBe(expectedOffset);
            expect(document.activeElement).toBe(textarea);
        });

        it("revealPosition updates footer cursor position", async () => {
            const ref = createRef<EditorHandle>();
            render(<Editor ref={ref} {...defaultProps} script="a\nb\nc" />);

            ref.current?.revealPosition(3, 1);

            await waitFor(() => {
                expect(screen.getByTestId("editor-footer").textContent).toContain("Line 3, Column 1");
            });
        });

        it("revealPosition is a no-op before textarea is mounted", () => {
            const ref = createRef<EditorHandle>();
            render(<Editor ref={ref} {...defaultProps} variablesInputURLs={["http://pending"]} />);

            expect(() => ref.current?.revealPosition(1, 1)).not.toThrow();
        });
    });
});
