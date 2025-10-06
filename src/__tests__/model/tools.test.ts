import { describe, it, expect } from "vitest";
import { Tools } from "../../model/tools";

describe("Tools Model", () => {
    it("should have required properties", () => {
        const tools: Tools = {
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
        const tools: Tools = {
            id: "vtl",
            initialRule: "start",
            grammar: "grammar VTL;",
            Lexer: class MockLexer {},
            Parser: class MockParser {},
            monarchDefinition: {},
            getSuggestionsFromRange: () => []
        };

        expect(tools.monarchDefinition).toBeDefined();
        expect(typeof tools.getSuggestionsFromRange).toBe("function");
    });
});
