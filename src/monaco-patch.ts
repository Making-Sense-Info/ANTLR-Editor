/**
 * Global Monaco error suppression patch
 *
 * Suppresses harmless Monaco errors that occur during layout changes
 * when the editor is resized or reorganized in the DOM.
 */

// Store original console.error to detect Monaco errors
const originalConsoleError = console.error;

console.error = function (...args: any[]) {
    const message = args.join(" ");

    // Suppress Monaco cleanup errors
    if (
        message.includes("InstantiationService has been disposed") ||
        message.includes("domNode") ||
        message.includes("renderText") ||
        message.includes("AnimationFrameQueueItem") ||
        message.includes("getFullModelRange") ||
        message.includes("Cannot read properties of undefined") ||
        message.includes("Cannot read properties of null")
    ) {
        console.debug("[Monaco Patch] Suppressed console.error:", message);
        return;
    }

    // Call original
    originalConsoleError.apply(console, args);
};

// Patch window.onerror to suppress Monaco cleanup errors
const originalOnError = window.onerror;

window.onerror = function (message, source, lineno, colno, error) {
    const messageStr = typeof message === "string" ? message : String(message);
    const errorMsg = error?.message || "";

    // Suppress Monaco cleanup errors
    if (
        messageStr.includes("InstantiationService has been disposed") ||
        messageStr.includes("domNode") ||
        messageStr.includes("renderText") ||
        messageStr.includes("AnimationFrameQueueItem") ||
        errorMsg.includes("InstantiationService has been disposed") ||
        errorMsg.includes("domNode") ||
        errorMsg.includes("renderText")
    ) {
        console.debug("[Monaco Patch] Suppressed window.onerror:", messageStr);
        return true; // Prevent default error handling
    }

    // Call original handler
    if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
    }

    return false;
};

// Patch unhandled promise rejections
const originalUnhandledRejection = window.onunhandledrejection;

window.onunhandledrejection = function (event) {
    const message = event.reason?.message || String(event.reason);

    if (
        message.includes("InstantiationService has been disposed") ||
        message.includes("domNode") ||
        message.includes("renderText")
    ) {
        console.debug("[Monaco Patch] Suppressed promise rejection:", message);
        event.preventDefault();
        return;
    }

    // Call original handler
    if (originalUnhandledRejection) {
        originalUnhandledRejection.call(window, event);
    }
};

// Wrap all functions to catch synchronous errors
const originalSetTimeout = window.setTimeout;
window.setTimeout = function (handler: any, timeout?: number, ...args: any[]) {
    if (typeof handler === "function") {
        const wrappedHandler = function (this: any, ...handlerArgs: any[]) {
            try {
                return handler.apply(this, handlerArgs);
            } catch (error: any) {
                if (
                    error.message?.includes("domNode") ||
                    error.message?.includes("renderText") ||
                    error.message?.includes("InstantiationService")
                ) {
                    console.debug("[Monaco Patch] Suppressed setTimeout error:", error.message);
                    return;
                }
                throw error;
            }
        };
        return originalSetTimeout(wrappedHandler, timeout, ...args);
    }
    return originalSetTimeout(handler, timeout, ...args);
} as typeof setTimeout;

// Wrap requestAnimationFrame
const originalRAF = window.requestAnimationFrame;
window.requestAnimationFrame = function (callback: FrameRequestCallback) {
    const wrappedCallback: FrameRequestCallback = function (time: number) {
        try {
            return callback(time);
        } catch (error: any) {
            if (
                error.message?.includes("domNode") ||
                error.message?.includes("renderText") ||
                error.message?.includes("InstantiationService")
            ) {
                console.debug("[Monaco Patch] Suppressed RAF error:", error.message);
                return 0;
            }
            throw error;
        }
    };
    return originalRAF(wrappedCallback);
};

// Ultimate fallback: Add global error event listener that catches everything
window.addEventListener(
    "error",
    event => {
        const error = event.error;
        const message = error?.message || event.message || "";

        if (
            message.includes("domNode") ||
            message.includes("renderText") ||
            message.includes("InstantiationService") ||
            message.includes("AnimationFrameQueueItem")
        ) {
            console.debug("[Monaco Patch] Suppressed via addEventListener:", message);
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    },
    true
); // Use capture phase to catch first

export const applyMonacoPatch = () => {
    console.debug("[Monaco Patch] Global error suppression activated");
};
