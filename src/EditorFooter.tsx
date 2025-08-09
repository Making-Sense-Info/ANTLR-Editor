import { type CursorType } from "./Editor";

type EditorFooterProps = {
    cursor: CursorType;
    FooterComponent?: React.FC<{ cursor: CursorType }>;
};

const EditorFooter = ({ cursor, FooterComponent }: EditorFooterProps) => {
    if (FooterComponent) {
        return <FooterComponent cursor={cursor} />;
    }
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "12px",
                fontFamily: "monospace",
                width: "100%"
            }}
        >
            <span>
                Line {cursor.line} - Column {cursor.column}
                {cursor.selectionLength > 0 && <span> ({cursor.selectionLength} selected)</span>}
            </span>
        </div>
    );
};

export default EditorFooter;
