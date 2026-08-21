import { afterEach, describe, expect, it, vi } from "vitest";

import { applyMonacoPatch } from "../monaco-patch";

describe("applyMonacoPatch", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("registers and unregisters global listeners", () => {
        const addSpy = vi.spyOn(window, "addEventListener");
        const removeSpy = vi.spyOn(window, "removeEventListener");

        const cleanup = applyMonacoPatch();

        expect(addSpy).toHaveBeenCalledWith("error", expect.any(Function), true);
        expect(addSpy).toHaveBeenCalledWith("unhandledrejection", expect.any(Function));

        cleanup();

        expect(removeSpy).toHaveBeenCalledWith("error", expect.any(Function), true);
        expect(removeSpy).toHaveBeenCalledWith("unhandledrejection", expect.any(Function));
    });

    it("is idempotent while already applied", () => {
        const addSpy = vi.spyOn(window, "addEventListener");

        const cleanupA = applyMonacoPatch();
        const callsAfterFirst = addSpy.mock.calls.filter(args => args[0] === "error").length;

        const cleanupB = applyMonacoPatch();
        const callsAfterSecond = addSpy.mock.calls.filter(args => args[0] === "error").length;

        expect(callsAfterFirst).toBe(1);
        expect(callsAfterSecond).toBe(callsAfterFirst);

        cleanupB();
        cleanupA();
    });
});
