export type EditorProps = {
    label: string;
    color: string;
};

const Editor = ({ label, color }: EditorProps) => <div style={{ color }}>{label}</div>;

export default Editor;
