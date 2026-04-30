const SUPPRESSED_MONACO_ERROR_SNIPPETS = [
    "InstantiationService has been disposed",
    "domNode",
    "renderText",
    "AnimationFrameQueueItem",
    "getFullModelRange"
] as const;

export const extractErrorMessage = (value: unknown): string => {
    if (typeof value === "string") {
        return value;
    }
    if (value instanceof Error) {
        return value.message;
    }
    if (typeof value === "object" && value !== null && "message" in value) {
        return String((value as { message: unknown }).message ?? "");
    }
    return String(value ?? "");
};

export const shouldSuppressMonacoError = (value: unknown): boolean => {
    const message = extractErrorMessage(value);
    return SUPPRESSED_MONACO_ERROR_SNIPPETS.some(snippet => message.includes(snippet));
};
