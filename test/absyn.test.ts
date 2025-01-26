import { genAbsyn } from "../src/deserialization/absyn";
import { ParseTree } from "../src/deserialization/parse";

describe("absyn", () => {
  it.each([
    // Taps and decorators

    [
      "single tap",
      "3,",
      {
        chart: [
          {
            bpm: 130,
            len: null,
            noteCol: [
              {
                type: "tap",
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
        timing: [
          {
            bpm: 130,
            time: 0,
          },
        ],
        slides: [],
      },
    ],
    [
      "forced star tap",
      "3$,",
      {
        chart: [
          {
            bpm: 130,
            len: null,
            noteCol: [
              {
                type: "tap",
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
        timing: [
          {
            bpm: 130,
            time: 0,
          },
        ],
        slides: [],
      },
    ],
    [
      "forced stationary star tap",
      "3$$,",
      {
        chart: [
          {
            bpm: 130,
            len: null,
            noteCol: [
              {
                type: "tap",
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
        timing: [
          {
            bpm: 130,
            time: 0,
          },
        ],
        slides: [],
      },
    ],
    [
      "tap break",
      "3b,",
      {
        chart: [
          {
            bpm: 130,
            len: null,
            noteCol: [
              {
                type: "tap",
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
        timing: [
          {
            bpm: 130,
            time: 0,
          },
        ],
        slides: [],
      },
    ],
    [
      "tap break ex",
      "3bx,",
      {
        chart: [
          {
            bpm: 130,
            len: null,
            noteCol: [
              {
                type: "tap",
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
        timing: [
          {
            bpm: 130,
            time: 0,
          },
        ],
        slides: [],
      },
    ],

    // Length divisions / BPM

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
                type: "tap",
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
                type: "tap",
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
          },
        ],
        timing: [
          {
            bpm: 120,
            time: 0,
          },
        ],
        slides: [],
      },
    ],
    [
      "3 consecutive taps @ 120bpm",
      "(120)3,3,3,",
      {
        chart: [
          {
            bpm: 120,
            len: null,
            noteCol: [
              {
                type: "tap",
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
                type: "tap",
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
                type: "tap",
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
            time: 1,
          },
        ],
        timing: [
          {
            bpm: 120,
            time: 0,
          },
        ],
        slides: [],
      },
    ],
    [
      "3 consecutive taps @ 120bpm, middle one empty",
      "(120)3,,3,",
      {
        chart: [
          {
            bpm: 120,
            len: null,
            noteCol: [
              {
                type: "tap",
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
            noteCol: null,
          },
          {
            bpm: null,
            len: null,
            noteCol: [
              {
                type: "tap",
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
            time: 1,
          },
        ],
        timing: [
          {
            bpm: 120,
            time: 0,
          },
        ],
        slides: [],
      },
    ],
    [
      "3 consecutive taps that increase from 120 -> 240",
      "(120)3,(240)3,3,",
      {
        chart: [
          {
            bpm: 120,
            len: null,
            noteCol: [
              {
                type: "tap",
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
            bpm: 240,
            len: null,
            noteCol: [
              {
                type: "tap",
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
                type: "tap",
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
            time: 0.75,
          },
        ],
        timing: [
          {
            bpm: 120,
            time: 0,
          },
          {
            bpm: 240,
            time: 0.5,
          },
        ],
        slides: [],
      },
    ],
    [
      "3 consecutive taps @ 120bpm / 8 len div",
      "(120){8}3,3,3,",
      {
        chart: [
          {
            bpm: 120,
            len: {
              type: "div",
              val: 8,
            },
            noteCol: [
              {
                type: "tap",
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
                type: "tap",
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
                type: "tap",
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
            time: 0.25,
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
          },
        ],
        timing: [
          {
            bpm: 120,
            time: 0,
          },
        ],
        slides: [],
      },
    ],
    [
      "3 consecutive taps @ 120bpm, start at 4 and go to 8 len div",
      "(120){4}3,{8}3,3,",
      {
        chart: [
          {
            bpm: 120,
            len: {
              type: "div",
              val: 4,
            },
            noteCol: [
              {
                type: "tap",
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
            len: {
              type: "div",
              val: 8,
            },
            noteCol: [
              {
                type: "tap",
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
                type: "tap",
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
            time: 0.75,
          },
        ],
        timing: [
          {
            bpm: 120,
            time: 0,
          },
        ],
        slides: [],
      },
    ],
    [
      // TODO: we should parse fractional seconds values too
      "3 consecutive taps @ 3sec",
      "(120){#3}3,3,3,",
      {
        chart: [
          {
            bpm: 120,
            len: {
              type: "sec",
              val: 3,
            },
            noteCol: [
              {
                type: "tap",
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
                type: "tap",
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
                type: "tap",
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
            time: 3,
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
            time: 6,
          },
        ],
        timing: [
          {
            bpm: 120,
            time: 0,
          },
        ],
        slides: [],
      },
    ],

    // Holds

    [
      "hold @ 120bpm",
      "(120)3h[4:1],",
      {
        chart: [
          {
            bpm: 120,
            len: null,
            noteCol: [
              {
                type: "hold",
                loc: {
                  button: 3,
                },
                brk: null,
                ex: null,
                dur: {
                  type: "ratio",
                  ratio: {
                    div: 4,
                    num: 1,
                  },
                },
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
                duration: 0.5,
                location: 2,
              },
            ],
            time: 0,
          },
        ],
        timing: [
          {
            bpm: 120,
            time: 0,
          },
        ],
        slides: [],
      },
    ],
    [
      "hold specified at 240bpm @ 120bpm",
      "(120)3h[240#4:1],",
      {
        chart: [
          {
            bpm: 120,
            len: null,
            noteCol: [
              {
                type: "hold",
                loc: {
                  button: 3,
                },
                brk: null,
                ex: null,
                dur: {
                  type: "bpmratio",
                  bpm: 240,
                  ratio: {
                    div: 4,
                    num: 1,
                  },
                },
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
                duration: 0.25,
                location: 2,
              },
            ],
            time: 0,
          },
        ],
        timing: [
          {
            bpm: 120,
            time: 0,
          },
        ],
        slides: [],
      },
    ],
    [
      "hold for 5 seconds",
      "(120)3h[#5],",
      {
        chart: [
          {
            bpm: 120,
            len: null,
            noteCol: [
              {
                type: "hold",
                loc: {
                  button: 3,
                },
                brk: null,
                ex: null,
                dur: {
                  type: "delay",
                  delay: 5,
                },
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
                duration: 5,
                location: 2,
              },
            ],
            time: 0,
          },
        ],
        timing: [
          {
            bpm: 120,
            time: 0,
          },
        ],
        slides: [],
      },
    ],
    [
      "hold for 6.9 seconds",
      "(120)3h[#5],",
      {
        chart: [
          {
            bpm: 120,
            len: null,
            noteCol: [
              {
                type: "hold",
                loc: {
                  button: 3,
                },
                brk: null,
                ex: null,
                dur: {
                  type: "delay",
                  delay: 6.9,
                },
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
                duration: 6.9,
                location: 2,
              },
            ],
            time: 0,
          },
        ],
        timing: [
          {
            bpm: 120,
            time: 0,
          },
        ],
        slides: [],
      },
    ],

    // Slides

    [
      "simple straight slide",
      "(120)1-5[4:1],",
      {
        chart: [
          {
            bpm: 120,
            len: null,
            noteCol: [
              {
                type: "slide",
                brk: "",
                ex: "",
                loc: {
                  button: 1,
                },
                style: "",
                slidePaths: [
                  {
                    type: "variable",
                    segments: [
                      {
                        type: "-",
                        verts: [
                          {
                            button: 5,
                          },
                        ],
                        len: {
                          type: "ratio",
                          ratio: {
                            div: 4,
                            num: 1,
                          },
                        },
                        brk: "",
                      },
                    ],
                  },
                ],
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
                location: 0,
                style: "circle",
              },
            ],
            time: 0,
          },
        ],
        timing: [
          {
            bpm: 120,
            time: 0,
          },
        ],
        slides: [
          {
            time: 0,
            paths: [
              {
                delay: 0.5,
                slideSegments: [
                  {
                    type: "straight",
                    duration: 0.5,
                    vertices: [0, 4],
                  },
                ],
                decorators: {
                  ex: false,
                  break: false,
                },
              },
            ],
          },
        ],
      },
    ],
  ])("%s - [ %s ]", (_, __, pt, expected) => {
    const actual = genAbsyn(pt as ParseTree);
    expect(actual).toMatchObject(expected);
  });
});
