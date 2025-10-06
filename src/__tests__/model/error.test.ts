import { describe, it, expect } from "vitest";
import { Error } from "../../model/error";

describe("Error Model", () => {
    it("should have required properties", () => {
        const error: Error = {
            line: 1,
            column: 5,
            message: "Test error"
        };

        expect(error.line).toBe(1);
        expect(error.column).toBe(5);
        expect(error.message).toBe("Test error");
    });

    it("should handle different error types", () => {
        const syntaxError: Error = {
            line: 10,
            column: 15,
            message: "Syntax error"
        };

        const validationError: Error = {
            line: 5,
            column: 3,
            message: "Validation error"
        };

        expect(syntaxError.line).toBe(10);
        expect(validationError.message).toBe("Validation error");
    });
});
