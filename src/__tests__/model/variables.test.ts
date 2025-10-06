import { describe, it, expect } from "vitest";
import { Variables } from "../../model/variables";

describe("Variables Model", () => {
    it("should handle empty variables", () => {
        const variables: Variables = {};
        expect(typeof variables).toBe("object");
        expect(Object.keys(variables)).toHaveLength(0);
    });

    it("should handle string variables", () => {
        const variables: Variables = {
            name: { type: "STRING", role: "IDENTIFIER" },
            description: { type: "STRING", role: "IDENTIFIER" }
        };

        expect(variables.name.type).toBe("STRING");
        expect(variables.name.role).toBe("IDENTIFIER");
        expect(variables.description.type).toBe("STRING");
    });

    it("should handle numeric variables", () => {
        const variables: Variables = {
            count: { type: "INTEGER", role: "MEASURE" },
            price: { type: "DECIMAL", role: "MEASURE" }
        };

        expect(variables.count.type).toBe("INTEGER");
        expect(variables.price.type).toBe("DECIMAL");
    });

    it("should handle mixed variable types", () => {
        const variables: Variables = {
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
