import { parse } from "../lib/parser";
import { MaiChart } from "./maiChart";
import { genAbsyn } from "./deserialization/absyn";
import { validate } from "./deserialization/semant";

export class SimaiFile {

}

export function deserialize(data: string): MaiChart {
    const pp = preprocess(data)
    const parseTree = parse(pp)
    const ast = genAbsyn(parseTree)
    validate(ast)
    return ast
}

export function serialize(chart: MaiChart): string {

}