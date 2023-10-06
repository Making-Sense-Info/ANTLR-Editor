import Editor from "../Editor";
import * as tools from "@making-sense/vtl-2-0-antlr-tools-ts";
import { getSuggestionsFromRange, monarchDefinition } from "./vtl-monaco";

const customTools = { ...tools, getSuggestionsFromRange, monarchDefinition };

const EditorForStories = (props: any) => <Editor {...props} tools={customTools} />;

export default EditorForStories;
