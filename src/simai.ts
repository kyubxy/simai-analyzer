import { Chart, Level, MaidataFile } from "./chart";
import * as Notes from "./chart";
import { genAbsyn } from "./deserialization/absyn";
import { parse } from "../lib/parser";
import { pipe } from "fp-ts/lib/function";
import { parseMaidata } from "./deserialization/maidataParser";
import { flatMapTaskEither } from "fp-ts/lib/ReaderTaskEither";

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

export const deserializeSingle = (data: string): Chart =>
  pipe(data, parse, genAbsyn);

export const deserialize = (
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
                ? deserializeSingle(rawMaidata[chartKey])
                : undefined,
          } satisfies Level,
        ],
      ),
    ),
    raw: rawMaidata,
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
  switch(note.type) {
    case "tap":
    case "touch":
      return 0;
    case "hold":
    case "touchHold":
      return note.duration;
  }
}

/**
 * Gets the length of the longest hold in a note collection. 
 * @param noteCol 
 * @returns 
 */
export const maxHoldDuration = (noteCol: Notes.NoteCollection) =>
  noteCol.contents
    .filter(({ type }) => type === "hold" || type === "touchHold")
    .map((n) => (n as Notes.Hold | Notes.TouchHold).duration)
    .reduce((acc, curr) => Math.max(acc, curr));
