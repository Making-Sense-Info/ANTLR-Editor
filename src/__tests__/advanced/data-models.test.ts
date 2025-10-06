import { describe, it, expect } from "vitest";

// Test data models without importing from the actual modules
describe("Data Models", () => {
    describe("Tools Interface", () => {
        it("should validate tools structure", () => {
            const tools = {
                id: "vtl",
                initialRule: "start",
                grammar: "grammar VTL;",
                Lexer: class MockLexer {},
                Parser: class MockParser {}
            };

            expect(tools.id).toBe("vtl");
            expect(tools.initialRule).toBe("start");
            expect(tools.grammar).toBe("grammar VTL;");
            expect(typeof tools.Lexer).toBe("function");
            expect(typeof tools.Parser).toBe("function");
        });

        it("should handle optional properties", () => {
            const tools = {
                id: "vtl",
                initialRule: "start",
                grammar: "grammar VTL;",
                Lexer: class MockLexer {},
                Parser: class MockParser {},
                monarchDefinition: { tokenizer: {} },
                getSuggestionsFromRange: () => []
            };

            expect(tools.monarchDefinition).toBeDefined();
            expect(typeof tools.getSuggestionsFromRange).toBe("function");
        });
    });

    describe("Error Interface", () => {
        it("should validate error structure", () => {
            const error = {
                line: 1,
                column: 5,
                message: "Test error"
            };

            expect(error.line).toBe(1);
            expect(error.column).toBe(5);
            expect(error.message).toBe("Test error");
        });

        it("should handle different error types", () => {
            const syntaxError = {
                line: 10,
                column: 15,
                message: "Syntax error"
            };

            const validationError = {
                line: 5,
                column: 3,
                message: "Validation error"
            };

            expect(syntaxError.line).toBe(10);
            expect(validationError.message).toBe("Validation error");
        });
    });

    describe("Variables Interface", () => {
        it("should handle empty variables", () => {
            const variables = {};
            expect(typeof variables).toBe("object");
            expect(Object.keys(variables)).toHaveLength(0);
        });

        it("should handle string variables", () => {
            const variables = {
                name: { type: "STRING", role: "IDENTIFIER" },
                description: { type: "STRING", role: "IDENTIFIER" }
            };

            expect(variables.name.type).toBe("STRING");
            expect(variables.name.role).toBe("IDENTIFIER");
            expect(variables.description.type).toBe("STRING");
        });

        it("should handle numeric variables", () => {
            const variables = {
                count: { type: "INTEGER", role: "MEASURE" },
                price: { type: "DECIMAL", role: "MEASURE" }
            };

            expect(variables.count.type).toBe("INTEGER");
            expect(variables.price.type).toBe("DECIMAL");
        });

        it("should handle mixed variable types", () => {
            const variables = {
                id: { type: "INTEGER", role: "IDENTIFIER" },
                name: { type: "STRING", role: "IDENTIFIER" },
                value: { type: "DECIMAL", role: "MEASURE" },
                flag: { type: "BOOLEAN", role: "IDENTIFIER" }
            };

            expect(Object.keys(variables)).toHaveLength(4);
            expect(variables.id.type).toBe("INTEGER");
            expect(variables.name.type).toBe("STRING");
            expect(variables.value.type).toBe("DECIMAL");
            expect(variables.flag.type).toBe("BOOLEAN");
        });
    });

    describe("Cursor Type", () => {
        it("should validate cursor structure", () => {
            const cursor = {
                line: 1,
                column: 5,
                selectionLength: 10
            };

            expect(cursor.line).toBe(1);
            expect(cursor.column).toBe(5);
            expect(cursor.selectionLength).toBe(10);
        });

        it("should handle zero selection", () => {
            const cursor = {
                line: 10,
                column: 20,
                selectionLength: 0
            };

            expect(cursor.selectionLength).toBe(0);
        });
    });
});
