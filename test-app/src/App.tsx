import { AntlrEditor } from "@making-sense/antlr-editor";
import * as tools from "@making-sense/vtl-2-0-antlr-tools-ts";
import { getSuggestionsFromRange, monarchDefinition } from "./vtl-monaco";

const customTools = { ...tools, getSuggestionsFromRange, monarchDefinition };

const App = (props: any) => <AntlrEditor {...props} tools={customTools} />;

export default App;
