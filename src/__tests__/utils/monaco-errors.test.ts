import { describe, expect, it } from "vitest";

import { extractErrorMessage, shouldSuppressMonacoError } from "../../utils/monaco-errors";

describe("monaco-errors utils", () => {
    it("extracts a message from common inputs", () => {
        expect(extractErrorMessage("plain message")).toBe("plain message");
        expect(extractErrorMessage(new Error("boom"))).toBe("boom");
        expect(extractErrorMessage({ message: "from-object" })).toBe("from-object");
    });

    it("detects suppressible Monaco lifecycle errors", () => {
        expect(shouldSuppressMonacoError(new Error("InstantiationService has been disposed"))).toBe(
            true
        );
        expect(shouldSuppressMonacoError("Cannot access domNode while rendering")).toBe(true);
        expect(shouldSuppressMonacoError("AnimationFrameQueueItem failed")).toBe(true);
    });

    it("does not suppress unrelated errors", () => {
        expect(shouldSuppressMonacoError(new Error("Network request failed"))).toBe(false);
    });
});
