import {
  deserializeMaidata,
  deserializeSingle,
  serializeMaidata,
  serializeSingle,
} from "../../src/simai";
import { Chart } from "../../src/chart";
import { emitCell } from "../../src/serialization/emit";
import { canonicalize } from "../../src/serialization/canonicalize";
import { fragrance } from "../chartData/fragranceMaster";
import { lowercaseLifetimeMaidata } from "../chartData/lowercaseLifetimeMaidata";

// ── emit unit tests ───────────────────────────────────────────────────────────

describe("emitCell", () => {
  it.each([
    // bpm/div markers
    ["(180){8}", { bpm: 180, div: { type: "div", val: 8 }, noteCol: [] }],
    ["(120.5)", { bpm: 120.5, noteCol: [] }],
    ["{16}", { div: { type: "div", val: 16 }, noteCol: [] }],
    ["{#0.5}", { div: { type: "sec", val: 0.5 }, noteCol: [] }],
    // tap
    [
      "1",
      { noteCol: [{ type: "tap", location: { button: 1 }, decorators: [] }] },
    ],
    [
      "3b",
      {
        noteCol: [{ type: "tap", location: { button: 3 }, decorators: ["b"] }],
      },
    ],
    [
      "5x",
      {
        noteCol: [{ type: "tap", location: { button: 5 }, decorators: ["x"] }],
      },
    ],
    // hold
    [
      "2h[4:1]",
      {
        noteCol: [
          {
            type: "hold",
            location: { button: 2 },
            decorators: [],
            length: { type: "ratio", ratio: { div: 4, num: 1 } },
          },
        ],
      },
    ],
    // touch
    [
      "A1",
      {
        noteCol: [
          { type: "touch", location: { frag: "A", pos: 1 }, decorators: [] },
        ],
      },
    ],
    [
      "C",
      {
        noteCol: [
          { type: "touch", location: { frag: "C", pos: 1 }, decorators: [] },
        ],
      },
    ],
    [
      "C2",
      {
        noteCol: [
          { type: "touch", location: { frag: "C", pos: 2 }, decorators: [] },
        ],
      },
    ],
    [
      "B3f",
      {
        noteCol: [
          { type: "touch", location: { frag: "B", pos: 3 }, decorators: ["f"] },
        ],
      },
    ],
    // touch hold
    [
      "A1h[4:1]",
      {
        noteCol: [
          {
            type: "touchHold",
            location: { frag: "A", pos: 1 },
            decorators: [],
            length: { type: "ratio", ratio: { div: 4, num: 1 } },
          },
        ],
      },
    ],
    // each
    [
      "1/2",
      {
        noteCol: [
          { type: "tap", location: { button: 1 }, decorators: [] },
          { type: "tap", location: { button: 2 }, decorators: [] },
        ],
      },
    ],
  ] as const)("emits %s", (expected, cell) => {
    expect(emitCell(cell as any)).toBe(expected);
  });

  it("emits a slide with a ratio length", () => {
    const cell = {
      noteCol: [
        {
          type: "slide",
          location: { button: 1 },
          decorators: [],
          style: "",
          slidePaths: [
            {
              joinType: "constant",
              segments: [{ slideType: "-", tailVerts: [{ button: 5 }] }],
              len: { type: "ratio", ratio: { div: 4, num: 1 } },
              brk: "",
            },
          ],
        },
      ],
    };
    expect(emitCell(cell as any)).toBe("1-5[4:1]");
  });

  it("emits a grand-V slide", () => {
    const cell = {
      noteCol: [
        {
          type: "slide",
          location: { button: 1 },
          decorators: [],
          style: "",
          slidePaths: [
            {
              joinType: "constant",
              segments: [
                { slideType: "V", tailVerts: [{ button: 3 }, { button: 5 }] },
              ],
              len: { type: "ratio", ratio: { div: 4, num: 1 } },
              brk: "",
            },
          ],
        },
      ],
    };
    expect(emitCell(cell as any)).toBe("1V35[4:1]");
  });
});

// ── canonicalize unit tests ───────────────────────────────────────────────────

describe("canonicalize", () => {
  const div = (val: number) => ({ type: "div" as const, val });
  const empty = () => ({ noteCol: [] });
  const emptyDiv = (val: number) => ({ div: div(val), noteCol: [] });
  const note = () => ({ noteCol: [{ type: "tap" as const, location: { button: 1 }, decorators: [] }] });

  it("collapses 4 empty cells at {4} into 1 empty cell at {1}", () => {
    const input = [emptyDiv(4), empty(), empty(), empty()];
    const output = canonicalize(input);
    expect(output).toHaveLength(1);
    expect(output[0].div).toEqual(div(1));
  });

  it("collapses 2 empty cells at {8} into 1 empty cell at {4}", () => {
    const input = [emptyDiv(8), empty()];
    const output = canonicalize(input);
    expect(output).toHaveLength(1);
    expect(output[0].div).toEqual(div(4));
  });

  it("collapses 8 empty cells at {4} into 2 empty cells at {1}", () => {
    const input = [emptyDiv(4), empty(), empty(), empty(), empty(), empty(), empty(), empty()];
    const output = canonicalize(input);
    expect(output).toHaveLength(2);
    expect(output[0].div).toEqual(div(1));
    expect(output[1].div).toBeUndefined();
  });

  it("leaves 3 empty cells at {4} unchanged (gcd=1, no simplification)", () => {
    const input = [emptyDiv(4), empty(), empty()];
    const output = canonicalize(input);
    expect(output).toHaveLength(3);
  });

  it("does not merge across a note", () => {
    const input = [emptyDiv(4), empty(), note(), empty(), empty()];
    const output = canonicalize(input);
    // First run: 2 empty at {4}, gcd=2 → 1 empty at {2}
    // Note: untouched
    // Second run: 2 empty at {2} (inherited div), gcd=2 → 1 empty at {1}
    expect(output).toHaveLength(3);
  });

  it("does not merge across a bpm change", () => {
    const input = [emptyDiv(4), { noteCol: [], bpm: 180 }, empty(), empty()];
    const output = canonicalize(input);
    // The bpm cell breaks the run; only the first cell stands alone
    expect(output[1].bpm).toBe(180);
    expect(output).toHaveLength(3); // [emptyDiv4], [bpm180 empty], [empty+empty collapsed]
  });

  it("does not merge across a div change mid-run", () => {
    const input = [emptyDiv(4), empty(), emptyDiv(8), empty()];
    // First run: 2 at {4} → gcd=2 → 1 at {2}
    // Second run: 2 at {8} → gcd=2 → 1 at {4}
    const output = canonicalize(input);
    expect(output).toHaveLength(2);
    expect(output[0].div).toEqual(div(2));
    expect(output[1].div).toEqual(div(4));
  });

  it("preserves non-empty cells unchanged", () => {
    const input = [{ bpm: 120, div: div(4), noteCol: [] }, note(), empty(), empty(), empty(), empty()];
    const output = canonicalize(input);
    expect(output[0].bpm).toBe(120);
    expect(output[1]).toEqual(note());
    // 4 empty at {4} after note → {1}
    expect(output[2].div).toEqual(div(1));
    expect(output).toHaveLength(3);
  });
});

// ── roundtrip tests ───────────────────────────────────────────────────────────

describe("serialisation roundtrip", () => {
  it("serialises empty-cell runs in canonical form", () => {
    // (120){4},,,,2, has 4 empty cells at {4} = 1 measure. Canonical: {1},2,
    const input = "(120){4},,,,1,";
    const { chart } = deserializeSingle(input, 0);
    const { errors, text } = serializeSingle(chart!, 0);
    expect(errors).toHaveLength(0);
    // Should not contain the verbose 4-comma form; the run must be collapsed
    const commaRuns = text!.replace(/[^,]/g, "").match(/,{2,}/g) ?? [];
    expect(commaRuns.every((run) => run.length < 4)).toBe(true);
    // Timing must be preserved
    const { chart: chart2 } = deserializeSingle(text!, 0);
    expect(chart2!.noteCollections[0].time).toBeCloseTo(
      chart!.noteCollections[0].time,
    );
  });

  it("roundtrips a simple chart without losing note count", () => {
    const input = "(180){8}1,2,3,4,";
    const { chart } = deserializeSingle(input, 0);
    expect(chart).not.toBeNull();

    const { errors, text } = serializeSingle(chart!, 0);
    expect(errors).toHaveLength(0);
    expect(text).not.toBeNull();

    const { chart: chart2 } = deserializeSingle(text!, 0);
    expect(chart2!.noteCollections).toHaveLength(chart!.noteCollections.length);
  });

  it("roundtrips holds", () => {
    const input = "(120){8}1h[4:1],2h[4:1],";
    const { chart } = deserializeSingle(input, 0);
    const { text } = serializeSingle(chart!, 0);
    const { chart: chart2 } = deserializeSingle(text!, 0);

    expect(chart2!.noteCollections).toHaveLength(2);
    expect(chart2!.noteCollections[0].contents[0].type).toBe("hold");
  });

  it("roundtrips slides", () => {
    const input = "(120){8}1-5[4:1],";
    const { chart } = deserializeSingle(input, 0);
    const { text } = serializeSingle(chart!, 0);
    const { chart: chart2 } = deserializeSingle(text!, 0);

    const slides = chart2!.noteCollections.flatMap((nc) => nc.slides);
    expect(slides).toHaveLength(1);
    expect(slides[0].paths[0].slideSegments[0].type).toBe("straight");
  });

  it("roundtrips touch notes", () => {
    const input = "(120){8}A1,C,B3f,";
    const { chart } = deserializeSingle(input, 0);
    const { text } = serializeSingle(chart!, 0);
    const { chart: chart2 } = deserializeSingle(text!, 0);

    expect(chart2!.noteCollections).toHaveLength(3);
    expect(chart2!.noteCollections[0].contents[0].type).toBe("touch");
  });

  it("roundtrips each notes", () => {
    const input = "(120){8}1/2,3/4,";
    const { chart } = deserializeSingle(input, 0);
    const { text } = serializeSingle(chart!, 0);
    const { chart: chart2 } = deserializeSingle(text!, 0);

    expect(chart2!.noteCollections[0].contents).toHaveLength(2);
    expect(chart2!.noteCollections[1].contents).toHaveLength(2);
  });

  it("does not emit {0} when notes have no intermediate cells and are far apart", () => {
    // Construct a Chart directly with two notes 6 seconds apart at BPM 120,
    // with no intermediate empty noteCollections between them.
    // At BPM 120: computeDiv(6, 120) = 240 / (120 * 6) = 0.33 → rounds to 0 (bug).
    // Expected: clamp to {1} and insert 2 empty cells to cover the 3-measure gap.
    const chart: Chart = {
      noteCollections: [
        {
          contents: [{ type: "tap", location: 0, style: "circle", decorators: { break: false, ex: false } }],
          slides: [],
          time: 0,
        },
        {
          contents: [{ type: "tap", location: 1, style: "circle", decorators: { break: false, ex: false } }],
          slides: [],
          time: 6,
        },
      ],
      timing: [{ time: 0, bpm: 120 }],
    };

    const { errors, text } = serializeSingle(chart, 0);
    expect(errors).toHaveLength(0);
    expect(text).not.toBeNull();
    expect(text).not.toContain("{0}");

    const { chart: chart2 } = deserializeSingle(text!, 0);
    const noteCols = chart2!.noteCollections.filter((nc) => nc.contents.length > 0);
    expect(noteCols).toHaveLength(2);
    expect(noteCols[0].time).toBeCloseTo(0);
    expect(noteCols[1].time).toBeCloseTo(6);
  });

  it("preserves timing precision when notes are spaced at a fine division with a large gap", () => {
    // At BPM 120, {32} step = 0.0625s. Two notes 33 steps apart = 2.0625s gap.
    // 2.0625s is not a multiple of {1} (2s), {2} (1s), etc. — only {32} fits evenly.
    // Bug: computeDiv(2.0625, 120) ≈ 0.97 → clamps to {1}, numSteps=1 → note lands at 2s.
    const bpm = 120;
    const div = 32;
    const steps = 33;
    const stepSize = 240 / (bpm * div); // 0.0625s
    const expectedTime = steps * stepSize; // 2.0625s

    const chart: Chart = {
      noteCollections: [
        {
          contents: [{ type: "tap", location: 0, style: "circle", decorators: { break: false, ex: false } }],
          slides: [],
          time: 0,
        },
        {
          contents: [{ type: "tap", location: 1, style: "circle", decorators: { break: false, ex: false } }],
          slides: [],
          time: expectedTime,
        },
      ],
      timing: [{ time: 0, bpm }],
    };

    const { errors, text } = serializeSingle(chart, 0);
    expect(errors).toHaveLength(0);
    expect(text).not.toBeNull();

    const { chart: chart2 } = deserializeSingle(text!, 0);
    const noteCols = chart2!.noteCollections.filter((nc) => nc.contents.length > 0);
    expect(noteCols).toHaveLength(2);
    expect(noteCols[1].time).toBeCloseTo(expectedTime);
  });

  it("does not throw when serialising fragrance master", () => {
    const { chart } = deserializeSingle(fragrance, 0);
    expect(chart).not.toBeNull();
    expect(() => serializeSingle(chart!, 0)).not.toThrow();
  });

  it("roundtrips an entire maidata file preserving metadata", () => {
    const { chart: file } = deserializeMaidata(lowercaseLifetimeMaidata);
    expect(file).not.toBeNull();

    const { errors, text } = serializeMaidata(file!);
    expect(errors).toHaveLength(0);
    expect(text).not.toBeNull();

    const { chart: file2 } = deserializeMaidata(text!);
    expect(file2!.title).toBe(file!.title);
    expect(file2!.artist).toBe(file!.artist);
    expect(file2!.author).toBe(file!.author);
    expect(file2!.offset).toBe(file!.offset);
  });
});
