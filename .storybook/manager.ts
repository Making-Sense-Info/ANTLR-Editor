const DEFAULT_STORY_PATH = "/docs/editorhandle--docs";

if (
    typeof window !== "undefined" &&
    window.location.pathname === "/" &&
    !window.location.search.includes("path=")
) {
    window.history.replaceState({}, "", `/?path=${DEFAULT_STORY_PATH}`);
}
