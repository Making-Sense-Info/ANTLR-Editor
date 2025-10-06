import { describe, it, expect } from "vitest";

describe("Basic Tests", () => {
    it("should work with basic JavaScript", () => {
        expect(1 + 1).toBe(2);
    });

    it("should handle arrays", () => {
        const arr = [1, 2, 3];
        expect(arr).toHaveLength(3);
        expect(arr[0]).toBe(1);
    });

    it("should handle objects", () => {
        const obj = { name: "test", value: 42 };
        expect(obj.name).toBe("test");
        expect(obj.value).toBe(42);
    });

    it("should handle functions", () => {
        const add = (a: number, b: number) => a + b;
        expect(add(2, 3)).toBe(5);
    });

    it("should handle async operations", async () => {
        const promise = Promise.resolve("test");
        const result = await promise;
        expect(result).toBe("test");
    });

    it("should handle error cases", () => {
        expect(() => {
            throw new Error("Test error");
        }).toThrow("Test error");
    });
});
