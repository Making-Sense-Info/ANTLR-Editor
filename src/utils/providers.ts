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

let completionItemDispose: IDisposable | undefined = undefined;

export const getEditorWillMount =
    (tools: Tools) =>
    ({ variables, editor }: { variables: Variable[]; editor: Monaco.editor.IStandaloneCodeEditor }) => {
        const { id } = tools;
        return (monaco: typeof EditorApi) => {
            monaco.languages.register({ id });
            if (tools.monarchDefinition) {
                const tokensProvider: TokensProvider = new TokensProvider(tools);
                monaco.languages.setMonarchTokensProvider(id, tokensProvider.monarchLanguage());
            }
            monaco.editor.defineTheme(id, getTheme());
            monaco.editor.defineTheme("vtl-default", getVtlTheme("vtl-default"));
            monaco.editor.defineTheme("vtl-light", getVtlTheme("vtl-light"));
            monaco.editor.defineTheme("vtl-dark", getVtlTheme("vtl-dark"));
            monaco.editor.defineTheme("vtl-black", getVtlTheme("vtl-black"));
            monaco.languages.setLanguageConfiguration(id, getBracketsConfiguration());
            if (completionItemDispose) {
                completionItemDispose.dispose();
            }
            completionItemDispose = monaco.languages.registerCompletionItemProvider(id, {
                provideCompletionItems: getSuggestions(tools, {
                    variables
                })
            });

            //@ts-ignore
            const { widget } = editor.getContribution("editor.contrib.suggestController");
            if (widget) {
                const suggestWidget = widget.value;
                suggestWidget._setDetailsVisible(true);
            }
        };
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
