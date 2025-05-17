import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { Chart, MaidataFile } from "./chart";
import * as Notes from "./chart";
import { Cell, mapParse, ParseError } from "deserialization/parse";
import { AbsynError, genAbsyn } from "deserialization/absyn";
import { explode } from "deserialization/explode";
import { partitionAndPreserveRights } from "fp/Array";
import { parseMaidata } from "deserialization/maidataParser";

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

export type DeserializationError =
  | ParseError
  | AbsynError
  | { message: string };

export type DeserializationResult<T> = {
  errors: Array<DeserializationError>;
  data: T | null;
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
      const soaChart = pipe(genAbsyn(right), E.map(explode));
      return E.isRight(soaChart)
        ? {
            errors: left,
            data: soaChart.right,
          }
        : {
            errors: [...left, soaChart.left],
            data: null,
          };
    },
  );

/**
 * Deserialize the entire file
 * @param maidata
 * @param customLevels
 * @returns
 */
export const deserialize = (
  maidata: string,
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
      const { errors, data: chart } = deserializeSingle(raw[chartKey]);
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
    data,
  };
};

// TODO:
export const serialize = (chart: MaidataFile): string => {
  throw new Error("Not implemented yet.");
};

/**
 * Given a full slide path, computes the total duration of the longest
 * slide path. The longest duration is the sum of that path's initial delay
 * and the time taken to complete the slide body.
 *
 * @param slide The slide to process
 * @returns The length in seconds of the longest path in the slide.
 */
// TODO: test this
export const slideVisibleDuration = (slide: Notes.Slide): number =>
  slide.paths.reduce<number>(
    (maxPathDuration, path) =>
      Math.max(
        maxPathDuration,
        path.slideSegments.reduce<number>(
          (maxSegmentDuration, segment) =>
            Math.max(maxSegmentDuration, segment.duration),
          0,
        ) + path.delay,
      ),
    0,
  );

export const noteDuration = (note: Notes.Note) => {
  switch (note.type) {
    case "tap":
    case "touch":
      return 0;
    case "hold":
    case "touchHold":
      return note.duration;
  }
};

/**
 * Gets the length of the longest hold in a note collection.
 * @param noteCol
 * @returns
 */
export const maxHoldDuration = (noteCol: Notes.NoteCollection) =>
  noteCol.contents
    .filter(({ type }) => type === "hold" || type === "touchHold")
    .map((n) => (n as Notes.Hold | Notes.TouchHold).duration)
    .reduce((acc, curr) => Math.max(acc, curr), 0);
