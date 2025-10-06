import * as EditorApi from "monaco-editor";
import { editor, IDisposable, Position } from "monaco-editor";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { languages } from "monaco-editor/esm/vs/editor/editor.api";
import { GrammarGraph } from "../grammar-graph/grammarGraph";
import { createLexer, createParser } from "./ParserFacade";
import { TokensProvider } from "./tokensProvider";
import { VocabularyPack } from "./vocabularyPack";
import { VARIABLE } from "./constants";
import { Tools, Variable } from "../model";

export const getTheme = (): EditorApi.editor.IStandaloneThemeData => {
    return {
        base: "vs",
        inherit: true,
        rules: [
            { token: "string", foreground: "018B03" },
            { token: "comment", foreground: "939393" },
            { token: "operator", foreground: "8B3301" },
            { token: "delimiter.bracket", foreground: "8B3301" },
            { token: "operator.special", foreground: "8B3301", fontStyle: "bold" }
        ],
        colors: {}
    };
};

export const getBracketsConfiguration = (): languages.LanguageConfiguration => {
    return {
        surroundingPairs: [
            { open: "{", close: "}" },
            { open: "(", close: ")" },
            { open: "[", close: "]" }
        ],
        autoClosingPairs: [
            { open: "{", close: "}" },
            { open: "(", close: ")" },
            { open: "[", close: "]" }
        ],
        brackets: [
            ["{", "}"],
            ["(", ")"],
            ["[", "]"]
        ]
    };
};

// Improved provider management with proper cleanup
class ProviderManager {
    private completionItemDispose: IDisposable | undefined = undefined;
    private registeredLanguages = new Set<string>();
    private registeredThemes = new Set<string>();

    dispose() {
        if (this.completionItemDispose) {
            try {
                this.completionItemDispose.dispose();
            } catch (error) {
                console.warn("Error disposing completion item provider:", error);
            }
            this.completionItemDispose = undefined;
        }
    }

    getEditorWillMount = (tools: Tools) => {
        const { id } = tools;
        return ({
            variables,
            editor
        }: {
            variables: Variable[];
            editor: Monaco.editor.IStandaloneCodeEditor;
        }) => {
            return (monaco: typeof EditorApi) => {
                try {
                    // Register language only if not already registered
                    if (!this.registeredLanguages.has(id)) {
                        monaco.languages.register({ id });
                        this.registeredLanguages.add(id);
                    }

                    if (tools.monarchDefinition) {
                        const tokensProvider: TokensProvider = new TokensProvider(tools);
                        monaco.languages.setMonarchTokensProvider(id, tokensProvider.monarchLanguage());
                    }

                    // Register themes only if not already registered
                    const themes = [id, "vtl-default", "vtl-light", "vtl-dark", "vtl-black"];
                    themes.forEach(themeName => {
                        if (!this.registeredThemes.has(themeName)) {
                            if (themeName === id) {
                                monaco.editor.defineTheme(themeName, getTheme());
                            } else {
                                monaco.editor.defineTheme(themeName, getVtlTheme(themeName));
                            }
                            this.registeredThemes.add(themeName);
                        }
                    });

                    monaco.languages.setLanguageConfiguration(id, getBracketsConfiguration());

                    // Dispose previous completion provider
                    if (this.completionItemDispose) {
                        try {
                            this.completionItemDispose.dispose();
                        } catch (error) {
                            console.warn("Error disposing previous completion provider:", error);
                        }
                    }

                    // Register new completion provider
                    this.completionItemDispose = monaco.languages.registerCompletionItemProvider(id, {
                        provideCompletionItems: getSuggestions(tools, { variables })
                    });

                    // Configure suggest widget
                    try {
                        //@ts-ignore
                        const { widget } = editor.getContribution("editor.contrib.suggestController");
                        if (widget) {
                            const suggestWidget = widget.value;
                            suggestWidget._setDetailsVisible(true);
                        }
                    } catch (error) {
                        console.warn("Error configuring suggest widget:", error);
                    }
                } catch (error) {
                    console.error("Error in getEditorWillMount:", error);
                }
            };
        };
    };
}

// Global provider manager instance
const providerManager = new ProviderManager();

export const getEditorWillMount = providerManager.getEditorWillMount;

// Cleanup function to be called when needed
export const cleanupProviders = () => {
    providerManager.dispose();
};

const buildGrammarGraph = (tools: Tools) => {
    const { Lexer, Parser, grammar } = tools;
    const lexer = createLexer(Lexer)("");
    const parser = createParser({ Lexer, Parser })("");
    const vocabulary: VocabularyPack<typeof lexer, typeof parser> = new VocabularyPack(lexer, parser);
    const grammarGraph: GrammarGraph<typeof lexer, typeof parser> = new GrammarGraph(
        vocabulary,
        grammar
    );
    return grammarGraph;
};

export const getVtlTheme = (name: string): EditorApi.editor.IStandaloneThemeData => {
    switch (name) {
        case "vtl-default": {
            return {
                base: "vs",
                inherit: true,
                rules: [
                    { token: "string", foreground: "018B03" },
                    { token: "comment", foreground: "939393" },
                    { token: "operator", foreground: "8B3301" },
                    { token: "attribute", foreground: "9ffb88" },
                    { token: "dimension", foreground: "f7b74e" },
                    { token: "primaryMeasure", foreground: "953d55" },
                    { token: "delimiter.bracket", foreground: "8B3301" },
                    {
                        token: "operator.special",
                        foreground: "8B3301",
                        fontStyle: "bold"
                    }
                ],
                colors: {}
            };
        }
        case "vtl-light": {
            return {
                base: "vs",
                inherit: true,
                rules: [
                    { token: "attribute", foreground: "9ffb88" },
                    { token: "dimension", foreground: "f7b74e" },
                    { token: "primaryMeasure", foreground: "953d55" }
                ],
                colors: {}
            };
        }
        case "vtl-dark": {
            return {
                base: "vs-dark",
                inherit: true,
                rules: [
                    { token: "attribute", foreground: "9ffb88" },
                    { token: "dimension", foreground: "f7b74e" },
                    { token: "primaryMeasure", foreground: "953d55" }
                ],
                colors: {}
            };
        }
        case "vtl-black": {
            return {
                base: "hc-black",
                inherit: true,
                rules: [
                    { token: "attribute", foreground: "9ffb88" },
                    { token: "dimension", foreground: "f7b74e" },
                    { token: "primaryMeasure", foreground: "953d55" }
                ],
                colors: {}
            };
        }
    }
    return { base: "vs", colors: {}, inherit: true, rules: [] };
};

const getSuggestions = (tools: Tools, { variables }: { variables?: Variable[] }): any => {
    return function (model: editor.ITextModel, position: Position) {
        const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        });
        const word = model.getWordUntilPosition(position);
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
        };

        let uniquetext = Array.from(
            new Set(
                textUntilPosition
                    .replace(/"(.*?)"/g, "")
                    .replace(/[^a-zA-Z_]/g, " ")
                    .split(" ")
                    .filter(w => w !== "")
            ).values()
        );
        buildGrammarGraph(tools);
        const { getSuggestionsFromRange = () => [] } = tools;
        const grammarSuggestions = getSuggestionsFromRange(range);
        const suggestionList: languages.CompletionItem[] =
            grammarSuggestions.length !== 0
                ? grammarSuggestions
                : buildGrammarGraph(tools).suggestions();
        uniquetext = removeLanguageSyntaxFromList(uniquetext, suggestionList);

        const array = uniquetext.map(w => {
            return {
                label: w,
                kind: EditorApi.languages.CompletionItemKind.Variable,
                insertText: w
            } as languages.CompletionItem;
        });
        const vars = (variables || []).map(({ label, name }) => ({
            label,
            kind: VARIABLE,
            insertText: name,
            range
        }));
        return {
            suggestions: [...array, ...vars, ...suggestionList]
        };
    };

    function removeLanguageSyntaxFromList(vars: string[], suggestionList: any[]) {
        const suggestionsLabels = suggestionList.map(s => s.label.toLowerCase());
        return vars.filter(t => !suggestionsLabels.includes(t.toLowerCase()));
    }
};
