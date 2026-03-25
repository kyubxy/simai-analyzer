import * as E from "fp-ts/Either";
import { MaidataFile } from "../chart";
import { LevelMetadata } from "../simai";
import { unlink } from "./unlinker";
import { lower } from "./lower";
import { emit } from "./emit";

const defaultLevels: Array<LevelMetadata> = [
  { difficulty: "easy",     chartKey: "inote_1", levelKey: "lv_1" },
  { difficulty: "basic",    chartKey: "inote_2", levelKey: "lv_2" },
  { difficulty: "advanced", chartKey: "inote_3", levelKey: "lv_3" },
  { difficulty: "expert",   chartKey: "inote_4", levelKey: "lv_4" },
  { difficulty: "master",   chartKey: "inote_5", levelKey: "lv_5" },
  { difficulty: "remaster", chartKey: "inote_6", levelKey: "lv_6" },
  { difficulty: "original", chartKey: "inote_7", levelKey: "lv_7" },
];

/**
 * Emits a MaidataFile as a raw `maidata.txt` string.
 *
 * Serializes all metadata fields and each difficulty's chart text using the
 * `&key=value` format expected by the maimai engine. Inverse of
 * maidataParser.ts parseMaidata().
 *
 * @param file The parsed maidata representation to emit
 * @param levels The level metadata describing which difficulty keys to use.
 *               Defaults to the standard difficulty set if omitted.
 * @returns The complete maidata.txt string
 */
export const emitMaidata = (
  file: MaidataFile,
  levels?: Array<LevelMetadata>,
): string => {
  const activeLevels = levels ?? defaultLevels;

  // Start from raw, then override with typed fields and re-serialized charts
  const kv: Record<string, string> = { ...file.raw };

  if (file.title  !== undefined) kv["title"]  = file.title;
  if (file.artist !== undefined) kv["artist"] = file.artist;
  if (file.author !== undefined) kv["des"]    = file.author;
  if (file.offset !== undefined) kv["first"]  = String(file.offset);

  for (const { difficulty, chartKey, levelKey } of activeLevels) {
    const level = file.levels[difficulty];
    if (level === undefined) continue;
    if (level.chart !== undefined) {
      const cellsE = lower(unlink(level.chart), file.offset);
      if (E.isRight(cellsE)) kv[chartKey] = emit(cellsE.right);
    }
    if (level.level !== undefined) kv[levelKey] = level.level;
  }

  return Object.entries(kv)
    .map(([k, v]) => `&${k}=${v}`)
    .join("\n");
};
