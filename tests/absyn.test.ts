import { genAbsyn } from "../src/deserialization/absyn";
import { parseTree } from "../src/deserialization/parse";
import * as E from "fp-ts/Either";
import { PathReporter } from "io-ts/lib/PathReporter";

describe("absyn", () => {
  it.each([
    [
      "single tap",
      "3,",
      {
        chart: [
          {
            bpm: null,
            len: null,
            noteCol: [
              {
                noteType: "tap",
                loc: {
                  button: 3,
                },
                brk: null,
                ex: null,
                star: "",
              },
            ],
          },
        ],
      },
      {
        noteCollections: [
          {
            contents: [
              {
                decorators: {
                  ex: false,
                  break: false,
                },
                location: 2,
                style: "circle",
              },
            ],
            time: 0,
          },
        ],
        timing: [],
        slides: [],
      },
    ],
    [
      "forced star tap",
      "3$,",
      {
        chart: [
          {
            bpm: null,
            len: null,
            noteCol: [
              {
                noteType: "tap",
                loc: {
                  button: 3,
                },
                brk: null,
                ex: null,
                star: "$",
              },
            ],
          },
        ],
      },
      {
        noteCollections: [
          {
            contents: [
              {
                decorators: {
                  ex: false,
                  break: false,
                },
                location: 2,
                style: "star",
              },
            ],
            time: 0,
          },
        ],
        timing: [],
        slides: [],
      },
    ],
    [
      "forced stationary star tap",
      "3$$,",
      {
        chart: [
          {
            bpm: null,
            len: null,
            noteCol: [
              {
                noteType: "tap",
                loc: {
                  button: 3,
                },
                brk: null,
                ex: null,
                star: "$$",
              },
            ],
          },
        ],
      },
      {
        noteCollections: [
          {
            contents: [
              {
                decorators: {
                  ex: false,
                  break: false,
                },
                location: 2,
                style: "starStationary",
              },
            ],
            time: 0,
          },
        ],
        timing: [],
        slides: [],
      },
    ],
    [
      "tap break",
      "3b,",
      {
        chart: [
          {
            bpm: null,
            len: null,
            noteCol: [
              {
                noteType: "tap",
                loc: {
                  button: 3,
                },
                brk: "b",
                ex: null,
                star: "",
              },
            ],
          },
        ],
      },
      {
        noteCollections: [
          {
            contents: [
              {
                decorators: {
                  ex: false,
                  break: true,
                },
                location: 2,
                style: "circle",
              },
            ],
            time: 0,
          },
        ],
        timing: [],
        slides: [],
      },
    ],
    [
      "tap break ex",
      "3bx,",
      {
        chart: [
          {
            bpm: null,
            len: null,
            noteCol: [
              {
                noteType: "tap",
                loc: {
                  button: 3,
                },
                brk: "b",
                ex: "x",
                star: "",
              },
            ],
          },
        ],
      },
      {
        noteCollections: [
          {
            contents: [
              {
                decorators: {
                  ex: true,
                  break: true,
                },
                location: 2,
                style: "circle",
              },
            ],
            time: 0,
          },
        ],
        timing: [],
        slides: [],
      },
    ],
    [
      "2 consecutive taps @ 120bpm",
      "(120)3,3,",
      {
        chart: [
          {
            bpm: 120,
            len: null,
            noteCol: [
              {
                noteType: "tap",
                loc: {
                  button: 3,
                },
                brk: null,
                ex: null,
                star: "",
              },
            ],
          },
          {
            bpm: null,
            len: null,
            noteCol: [
              {
                noteType: "tap",
                loc: {
                  button: 3,
                },
                brk: null,
                ex: null,
                star: "",
              },
            ],
          },
        ],
      },
      {
        noteCollections: [
          {
            contents: [
              {
                decorators: {
                  ex: false,
                  break: false,
                },
                location: 2,
                style: "circle",
              },
            ],
            time: 0,
          },
          {
            contents: [
              {
                decorators: {
                  ex: false,
                  break: false,
                },
                location: 2,
                style: "circle",
              },
            ],
            time: 0.5,
          }

        ],
        timing: [],
        slides: [],
      },
    ],
  ])("%s - [ %s ]", (_, __, pt, expected) => {
    const tpt = parseTree.decode(pt);
    const errors = PathReporter.report(tpt);
    if (E.isLeft(tpt)) {
      throw new Error(errors.reduce((acc, val) => `${acc}\n${val}`));
    }
    const result = genAbsyn(tpt.right);
    if (E.isLeft(result)) {
      throw new Error(result.left.message);
    }
    const actual = result.right;
    expect(actual).toMatchObject(expected);
  });
});
