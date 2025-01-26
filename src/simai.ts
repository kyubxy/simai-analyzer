import { Chart, MaiChart } from "./chart";
import { genAbsyn } from "./deserialization/absyn";
import { parse } from "../lib/parser";
import { pipe } from "fp-ts/lib/function";

export const deserializeChart = (data: string): Chart => 
  pipe(
    data,
    parse,
    genAbsyn
  )

// TODO:
export const serializeChart = (chart: MaiChart): string => {
  throw new Error("Not implemented yet.");
};
