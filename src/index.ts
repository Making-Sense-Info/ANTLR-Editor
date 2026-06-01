// Opt-in patch: host apps decide if they need global listeners.

export { default as AntlrEditor, CursorType } from "./Editor";
export type { EditorSelection } from "./utils/selection";
export { cleanupProviders } from "./utils/providers";
export { applyMonacoPatch } from "./monaco-patch";
