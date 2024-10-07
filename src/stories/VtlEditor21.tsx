import Editor from "../Editor";
import * as tools from "@making-sense/vtl-2-1-antlr-tools-ts";
import { getSuggestionsFromRange, monarchDefinition } from "@making-sense/vtl-2-1-monaco-tools-ts";

const customTools = { ...tools, getSuggestionsFromRange, monarchDefinition };

const EditorForStories = (props: any) => {
    const { initialRule = "start" } = props;
    return <Editor {...props} tools={{ ...customTools, initialRule }} />;
};

export default EditorForStories;
