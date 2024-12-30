import { parseTree } from "../src/deserialization/parse"
import { PathReporter } from 'io-ts/lib/PathReporter'
import * as E from "fp-ts/Either";

describe("parse tree", () =>
  it.each([
    [
      "only bpm",
      "(160)",
      {
        chart: [
          {
            bpm: 160,
            len: null,
            noteCol: null,
          },
        ],
      },
    ],
    [
      "only length marker (1)",
      "{4}",
      {
        chart: [
          {
            bpm: null,
            len: {
              div: 4
            },
            noteCol: null,
          },
        ],
      },
    ],
    [
      "only length marker (2)",
      "{#4}",
      {
        chart: [
          {
            bpm: null,
            len: {
              sec: 4
            },
            noteCol: null,
          },
        ],
      },
    ],
    [
      "only tap",
      "4,",
      {
        chart: [
          {
            bpm: null,
            len: null,
            noteCol: [
              {
                noteType: "tap",
                loc: {
                  button: 4,
                },
                brk: null,
                ex: null,
                star: ''
              }
            ],
          },
        ],
      },
    ],
  ])("Parses a parse tree that has %s [ %s ]", (_, __, pt) => {
    const tpt = parseTree.decode(pt)
    const errors = PathReporter.report(tpt)
    try {
      expect(errors[0]).toBe("No errors!")
    } catch (_) {
      throw new Error(errors.reduce((acc, val) => `${acc}\n${val}`));
    }
  })
);
