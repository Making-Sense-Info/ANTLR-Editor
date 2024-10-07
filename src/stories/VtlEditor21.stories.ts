import VtlEditor from "./VtlEditor21";

export default {
    title: "VtlEditor-2.1",
    component: VtlEditor,
    tags: ["autodocs"]
};

export const Default = {
    args: { initialRule: "start" },
    argTypes: {
        initialRule: { control: "select", options: ["start", "expr"] }
    }
};

export const NewFeatures = {
    args: {
        initialRule: "start",
        "script": `ds_out := ds_in [calc r := random("init", 20)]
                [calc c := case when r < 0.2 then "Low" when r > 0.8 then "High" else "Medium"];
a := datediff(cast("2022Q1", time_period), cast("2023Q2", time_period));
b := dateadd(cast("2022Q1", time_period), 5, "M");
c := year(cast("2022Q1", time_period));
d := month(cast("2020-12-14", date));
e := dayofmonth(cast("2020-12-14", date));
f := dayofyear(cast("2020-12-14", date));
g := daytoyear(422);
h := daytomonth(146);
i := yeartoday(cast("P1Y20D", duration));
j := monthtoday(cast("P3M10D", duration));`
    },
    argTypes: {
        initialRule: { control: "select", options: ["start", "expr"] }
    }
};

export const WithInvalidScript = {
    args: { initialRule: "start", "script": "ds := " },
    argTypes: {
        initialRule: { control: "select", options: ["start", "expr"] }
    }
};

export const Styled = {
    args: {
        initialRule: "start",
        theme: "vs-dark",
        height: "50vh",
        width: "80%",
        options: { lineNumbers: true, minimap: { enabled: true }, readOnly: false }
    },
    argTypes: {
        initialRule: { control: "select", options: ["start", "expr"] },
        theme: { control: "select", options: ["vs-dark", "vs-light"] },
        options: { control: "object" }
    }
};

enum VariableType {
    STRING = "STRING",
    INTEGER = "INTEGER",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN"
}

enum VariableRole {
    IDENTIFIER = "IDENTIFIER",
    MEASURE = "MEASURE",
    DIMENSION = "DIMENSION"
}

const variables = {
    name: { type: VariableType.STRING, role: VariableRole.IDENTIFIER },
    age: { type: VariableType.INTEGER, role: VariableRole.MEASURE }
};

export const Enriched = {
    args: {
        initialRule: "start",
        variables,
        variablesInputURLs: [
            "https://raw.githubusercontent.com/Making-Sense-Info/ANTLR-Editor/gh-pages/samples/variablesInputFile1.json",
            "https://raw.githubusercontent.com/Making-Sense-Info/ANTLR-Editor/gh-pages/samples/variablesInputFile2.json"
        ]
    },
    argTypes: {
        initialRule: { control: "select", options: ["start", "expr"] },
        variables: { control: "object" },
        variablesInputURLs: { control: "object" }
    }
};
