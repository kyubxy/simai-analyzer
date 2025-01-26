import { Chart, MaiChart } from "./chart"
import { genAbsyn } from "./deserialization/absyn"
import { parse } from "../lib/parser"

export const deserializeChart = (data: string): Chart => genAbsyn(parse(data))

export const serializeChart = (chart: MaiChart): string => 
  ""