import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/Array";

export type RawMaidata = { [id: string]: string };

export const parseMaidata = (maidata: string): RawMaidata => {
  return pipe(
    ("\n" + maidata).split("\n&"),
    A.filter((line) => line.length > 0),
    A.map((line) => line.trimStart().trimEnd()),
    A.reduce<string, RawMaidata>({}, (acc, line) => {
      const kv = line.split("=");
      const key = kv.at(0).trimStart().trimEnd();
      const value = kv.slice(1).join("=").trimStart().trimEnd();
      if (key === undefined || value === undefined) return acc;
      return {
        ...acc,
        [key]: value,
      };
    }),
  );
};
