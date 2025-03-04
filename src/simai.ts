import { Chart, Level, MaidataFile } from "./chart";
import { genAbsyn } from "./deserialization/absyn";
import { parse } from "../lib/parser";
import { pipe } from "fp-ts/lib/function";
import { parseMaidata } from "./deserialization/maidataParser";

export type LevelMetadata = {
  difficulty: string;
  chartKey: string;
  levelKey: string;
};

const defaultLevels: Array<LevelMetadata> = [
  {
    difficulty: "easy",
    chartKey: "inote_1",
    levelKey: "lv_1",
  },
  {
    difficulty: "basic",
    chartKey: "inote_2",
    levelKey: "lv_2",
  },
  {
    difficulty: "advanced",
    chartKey: "inote_3",
    levelKey: "lv_3",
  },
  {
    difficulty: "expert",
    chartKey: "inote_4",
    levelKey: "lv_4",
  },
  {
    difficulty: "master",
    chartKey: "inote_5",
    levelKey: "lv_5",
  },
  {
    difficulty: "remaster",
    chartKey: "inote_6",
    levelKey: "lv_6",
  },
  {
    difficulty: "original",
    chartKey: "inote_7",
    levelKey: "lv_7",
  },
];

export const deserialize = (data: string): Chart => pipe(data, parse, genAbsyn)

export const deserializeSingle = (
  maidata: string,
  customLevels?: Array<LevelMetadata>,
): MaidataFile => {
  const rawMaidata = parseMaidata(maidata);
  return {
    title: rawMaidata["title"],
    artist: rawMaidata["artist"],
    author: rawMaidata["des"],
    offset: Number(rawMaidata["first"]),
    levels: Object.fromEntries(
      [...defaultLevels, ...(customLevels ?? [])].map(
        ({ difficulty, chartKey, levelKey }) => [
          difficulty,
          {
            level: levelKey in rawMaidata ? rawMaidata[levelKey] : undefined,
            chart:
              chartKey in rawMaidata
                ? deserialize(rawMaidata[chartKey])
                : undefined,
          } satisfies Level,
        ],
      ),
    ),
    raw: rawMaidata,
  };
};

// TODO:
export const serializeChart = (chart: MaidataFile): string => {
  throw new Error("Not implemented yet.");
};
