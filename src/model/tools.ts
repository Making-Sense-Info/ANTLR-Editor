import { Lexer } from "antlr4ng";
import { Parser } from "antlr4ng";
import { IRange, languages as Languages } from "monaco-editor";

export interface Tools {
    id: string;
    initialRule: string;
    grammar: string;
    Lexer: typeof Lexer;
    Parser: typeof Parser;
    getSuggestionsFromRange?: (range: IRange) => Languages.CompletionItem[];
    monarchDefinition?: object;
}
