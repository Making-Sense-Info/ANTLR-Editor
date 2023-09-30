export type EditorProps = {
    label: string;
    color: string;
};

const Editor = ({ label, color = "white" }: EditorProps) => <div style={{ color }}>{label}</div>;

export default Editor;
