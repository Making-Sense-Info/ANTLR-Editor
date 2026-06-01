export type EditorSelection = {
    text: string;
    startLine: number;
    startColumn: number;
};

export const EMPTY_EDITOR_SELECTION: EditorSelection = {
    text: "",
    startLine: 0,
    startColumn: 0
};

export type MonacoSelectionLike = {
    isEmpty: () => boolean;
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
};

export type MonacoEditorSelectionSource = {
    getSelection: () => MonacoSelectionLike | null;
    getModel: () => {
        getValueInRange: (range: MonacoSelectionLike) => string;
    } | null;
};

export function offsetToLineColumn(text: string, offset: number): { line: number; column: number } {
    const before = text.substring(0, offset);
    const lines = before.split("\n");
    return {
        line: lines.length,
        column: lines[lines.length - 1].length + 1
    };
}

export function buildMonacoSelection(editor: MonacoEditorSelectionSource): {
    payload: EditorSelection;
    hasSelection: boolean;
} {
    const selection = editor.getSelection();
    const model = editor.getModel();

    if (!selection || !model || selection.isEmpty()) {
        return { payload: EMPTY_EDITOR_SELECTION, hasSelection: false };
    }

    return {
        payload: {
            text: model.getValueInRange(selection),
            startLine: selection.startLineNumber,
            startColumn: selection.startColumn
        },
        hasSelection: true
    };
}

export function buildTextareaSelection(
    value: string,
    selectionStart: number,
    selectionEnd: number
): { payload: EditorSelection; hasSelection: boolean } {
    if (selectionStart === selectionEnd) {
        return { payload: EMPTY_EDITOR_SELECTION, hasSelection: false };
    }

    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);
    const { line, column } = offsetToLineColumn(value, start);

    return {
        payload: {
            text: value.substring(start, end),
            startLine: line,
            startColumn: column
        },
        hasSelection: true
    };
}

/**
 * Notifies on non-empty selection changes. Calls once with empty selection on init,
 * and again when the user clears a previous selection.
 */
export function createSelectionChangeNotifier(onSelectionChange: (selection: EditorSelection) => void) {
    let initialized = false;
    let hadSelection = false;

    const notify = (payload: EditorSelection, hasSelection: boolean) => {
        if (hasSelection) {
            onSelectionChange(payload);
            hadSelection = true;
            initialized = true;
            return;
        }

        if (!initialized) {
            onSelectionChange(EMPTY_EDITOR_SELECTION);
            initialized = true;
            return;
        }

        if (hadSelection) {
            onSelectionChange(EMPTY_EDITOR_SELECTION);
            hadSelection = false;
        }
    };

    return { notify };
}

export type SelectionChangeNotifier = ReturnType<typeof createSelectionChangeNotifier>;
