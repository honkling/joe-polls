import { readFileSync } from "fs";
import { parse } from "toml";
import { join } from "path";

export interface Config {
    token: string;
}

const contents = readFileSync(join(__dirname, "../config.toml"), "utf8");
export const config = parse(contents) as Config;