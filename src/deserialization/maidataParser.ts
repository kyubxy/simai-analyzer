import { RawMaidata } from "chart";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/lib/function";

const removeLineBreaks = (str: string) => str.replace(/(\r\n|\n|\r)/gm, "");

export const parseMaidata = (maidata: string): RawMaidata =>
  pipe(
    removeLineBreaks(maidata)
      .split("&")
      .filter((x) => x !== ""),
    A.reduce<string, RawMaidata>({}, (rmaidata, line) => {
      const kvpair = line.split("=");
      if (kvpair.length !== 2) {
        throw new Error(`Invalid maidata, got [${line}].`);
      }
      const [key, value] = kvpair;
      return { ...rmaidata, [key]: value };
    }),
  );
