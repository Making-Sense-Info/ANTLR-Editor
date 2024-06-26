import { ANTLRErrorListener, CharStream, CommonTokenStream } from "@making-sense/antlr4ng";
import { Log } from "./log";

// @ts-ignore VALID
class ConsoleErrorListener implements ANTLRErrorListener {
    // @ts-ignore TS7006 VALID
    syntaxError(recognizer, offendingSymbol, line, column, msg) {
        Log.info("ERROR " + msg, "ParserFacadeV3");
    }
}

class Error {
    startLine: number;
    endLine: number;
    startCol: number;
    endCol: number;
    message: string;

    constructor(startLine: number, endLine: number, startCol: number, endCol: number, message: string) {
        this.startLine = startLine;
        this.endLine = endLine;
        this.startCol = startCol;
        this.endCol = endCol;
        this.message = message;
    }
}

// @ts-ignore VALID
class CollectorErrorListener implements ANTLRErrorListener {
    private errors: Error[] = [];

    constructor(errors: Error[]) {
        this.errors = errors;
    }

    // @ts-ignore TS7006
    syntaxError(recognizer, offendingSymbol, line, column, msg) {
        let endColumn = column + 1;
        if (offendingSymbol._text !== null && offendingSymbol._text !== undefined) {
            endColumn = column + offendingSymbol._text.length;
        }
        this.errors.push(new Error(line, line, column, endColumn, msg));
    }
}

export const createLexer = (Lexer: any) => (input: string | undefined) => {
    const chars = CharStream.fromString(input || "");
    const lexer = new Lexer(chars);
    return lexer;
};

export const createParser =
    ({ Lexer, Parser }: any) =>
    (input: string) => {
        const lexer = createLexer(Lexer)(input);
        return createParserFromLexer(Parser)(lexer);
    };

const createParserFromLexer = (Parser: any) => (lexer: any) => {
    const tokens = new CommonTokenStream(lexer);
    return new Parser(tokens);
};

export const validate =
    ({ Lexer, Parser, initialRule }: any) =>
    (input: string | undefined): Error[] => {
        const errors: Error[] = [];

        const lexer = createLexer(Lexer)(input);
        lexer.removeErrorListeners();
        lexer.addErrorListener(new ConsoleErrorListener());

        const parser = createParserFromLexer(Parser)(lexer);
        parser.removeErrorListeners();
        parser.addErrorListener(new CollectorErrorListener(errors));
        parser[initialRule]();
        return errors;
    };
