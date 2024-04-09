import path from "path-browserify";

function ensureFirstBackSlash(str: string) {
    return str.length > 0 && str.charAt(0) !== "/" ? "/" + str : str;
}

export function uriFromPath(_path: string) {
    const pathName = path.resolve(_path).replace(/\\/g, "/");
    return encodeURI("file://" + ensureFirstBackSlash(pathName));
}
