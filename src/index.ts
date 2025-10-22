import { applyMonacoPatch } from "./monaco-patch";

// Apply Monaco error suppression patch automatically on import
applyMonacoPatch();

export { default as AntlrEditor, CursorType } from "./Editor";
export { cleanupProviders } from "./utils/providers";
export { applyMonacoPatch } from "./monaco-patch";
