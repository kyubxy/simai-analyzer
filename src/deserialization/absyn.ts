import * as PT from "./parse";
import * as AST from "../chart";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";

export class AbsynError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

const parseSlideType = (slideType: PT.SlideType): AST.SlideType => {
  const result = {
    pp: "ppShape",
    qq: "qqShape",
    p: "pShape",
    q: "qShape",
    "-": "straight",
    "<": "cClockwise",
    ">": "clockwise",
    "^": "shortArc",
    v: "vShape",
    s: "sShape",
    z: "zShape",
    w: "fan",
    V: "grandV",
  }[slideType] as AST.SlideType;

  if (result === undefined) throw new AbsynError("Unidentified slide type");

  return result;
};

const parseButton = (loc: PT.ButtonLoc): AST.Button => {
  const b = loc.button;
  if (b < 1 || b > 8) throw new AbsynError(`Invalid button [${b}].`);
  return (b - 1) as AST.Button; // buttons inside the parsing framework are zero-indexed
};

const parseSensor = (sens: PT.TouchLoc): AST.Sensor => {
  if (sens.frag === "C") sens.pos ??= 1; // No one actually uses the Cn syntax and just writes C for the sensor.
  if (["A", "B", "D", "E"].includes(sens.frag)) {
    if (sens.pos < 1 || sens.pos > 8)
      throw new AbsynError(`Invalid sensor [${sens.frag}${sens.pos}]`);
    return {
      index: (sens.pos - 1) as AST.Button,
      area: sens.frag as AST.SensorRegion,
    };
  } else if (sens.frag === "C") {
    if (sens.pos < 1 || sens.pos > 3)
      throw new AbsynError(`Invalid sensor [${sens.frag}${sens.pos}]`);
    return {
      index: (sens.pos - 1) as AST.Button,
      area: sens.frag as AST.SensorRegion,
    };
  } else {
    throw new AbsynError(
      `Invalid sensor area [${sens.frag}] in [${sens.frag}${sens.pos}]`,
    );
  }
};

const getTimeDelta = (bpm: number, div: PT.LenDef): number => {
  switch (div.type) {
    case "sec":
      return div.val;
    case "div":
      return unquantise(div.val, 1, bpm);
  }
};

function unquantise(divisions: number, num: number, bpm: number): number {
  if (divisions === 0) throw new AbsynError("division cannot be 0");
  if (bpm === 0) throw new AbsynError("bpm cannot be 0");
  if (divisions < 0) throw new AbsynError("division must be greater than 0");
  if (bpm < 0) throw new AbsynError("bpm must be greater than 0");
  return (60 / bpm) * (4 / divisions) * num;
}

type State = {
  // in practice, time should always be one step ahead of everything else in the state
  // this might be slightly confusing
  time: number;
  bpm: number | null;
  div: PT.LenDef;
};

export type ParsedCell = {
  noteCollection: O.Option<AST.NoteCollection>;
  timing: O.Option<AST.TimingMarker>;
  slides: Array<AST.Slide>;
};

export type AoSChart = Array<ParsedCell>;

/**
 * Generates the chart as a AoS
 *
 * @param cells
 * @returns
 */
export const genAbsyn = (
  cells: Array<PT.Cell>,
): E.Either<AbsynError, AoSChart> => {
  try {
    return E.right(
      pipe(
        cells,
        A.reduce<PT.Cell, [AoSChart, State]>(
          [[], { time: 0, bpm: null, div: { type: "div", val: 4 } }],
          ([pCellAcc, currentState], cell) => {
            const [parsedCell, parsedState] = parseCell(cell, currentState);
            return [[...pCellAcc, parsedCell], parsedState];
          },
        ),
        ([chart, _]) => chart,
      ),
    );
  } catch (error) {
    return E.left(error);
  }
};

const parseCell = (
  cell: PT.NonTerminalCell,
  state: State,
): [ParsedCell, State] => {
  const internalState = {
    bpm: cell.bpm ?? state.bpm,
    div: cell.div ?? state.div,
    time: state.time,
  };

  if (internalState.bpm === null) {
    throw new AbsynError("BPM was null.");
  }

  return [
    // ParsedCell
    {
      noteCollection: pipe(
        O.fromNullable(cell.noteCol),
        O.map((noteCol) => parseNoteCol(noteCol, internalState)),
      ),
      timing: pipe(
        O.fromNullable(cell.bpm),
        O.map((bpm) => ({
          time: internalState.time,
          bpm,
        })),
      ),
      slides: pipe(
        O.fromNullable(cell.noteCol),
        O.fold(
          () => [],
          (noteCol) =>
            parseSlides(noteCol, internalState.time, internalState.bpm),
        ),
      ),
    },
    // State
    {
      ...internalState,
      time: state.time + getTimeDelta(internalState.bpm, internalState.div),
    },
  ];
};

const parseNoteCol = (
  noteCol: Array<PT.Note>,
  state: State,
): AST.NoteCollection => ({
  contents: noteCol.map(parseNote(state.bpm)),
  time: state.time,
});

const parseNote =
  (bpm: number) =>
  (note: PT.Note): AST.Note => {
    switch (note.type) {
      case "tap":
        return parseTap(note);
      case "hold":
        return parseHold(note, bpm);
      case "slide":
        return parseSlideTap(note);
      case "touch":
        return parseTouch(note);
      case "touchHold":
        return parseTouchHold(note, bpm);
    }
  };

const parseSlideTap = (slide: PT.Slide): AST.Tap => ({
  ...parseLaned(slide.decorators, slide.loc),
  style: "star",
  type: "tap",
});

const parseTap = (tap: PT.Tap): AST.Tap => ({
  ...parseLaned(tap.decorators, tap.location),
  style: "circle", // TODO: support for forced stars
  type: "tap",
});

const parseHold = (hold: PT.Hold, bpm: number): AST.Hold => ({
  ...parseLaned(hold.decorators, hold.location),
  duration: parseLenHold(hold.length, bpm),
  type: "hold",
});

const parseTouch = (touch: PT.Touch): AST.Touch => ({
  ...parseUnlaned(touch.decorators, touch.location),
  type: "touch",
});

const parseTouchHold = (
  touchHold: PT.TouchHold,
  bpm: number,
): AST.TouchHold => ({
  ...parseUnlaned(touchHold.decorators, touchHold.location),
  duration: parseLenHold(touchHold.length, bpm),
  type: "touchHold",
});

const parseLaned = (
  decorators: Array<PT.Decorator>,
  loc: PT.ButtonLoc,
): { decorators: { ex: boolean; break: boolean }; location: AST.Button } => ({
  decorators: {
    ex: decorators.includes("x"),
    break: decorators.includes("b"),
  },
  location: parseButton(loc),
});

const parseUnlaned = (
  decorators: Array<PT.Decorator>,
  loc: PT.TouchLoc,
): { decorators: { hanabi: boolean }; location: AST.Sensor } => ({
  decorators: {
    hanabi: decorators.includes("f"),
  },
  location: parseSensor(loc),
});

const parseLenHold = (dur: PT.LenHold, bpm: number): number => {
  switch (dur.type) {
    case "ratio":
      return unquantise(dur.ratio.div, dur.ratio.num, bpm);
    case "bpmratio":
      return unquantise(dur.ratio.div, dur.ratio.num, dur.bpm);
    case "delay":
      return dur.delay;
  }
};

/**
 * Processes the entire note collection and only parses the slides.
 *
 * @param noteCol
 * @param time
 * @param bpm
 * @returns The AST Slide object.
 */
const parseSlides = (
  noteCol: Array<PT.Note>,
  time: number,
  bpm: number,
): Array<AST.Slide> =>
  pipe(
    noteCol,
    A.filter((x) => x.type === "slide"),
    A.map((slide) => ({
      time,
      paths: slide.slidePaths.map(parseSlidePath(slide.loc, bpm)),
    })),
  );

const parseSlidePath =
  (head: PT.ButtonLoc, bpm: number) =>
  (slide: PT.SlideHead): AST.SlidePath => {
    switch (slide.joinType) {
      case "constant":
        const { delay, length } = parseLenSlide(slide.len, bpm);
        return {
          delay,
          slideSegments: generateSegmentsConstant(head, slide.segments, length),
          decorators: {
            break: slide.brk === "b",
            ex: false,
          },
        };
      case "variable":
        return {
          delay: parseLenSlide(slide.segments[0].len, bpm).delay,
          slideSegments: generateSegmentsVariable(head, slide.segments, bpm),
          decorators: {
            break: slide.segments.some((segment) => segment.brk),
            ex: false,
          },
        };
    }
  };

const parseVertices = (
  verts: Array<PT.ButtonLoc>,
): [AST.Button, AST.Button] | [AST.Button, AST.Button, AST.Button] => {
  if (verts.length === 3) {
    return [
      parseButton(verts[0]),
      parseButton(verts[1]),
      parseButton(verts[2]),
    ];
  } else if (verts.length === 2) {
    return [parseButton(verts[0]), parseButton(verts[1])];
  } else {
    throw new AbsynError("Too many buttons in vertex list.");
  }
};

const partialSegmentNoDuration = (
  head: PT.ButtonLoc,
  second: PT.ConstantSegment,
) => ({
  type: parseSlideType(second.slideType),
  vertices: parseVertices([head, ...second.verts]),
});

/**
 * Recursively generates a list of constant `SlideSegment`s for use in `SlidePath`.
 *
 * @param head The button location of the slide's initial vertex
 * @param tail The rest of the slide's body
 * @returns A parsed list of `SlideSegment`s
 */
const generateSegmentsConstant = (
  head: PT.ButtonLoc,
  tail: Array<PT.ConstantSegment>,
  duration: number,
): Array<AST.SlideSegment> =>
  tail.length === 0
    ? []
    : [
        {
          ...partialSegmentNoDuration(head, tail.at(0)),
          duration,
        },
        ...generateSegmentsConstant(
          tail.at(0).verts.at(-1),
          tail.slice(1),
          duration / tail.length,
        ),
      ];

/**
 * Recursively generates a list of variable `SlideSegment`s for use in `SlidePath`.
 *
 * @param head The button location of the slide's initial vertex
 * @param tail The rest of the slide's body
 * @returns A parsed list of `SlideSegment`s
 */
const generateSegmentsVariable = (
  head: PT.ButtonLoc,
  tail: Array<PT.VariableSegment>,
  bpm: number,
): Array<AST.SlideSegment> =>
  tail.length === 0
    ? []
    : [
        {
          ...partialSegmentNoDuration(head, tail.at(0)),
          duration: parseLenSlide(tail.at(0).len, bpm).length,
        },
        ...generateSegmentsVariable(
          tail.at(0).verts.at(-1),
          tail.slice(1),
          bpm,
        ),
      ];

const parseLenSlide = (
  lenSlide: PT.LenSlide,
  bpm: number,
): { delay: number; length: number } => {
  switch (lenSlide.type) {
    case "ratio":
      return {
        delay: unquantise(4, 1, bpm),
        length: unquantise(lenSlide.ratio.div, lenSlide.ratio.num, bpm),
      };
    case "bpm-len":
      return { delay: unquantise(4, 1, lenSlide.bpm), length: lenSlide.len };
    case "bpm-ratio":
      return {
        delay: unquantise(4, 1, lenSlide.bpm),
        length: unquantise(lenSlide.ratio.div, lenSlide.ratio.num, bpm),
      };
    case "delay-bpm-ratio":
      return {
        delay: lenSlide.delay,
        length: unquantise(
          lenSlide.ratio.div,
          lenSlide.ratio.num,
          lenSlide.bpm,
        ),
      };
    case "delay-len":
      return { delay: lenSlide.delay, length: lenSlide.len };
    case "delay-ratio":
      return {
        delay: lenSlide.delay,
        length: unquantise(lenSlide.ratio.div, lenSlide.ratio.num, bpm),
      };
  }
};
