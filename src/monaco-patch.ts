import { shouldSuppressMonacoError } from "./utils/monaco-errors";

let isPatchApplied = false;

export const applyMonacoPatch = (): (() => void) => {
    if (isPatchApplied) {
        return () => undefined;
    }
    isPatchApplied = true;

    const onError = (event: ErrorEvent) => {
        if (shouldSuppressMonacoError(event.error ?? event.message)) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
        if (shouldSuppressMonacoError(event.reason)) {
            event.preventDefault();
        }
    };

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    console.debug("[Monaco Patch] Scoped global listeners activated");

    return () => {
        window.removeEventListener("error", onError, true);
        window.removeEventListener("unhandledrejection", onUnhandledRejection);
        isPatchApplied = false;
    };
};
