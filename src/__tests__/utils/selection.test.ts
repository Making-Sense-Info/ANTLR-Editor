import { describe, it, expect, vi } from "vitest";
import {
    EMPTY_EDITOR_SELECTION,
    buildMonacoSelection,
    buildTextareaSelection,
    createSelectionChangeNotifier,
    offsetToLineColumn
} from "../../utils/selection";

describe("selection utils", () => {
    describe("offsetToLineColumn", () => {
        it("returns line 1 column 1 at offset 0", () => {
            expect(offsetToLineColumn("hello", 0)).toEqual({ line: 1, column: 1 });
        });

        it("accounts for newlines", () => {
            expect(offsetToLineColumn("aa\nbb\ncc", 5)).toEqual({ line: 2, column: 3 });
        });
    });

    describe("buildMonacoSelection", () => {
        it("returns empty when selection is empty", () => {
            const editor = {
                getSelection: () => ({
                    isEmpty: () => true,
                    startLineNumber: 2,
                    startColumn: 3,
                    endLineNumber: 2,
                    endColumn: 5
                }),
                getModel: () => ({
                    getValueInRange: () => "ab"
                })
            };

            expect(buildMonacoSelection(editor)).toEqual({
                payload: EMPTY_EDITOR_SELECTION,
                hasSelection: false
            });
        });

        it("returns text and start position when selection is non-empty", () => {
            const range = {
                isEmpty: () => false,
                startLineNumber: 2,
                startColumn: 4,
                endLineNumber: 3,
                endColumn: 1
            };
            const editor = {
                getSelection: () => range,
                getModel: () => ({
                    getValueInRange: (r: typeof range) => (r === range ? "selected" : "")
                })
            };

            expect(buildMonacoSelection(editor)).toEqual({
                payload: { text: "selected", startLine: 2, startColumn: 4 },
                hasSelection: true
            });
        });
    });

    describe("buildTextareaSelection", () => {
        it("returns empty when start equals end", () => {
            expect(buildTextareaSelection("abc", 1, 1)).toEqual({
                payload: EMPTY_EDITOR_SELECTION,
                hasSelection: false
            });
        });

        it("returns selected text and start line/column", () => {
            const value = "line1\nline2";
            expect(buildTextareaSelection(value, 6, 11)).toEqual({
                payload: { text: "line2", startLine: 2, startColumn: 1 },
                hasSelection: true
            });
        });
    });

    describe("createSelectionChangeNotifier", () => {
        it("calls once with empty selection on first notify without selection", () => {
            const onSelectionChange = vi.fn();
            const { notify } = createSelectionChangeNotifier(onSelectionChange);

            notify(EMPTY_EDITOR_SELECTION, false);
            notify(EMPTY_EDITOR_SELECTION, false);

            expect(onSelectionChange).toHaveBeenCalledTimes(1);
            expect(onSelectionChange).toHaveBeenCalledWith(EMPTY_EDITOR_SELECTION);
        });

        it("calls on each non-empty selection", () => {
            const onSelectionChange = vi.fn();
            const { notify } = createSelectionChangeNotifier(onSelectionChange);

            const first = { text: "a", startLine: 1, startColumn: 1 };
            const second = { text: "bc", startLine: 1, startColumn: 2 };

            notify(first, true);
            notify(second, true);

            expect(onSelectionChange).toHaveBeenCalledTimes(2);
            expect(onSelectionChange).toHaveBeenNthCalledWith(1, first);
            expect(onSelectionChange).toHaveBeenNthCalledWith(2, second);
        });

        it("calls empty once when clearing a previous selection", () => {
            const onSelectionChange = vi.fn();
            const { notify } = createSelectionChangeNotifier(onSelectionChange);

            notify({ text: "x", startLine: 1, startColumn: 1 }, true);
            notify(EMPTY_EDITOR_SELECTION, false);
            notify(EMPTY_EDITOR_SELECTION, false);

            expect(onSelectionChange).toHaveBeenCalledTimes(2);
            expect(onSelectionChange).toHaveBeenLastCalledWith(EMPTY_EDITOR_SELECTION);
        });

        it("does not call again when moving cursor without selection after init", () => {
            const onSelectionChange = vi.fn();
            const { notify } = createSelectionChangeNotifier(onSelectionChange);

            notify(EMPTY_EDITOR_SELECTION, false);
            notify(EMPTY_EDITOR_SELECTION, false);

            expect(onSelectionChange).toHaveBeenCalledTimes(1);
        });
    });
});
