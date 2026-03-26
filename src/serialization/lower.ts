import * as PT from "../deserialization/parse";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { AoSChart, AbsynCell } from "../deserialization/absyn";
import * as AST from "../chart";

export class LowerError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

/**
 * The state carried through the lowering pass.
 * Mirrors the State type in absyn.ts but used in reverse — tracking what
 * BPM/div values are currently active so the emitter knows when to insert
 * new markers.
 */
type State = {
  time: number;
  bpm: number | null;
  div: PT.LenDef;
};

const getCellTime = (cell: AbsynCell): number | null => {
  if (O.isSome(cell.noteCollection)) return cell.noteCollection.value.time;
  if (O.isSome(cell.timing)) return cell.timing.value.time;
  return null;
};

// getTimeDelta for div type: (60/bpm) * (4/div.val)
// Solve for div.val: 240 / (bpm * timeDelta)
const computeDiv = (timeDelta: number, bpm: number): PT.LenDef => ({
  type: "div",
  val: Math.round(240 / (bpm * timeDelta)),
});

const lenDefEquals = (a: PT.LenDef, b: PT.LenDef): boolean =>
  a.type === b.type && a.val === b.val;

const lowerButton = (b: AST.Button): PT.ButtonLoc => ({ button: b + 1 });

const lowerSensor = (s: AST.Sensor): PT.TouchLoc => ({
  frag: s.area,
  pos: s.index + 1,
});

const lowerDecorators = (dec: AST.NoteDecorator): Array<PT.Decorator> => {
  const result: Array<PT.Decorator> = [];
  if (dec.ex) result.push("x");
  if (dec.break) result.push("b");
  return result;
};

const lowerTouchDecorators = (dec: AST.TouchDecorator): Array<PT.Decorator> => {
  const result: Array<PT.Decorator> = [];
  if (dec.hanabi) result.push("f");
  return result;
};

const lowerSlideType = (t: AST.SlideType): PT.SlideType =>
  ({
    ppShape: "pp",
    qqShape: "qq",
    pShape: "p",
    qShape: "q",
    straight: "-",
    cClockwise: "<",
    clockwise: ">",
    shortArc: "^",
    vShape: "v",
    sShape: "s",
    zShape: "z",
    fan: "w",
    grandV: "V",
  })[t] as PT.SlideType;

const lowerSlidePath = (path: AST.SlidePath): PT.SlideHead => ({
  joinType: "variable",
  segments: path.slideSegments.map((seg, i) => ({
    slideType: lowerSlideType(seg.type),
    // AST vertices = [head, ...tailVerts]; PT only stores tailVerts
    tailVerts: (seg.vertices.slice(1) as AST.Button[]).map(lowerButton),
    len:
      i === 0
        ? { type: "delay-len" as const, delay: path.delay, len: seg.duration }
        : { type: "delay-len" as const, delay: 0, len: seg.duration },
    brk: path.decorators.break ? "b" : "",
  })),
});

const lowerSlideTap = (tap: AST._Tap, slides: Array<AST.Slide>): PT.Slide => {
  const slide = slides.find((sl) => (sl as AST._Slide)._ptId === tap._ptId);
  if (slide === undefined) throw new LowerError("Star tap has no linked slide");
  return {
    type: "slide",
    location: lowerButton(tap.location),
    decorators: lowerDecorators(tap.decorators),
    style: "",
    slidePaths: slide.paths.map(lowerSlidePath),
    _id: tap._ptId,
  };
};

const lowerNote = (note: AST.Note, slides: Array<AST.Slide>): PT.Note => {
  switch (note.type) {
    case "tap": {
      const tap = note as AST.Tap;
      if (tap.style === "star" || tap.style === "starStationary")
        return lowerSlideTap(tap as AST._Tap, slides);
      return {
        type: "tap",
        location: lowerButton(tap.location),
        decorators: lowerDecorators(tap.decorators),
      };
    }
    case "hold":
      return {
        type: "hold",
        location: lowerButton(note.location),
        decorators: lowerDecorators(note.decorators),
        length: { type: "delay", delay: note.duration },
      };
    case "touch":
      return {
        type: "touch",
        location: lowerSensor(note.location),
        decorators: lowerTouchDecorators(note.decorators),
      };
    case "touchHold":
      return {
        type: "touchHold",
        location: lowerSensor(note.location),
        decorators: lowerTouchDecorators(note.decorators),
        length: { type: "delay", delay: note.duration },
      };
  }
};

/**
 * Converts an AbsynCell sequence back to a Cell sequence.
 *
 * Reconstructs the BPM and division markers needed to express timing, and
 * lowers all AST-level note/slide representations back to the grammar-level
 * parse types. Inverse of absyn.ts genAbsyn().
 *
 * @param chart The AoSChart to lower
 * @param offset The chart's time offset in seconds
 * @returns Either a LowerError or the lowered Cell array
 */
export const lower = (
  chart: AoSChart,
  offset: number,
): E.Either<LowerError, Array<PT.Cell>> => {
  try {
    const cells: PT.Cell[] = [];
    let state: State = {
      time: offset,
      bpm: null,
      div: { type: "div", val: 4 },
    };

    for (let i = 0; i < chart.length; i++) {
      const absCell = chart[i];
      const nextAbsCell = chart[i + 1];

      const cellTime = getCellTime(absCell);
      if (cellTime === null) continue;

      const newBpm = O.isSome(absCell.timing) ? absCell.timing.value.bpm : null;
      const bpm = newBpm ?? state.bpm;
      if (bpm === null) throw new LowerError("BPM was null");

      // Compute div from the step size to the next cell
      let newDiv: PT.LenDef | null = null;
      if (nextAbsCell !== undefined) {
        const nextTime = getCellTime(nextAbsCell);
        if (nextTime !== null && nextTime > cellTime) {
          const computed = computeDiv(nextTime - cellTime, bpm);
          if (!lenDefEquals(computed, state.div)) newDiv = computed;
        }
      }

      const nc = O.toNullable(absCell.noteCollection);
      const noteCol: PT.Note[] = nc
        ? nc.contents.map((n) => lowerNote(n, nc.slides))
        : [];

      cells.push({
        ...(newBpm !== null ? { bpm: newBpm } : {}),
        ...(newDiv !== null ? { div: newDiv } : {}),
        noteCol,
      });

      state = { time: cellTime, bpm, div: newDiv ?? state.div };
    }

    return E.right(cells);
  } catch (error) {
    if (error instanceof LowerError) return E.left(error);
    throw error;
  }
};
