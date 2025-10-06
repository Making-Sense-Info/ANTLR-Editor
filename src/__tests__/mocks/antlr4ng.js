// Mock ANTLR4NG for testing
export const ANTLRErrorListener = class MockErrorListener {
    syntaxError() {}
};

export const CharStream = class MockCharStream {
    constructor() {}
};

export const CommonTokenStream = class MockCommonTokenStream {
    constructor() {}
};

export default {
    ANTLRErrorListener,
    CharStream,
    CommonTokenStream
};
