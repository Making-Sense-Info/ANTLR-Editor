import { ANTLRErrorListener, CharStream, CommonTokenStream, Token } from "@making-sense/antlr4ng";

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
    syntaxError(_recognizer, offendingSymbol, line, column, msg) {
        let endColumn = column + 1;
        const text = offendingSymbol?.text ?? offendingSymbol?._text;
        if (text !== null && text !== undefined) {
            endColumn = column + String(text).length;
        }
        this.errors.push(new Error(line, line, column, endColumn, msg));
    }

    // @ts-ignore TS7006
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reportAttemptingFullContext(_recognizer, _dfa, _startIndex, _stopIndex, _conflictingAlts, _configs) {
        // Optional method - can be empty
    }

    // @ts-ignore TS7006
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reportContextSensitivity(_recognizer, _dfa, _startIndex, _stopIndex, _prediction, _configs) {
        // Optional method - can be empty
    }

    // @ts-ignore TS7006
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reportAmbiguity(_recognizer, _dfa, _startIndex, _stopIndex, _exact, _ambigAlts, _configs) {
        // Optional method - can be empty
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

/**
 * Parse `input` with the tools' `initialRule`.
 *
 * - Empty / whitespace-only input is valid (optional expression fields).
 * - Lexer + parser errors are collected.
 * - Leftover tokens after the rule are reported (rules like `expr` do not
 *   require EOF, so without this check `a ::::: junk` would parse as just `a`).
 */
export const validate =
    ({ Lexer, Parser, initialRule }: any) =>
    (input: string | undefined): Error[] => {
        const errors: Error[] = [];

        if (input === undefined || input.trim() === "") {
            return errors;
        }

        const lexer = createLexer(Lexer)(input);
        lexer.removeErrorListeners();
        lexer.addErrorListener(new CollectorErrorListener(errors));

        const parser = createParserFromLexer(Parser)(lexer);
        parser.removeErrorListeners();
        parser.addErrorListener(new CollectorErrorListener(errors));
        parser[initialRule]();

        const stream = parser.inputStream;
        if (stream && stream.LA(1) !== Token.EOF) {
            const token = stream.LT(1);
            const text = token?.text ?? "";
            const line = token?.line ?? 1;
            const column = token?.column ?? 0;
            const endColumn = column + Math.max(String(text).length, 1);
            errors.push(
                new Error(line, line, column, endColumn, `extraneous input '${text}' expecting <EOF>`)
            );
        }

        return errors;
    };
