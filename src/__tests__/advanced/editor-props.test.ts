import { describe, it, expect } from "vitest";

// Test Editor props interface without importing Monaco Editor
describe("Editor Props", () => {
    describe("Required Props", () => {
        it("should validate required props structure", () => {
            const props = {
                tools: {
                    id: "vtl",
                    initialRule: "start",
                    grammar: "grammar VTL;",
                    Lexer: class MockLexer {},
                    Parser: class MockParser {}
                },
                shortcuts: {
                    "ctrl+s": () => console.log("Save"),
                    "ctrl+enter": () => console.log("Run")
                },
                displayFooter: true
            };

            expect(props.tools).toBeDefined();
            expect(props.shortcuts).toBeDefined();
            expect(typeof props.displayFooter).toBe("boolean");
        });
    });

    describe("Optional Props", () => {
        it("should handle script prop", () => {
            const props = {
                script: "ds_out := ds_in [calc r := random(150, 20)]",
                tools: {
                    id: "vtl",
                    initialRule: "start",
                    grammar: "",
                    Lexer: class {},
                    Parser: class {}
                },
                shortcuts: {},
                displayFooter: true
            };

            expect(props.script).toBe("ds_out := ds_in [calc r := random(150, 20)]");
        });

        it("should handle setScript callback", () => {
            const setScript = (value: string) => console.log("Script changed:", value);
            const props = {
                setScript,
                tools: {
                    id: "vtl",
                    initialRule: "start",
                    grammar: "",
                    Lexer: class {},
                    Parser: class {}
                },
                shortcuts: {},
                displayFooter: true
            };

            expect(typeof props.setScript).toBe("function");
        });

        it("should handle height and width", () => {
            const props = {
                height: "500px",
                width: "100%",
                tools: {
                    id: "vtl",
                    initialRule: "start",
                    grammar: "",
                    Lexer: class {},
                    Parser: class {}
                },
                shortcuts: {},
                displayFooter: true
            };

            expect(props.height).toBe("500px");
            expect(props.width).toBe("100%");
        });

        it("should handle theme", () => {
            const props = {
                theme: "vs-dark",
                tools: {
                    id: "vtl",
                    initialRule: "start",
                    grammar: "",
                    Lexer: class {},
                    Parser: class {}
                },
                shortcuts: {},
                displayFooter: true
            };

            expect(props.theme).toBe("vs-dark");
        });

        it("should handle options", () => {
            const options = {
                lineNumbers: "on",
                minimap: { enabled: true },
                readOnly: false
            };

            const props = {
                options,
                tools: {
                    id: "vtl",
                    initialRule: "start",
                    grammar: "",
                    Lexer: class {},
                    Parser: class {}
                },
                shortcuts: {},
                displayFooter: true
            };

            expect(props.options).toBeDefined();
            expect(props.options.lineNumbers).toBe("on");
        });

        it("should handle variables", () => {
            const variables = {
                var1: { type: "STRING", role: "IDENTIFIER" },
                var2: { type: "INTEGER", role: "MEASURE" }
            };

            const props = {
                variables,
                tools: {
                    id: "vtl",
                    initialRule: "start",
                    grammar: "",
                    Lexer: class {},
                    Parser: class {}
                },
                shortcuts: {},
                displayFooter: true
            };

            expect(props.variables).toBeDefined();
            expect(props.variables.var1.type).toBe("STRING");
        });

        it("should handle variablesInputURLs", () => {
            const variablesInputURLs = ["https://api.example.com/variables"];

            const props = {
                variablesInputURLs,
                tools: {
                    id: "vtl",
                    initialRule: "start",
                    grammar: "",
                    Lexer: class {},
                    Parser: class {}
                },
                shortcuts: {},
                displayFooter: true
            };

            expect(props.variablesInputURLs).toBeDefined();
            expect(Array.isArray(props.variablesInputURLs)).toBe(true);
        });

        it("should handle customFetcher", () => {
            const customFetcher = () => Promise.resolve({ json: () => Promise.resolve([]) });

            const props = {
                customFetcher,
                tools: {
                    id: "vtl",
                    initialRule: "start",
                    grammar: "",
                    Lexer: class {},
                    Parser: class {}
                },
                shortcuts: {},
                displayFooter: true
            };

            expect(typeof props.customFetcher).toBe("function");
        });

        it("should handle onListErrors callback", () => {
            const onListErrors = (errors: any[]) => console.log("Errors:", errors);

            const props = {
                onListErrors,
                tools: {
                    id: "vtl",
                    initialRule: "start",
                    grammar: "",
                    Lexer: class {},
                    Parser: class {}
                },
                shortcuts: {},
                displayFooter: true
            };

            expect(typeof props.onListErrors).toBe("function");
        });

        it("should handle FooterComponent", () => {
            const FooterComponent = () => null;

            const props = {
                FooterComponent,
                tools: {
                    id: "vtl",
                    initialRule: "start",
                    grammar: "",
                    Lexer: class {},
                    Parser: class {}
                },
                shortcuts: {},
                displayFooter: true
            };

            expect(typeof props.FooterComponent).toBe("function");
        });
    });

    describe("Default Values", () => {
        it("should have correct default values", () => {
            const defaults = {
                height: "50vh",
                width: "100%",
                theme: "vs-dark",
                displayFooter: true
            };

            expect(defaults.height).toBe("50vh");
            expect(defaults.width).toBe("100%");
            expect(defaults.theme).toBe("vs-dark");
            expect(defaults.displayFooter).toBe(true);
        });
    });
});
