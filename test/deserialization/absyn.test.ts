import { genAbsyn } from "../../src/deserialization/absyn";
import { link } from "../../src/deserialization/linker";
import { Cell } from "../../src/deserialization/parse";

const deferredParent = {
  contents: [],
  time: 0,
};

const tests: Array<[string, string, Array<Cell>, any]> = [
  // Taps and decorators

  [
    "single tap",
    "3,",
    [
      {
        bpm: 130,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
    ],
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
    "tap break",
    "3b,",
    [
      {
        bpm: 130,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: ["b"],
          },
        ],
      },
    ],
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
    [
      {
        bpm: 130,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: ["b", "x"],
          },
        ],
      },
    ],
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
    [
      {
        bpm: 120,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
      {
        bpm: undefined,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
    ],
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
    [
      {
        bpm: 120,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
      {
        bpm: undefined,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
      {
        bpm: undefined,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
    ],
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
    [
      {
        bpm: 120,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
      {
        bpm: undefined,
        div: undefined,
        noteCol: [],
      },
      {
        bpm: undefined,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
    ],
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
              parent: deferredParent,
              style: "circle",
              type: "tap",
            },
          ],
          time: 0,
        },
        {
          contents: [],
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
              parent: deferredParent,
              style: "circle",
              type: "tap",
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
    [
      {
        bpm: 120,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
      {
        bpm: 240,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
      {
        bpm: undefined,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
    ],

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
    [
      {
        bpm: 120,
        div: {
          type: "div",
          val: 8,
        },
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
      {
        bpm: undefined,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
      {
        bpm: undefined,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
    ],
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
    [
      {
        bpm: 120,
        div: {
          type: "div",
          val: 4,
        },
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
      {
        bpm: undefined,
        div: {
          type: "div",
          val: 8,
        },
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
      {
        bpm: undefined,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
    ],
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
    [
      {
        bpm: 120,
        div: {
          type: "sec",
          val: 3,
        },
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
      {
        bpm: undefined,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
      {
        bpm: undefined,
        div: undefined,
        noteCol: [
          {
            type: "tap",
            location: {
              button: 3,
            },
            decorators: [],
          },
        ],
      },
    ],
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
    [
      {
        bpm: 120,
        div: undefined,
        noteCol: [
          {
            type: "hold",
            location: {
              button: 3,
            },
            decorators: [],
            length: {
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
    [
      {
        bpm: 120,
        div: undefined,
        noteCol: [
          {
            type: "hold",
            location: {
              button: 3,
            },
            decorators: [],
            length: {
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
    [
      {
        bpm: 120,
        div: undefined,
        noteCol: [
          {
            type: "hold",
            location: {
              button: 3,
            },
            decorators: [],
            length: {
              type: "delay",
              delay: 5,
            },
          },
        ],
      },
    ],
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
    [
      {
        bpm: 120,
        div: undefined,
        noteCol: [
          {
            type: "hold",
            location: {
              button: 3,
            },
            decorators: [],
            length: {
              type: "delay",
              delay: 6.9,
            },
          },
        ],
      },
    ],
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
    [
      {
        bpm: 120,
        div: undefined,
        noteCol: [
          {
            type: "slide",
            decorators: [],
            location: {
              button: 1,
            },
            style: "",
            slidePaths: [
              {
                joinType: "variable",
                segments: [
                  {
                    slideType: "-",
                    tailVerts: [
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
              style: "star",
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
  [
    "grand V slide",
    "(120)1V56[4:1],",
    [
      {
        bpm: 120,
        div: undefined,
        noteCol: [
          {
            type: "slide",
            location: {
              button: 1,
            },
            decorators: [],
            style: "",
            slidePaths: [
              {
                joinType: "variable",
                segments: [
                  {
                    slideType: "V",
                    tailVerts: [
                      {
                        button: 5,
                      },
                      {
                        button: 6,
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
              style: "star",
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
                  type: "grandV",
                  duration: 0.5,
                  vertices: [0, 4, 5],
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
  [
    "constant composite slide",
    "(120)1-4-1[4:1],",
    [
      {
        bpm: 120,
        div: undefined,
        noteCol: [
          {
            type: "slide",
            location: {
              button: 1,
            },
            decorators: [],
            style: "",
            slidePaths: [
              {
                joinType: "constant",
                segments: [
                  {
                    slideType: "-",
                    tailVerts: [
                      {
                        button: 4,
                      },
                    ],
                  },
                  {
                    slideType: "-",
                    tailVerts: [
                      {
                        button: 1,
                      },
                    ],
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
              style: "star",
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
                  vertices: [0, 3],
                },
                {
                  type: "straight",
                  duration: 0.25,
                  vertices: [3, 0],
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
  [
    "variable composite slide",
    "(120)1-4[4:1]-1[4:1],",
    [
      {
        bpm: 120,
        div: undefined,
        noteCol: [
          {
            type: "slide",
            location: {
              button: 1,
            },
            decorators: [],
            style: "",
            slidePaths: [
              {
                joinType: "variable",
                segments: [
                  {
                    slideType: "-",
                    tailVerts: [
                      {
                        button: 4,
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
                  {
                    slideType: "-",
                    tailVerts: [
                      {
                        button: 1,
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
              style: "star",
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
                  vertices: [0, 3],
                },
                {
                  type: "straight",
                  duration: 0.5,
                  vertices: [3, 0],
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
  [
    "constant composite slide with grand V",
    "(120)1-4V12[4:1],", // in reality this shape is invalid, but we'll test for this later
    [
      {
        bpm: 120,
        div: undefined,
        noteCol: [
          {
            type: "slide",
            decorators: [],
            location: {
              button: 1,
            },
            style: "",
            slidePaths: [
              {
                joinType: "constant",
                segments: [
                  {
                    slideType: "-",
                    tailVerts: [
                      {
                        button: 4,
                      },
                    ],
                  },
                  {
                    slideType: "V",
                    tailVerts: [
                      {
                        button: 1,
                      },
                      {
                        button: 2,
                      },
                    ],
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
              style: "star",
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
                  vertices: [0, 3],
                },
                {
                  type: "grandV",
                  duration: 0.25,
                  vertices: [3, 0, 1],
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
];

describe("absyn", () => {
  it.each(tests)("%s - [ %s ]", (_, __, pt, expected) => {
    const soa = genAbsyn(pt as Array<Cell>);
    if (soa._tag === "Left") {
      console.log(soa.left)
      expect(soa._tag).toBe("Right");
      return;
    }
    const actual = link(soa.right);

    // we test parent correctness in linking
    for (const { contents } of actual.noteCollections) {
      for (const c of contents) {
        c.parent = deferredParent
      }
    }

    expect(actual).toMatchObject(expected);
  });
});
