import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { Chart, MaidataFile } from "./chart";
import { AbsynError, genAbsyn } from "./deserialization/absyn";
import { link } from "./deserialization/linker";
import { partitionAndPreserveRights } from "./fp/Array";
import { parseMaidata } from "./deserialization/maidataParser";
import { Cell, mapParse, ParseError } from "./deserialization/parse";

export type LevelMetadata = {
  difficulty: string;
  chartKey: string;
  levelKey: string;
};

export const difficulties = {
  original: "original",
  remaster: "remaster",
  master: "master",
  expert: "expert",
  advanced: "advanced",
  basic: "basic",
  easy: "easy",
} as const;

const defaultLevels: Array<LevelMetadata> = [
  {
    difficulty: difficulties.easy,
    chartKey: "inote_1",
    levelKey: "lv_1",
  },
  {
    difficulty: difficulties.basic,
    chartKey: "inote_2",
    levelKey: "lv_2",
  },
  {
    difficulty: difficulties.advanced,
    chartKey: "inote_3",
    levelKey: "lv_3",
  },
  {
    difficulty: difficulties.expert,
    chartKey: "inote_4",
    levelKey: "lv_4",
  },
  {
    difficulty: difficulties.master,
    chartKey: "inote_5",
    levelKey: "lv_5",
  },
  {
    difficulty: difficulties.remaster,
    chartKey: "inote_6",
    levelKey: "lv_6",
  },
  {
    difficulty: difficulties.original,
    chartKey: "inote_7",
    levelKey: "lv_7",
  },
];

export type DeserializationError =
  | ParseError
  | AbsynError
  | { message: string };

export type DeserializationResult<T> = {
  errors: Array<DeserializationError>;
  chart: T | null;
};

/**
 * Deserialize a single difficulty
 * @param data
 * @returns
 */
export const deserializeSingle = (data: string): DeserializationResult<Chart> =>
  pipe(
    data,
    mapParse,
    partitionAndPreserveRights<ParseError, Cell>(() => ({ noteCol: [] })),
    ({ left, right }) => {
      const a = genAbsyn(right)
      const soaChart = pipe(a, E.map(link));
      return E.isRight(soaChart)
        ? {
            errors: left,
            chart: soaChart.right,
          }
        : {
            errors: [...left, soaChart.left],
            chart: null,
          };
    },
  );

/**
 * Deserialize the entire file
 * @param maidata
 * @param customLevels
 * @returns
 */
export const deserializeMaidata = (
  maidata: NonNullable<string>,
  customLevels?: Array<LevelMetadata>,
): DeserializationResult<MaidataFile> => {
  type Inter = {
    errors: Array<DeserializationError>;
    payload: {
      difficulty: string;
      levelNumber: string;
      chart: Chart;
    };
  };
  const raw = parseMaidata(maidata);
  const title = raw["title"];
  const artist = raw["artist"];
  const author = raw["des"];
  const offset = parseFloat(raw["first"]);
  // we need to lift the errors out of the deserializeSingle call
  const [errors, levels] = pipe(
    [...defaultLevels, ...(customLevels ?? [])],
    A.filterMap<LevelMetadata, Inter>(({ difficulty, chartKey, levelKey }) => {
      const c = raw[chartKey];
      if (c === undefined) return O.none;
      const { errors, chart: chart } = deserializeSingle(c);
      return chart === null
        ? O.none
        : O.some({
            errors,
            payload: { difficulty, chart, levelNumber: raw[levelKey] },
          });
    }),
    A.reduce<
      Inter,
      [
        Array<DeserializationError>,
        Array<[string, { chart: Chart; level: string }]>,
      ]
    >([[], []], ([aErrors, aLevels], curr) => [
      [...aErrors, ...curr.errors],
      [
        ...aLevels,
        [
          curr.payload.difficulty,
          { chart: curr.payload.chart, level: curr.payload.levelNumber },
        ],
      ],
    ]),
    ([errors, levels]) => [errors, Object.fromEntries(levels)],
  );
  const data: MaidataFile = {
    raw,
    title,
    artist,
    author,
    offset,
    levels,
  };
  return {
    errors,
    chart: data,
  };
};

// TODO:
export const serialize = (chart: MaidataFile): string => {
  throw new Error("Not implemented yet.");
};
