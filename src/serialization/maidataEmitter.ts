import { MaidataFile } from "../chart";
import { LevelMetadata } from "../simai";

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
  throw new Error("Not implemented");
};
