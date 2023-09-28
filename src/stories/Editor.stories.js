import { Editor } from "./Editor";

export default {
    title: "Editor",
    component: Editor,
    tags: ["autodocs"],
    argTypes: {
        backgroundColor: { control: "color" }
    }
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary = {
    args: {
        label: "I'm the ANTLR Editor :o"
    }
};
