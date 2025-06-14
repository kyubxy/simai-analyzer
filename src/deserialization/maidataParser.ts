import { pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import { RawMaidata } from "chart";

export const parseMaidata = (maidata: string): RawMaidata =>
  pipe(
    ("\n" + maidata).split("\n&"),
    A.filter((line) => line.length > 0),
    A.map((line) => line.trimStart().trimEnd()),
    A.reduce<string, RawMaidata>({}, (acc, line) => {
      const kv = line.split("=");
      const key = kv.at(0).trimStart().trimEnd();
      const value = kv.slice(1).join("=").trimStart().trimEnd();
      return key === undefined || value === undefined
        ? acc
        : {
            ...acc,
            [key]: value,
          };
    }),
  );
