import { Lexer } from "antlr4ts/Lexer";
import { Parser } from "antlr4ts/Parser";
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
