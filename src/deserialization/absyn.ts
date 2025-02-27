import * as PT from "./parse";
import * as AST from "../chart";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import { toAstConstant } from "./slides";

// we'll cut some corners with functional practices for
// these functions as they're rather trivial in nature
// could look into making them more functional later if i'm bothered

// these still maintain function purity

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

  if (result === undefined) throw new Error("Unidentified slide type");

  return result;
};

const parseButton = (loc: PT.ButtonLoc): AST.Button => {
  const b = loc.button;
  if (b < 1 || b > 8) throw new Error(`Invalid button [${b}].`);
  return (b - 1) as AST.Button; // buttons inside the parsing framework are zero-indexed
};

const parseSensor = (sens: PT.TouchLoc): AST.Sensor => {
  if (["A", "B", "D", "E"].includes(sens.frag)) {
    if (sens.pos < 1 || sens.pos > 8)
      throw new Error(`Invalid sensor [${sens.frag}${sens.pos}]`);
    return {
      index: (sens.pos - 1) as AST.Button,
      area: sens.frag as AST.SensorRegion,
    };
  } else if (sens.frag === "C") {
    if (sens.pos < 1 || sens.pos > 3)
      throw new Error(`Invalid sensor [${sens.frag}${sens.pos}]`);
    return {
      index: (sens.pos - 1) as AST.Button,
      area: sens.frag as AST.SensorRegion,
    };
  } else {
    throw new Error(
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
  // TODO: I think io-ts-types gives access to "branded" types that can
  // delegate these guards to type checks.
  if (divisions === 0) throw new Error("division cannot be 0");
  if (bpm === 0) throw new Error("bpm cannot be 0");
  if (divisions < 0) throw new Error("division must be greater than 0");
  if (bpm < 0) throw new Error("bpm must be greater than 0");
  return (60 / bpm) * (4 / divisions) * num;
}

type State = {
  // in practice, time should always be one step ahead of everything else in the state
  // this might be slightly confusing
  time: number;
  bpm: number | null;
  div: PT.LenDef;
};

type Composite = {
  noteCollections: O.Option<AST.NoteCollection>;
  timing: O.Option<AST.TimingMarker>;
  slides: ReadonlyArray<AST.Slide>;
};

export const genAbsyn = (tree: PT.ParseTree): AST.Chart =>
  pipe(
    tree.chart ?? [],
    A.reduce<PT.Elem, [AST.Chart, State]>(
      [
        { noteCollections: [], timing: [], slides: [] },
        { time: 0, bpm: null, div: { type: "div", val: 4 } },
      ],
      ([chartSlice, currentState], elem) => {
        const [parsedComposite, parsedState] = parseElem(elem, currentState);
        return [
          {
            noteCollections: pipe(
              parsedComposite.noteCollections,
              O.fold(
                () => chartSlice.noteCollections,
                (noteCol) => [...chartSlice.noteCollections, noteCol],
              ),
            ),
            timing: pipe(
              parsedComposite.timing,
              O.fold(
                () => chartSlice.timing,
                (timingMarker) => [...chartSlice.timing, timingMarker],
              ),
            ),
            slides: [...chartSlice.slides, ...parsedComposite.slides],
          },
          parsedState,
        ];
      },
    ),
  )[0];

const parseElem = (elem: PT.Elem, state: State): [Composite, State] => {
  const internalState = {
    bpm: elem.bpm ?? state.bpm,
    div: elem.len ?? state.div,
    time: state.time,
  };

  if (internalState.bpm === null) {
    throw new Error("BPM was null.");
  }

  return [
    // Composite
    {
      noteCollections: pipe(
        O.fromNullable(elem.noteCol),
        O.map((noteCol) => parseNoteCol(noteCol, internalState)),
      ),
      timing: pipe(
        O.fromNullable(elem.bpm),
        O.map((bpm) => ({
          time: internalState.time,
          bpm,
        })),
      ),
      slides: pipe(
        O.fromNullable(elem.noteCol),
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
  ...parseLaned(slide.ex, slide.brk, slide.loc),
  style: "star",
});

const parseTap = (tap: PT.Tap): AST.Tap => ({
  ...parseLaned(tap.ex, tap.brk, tap.loc),
  style:
    tap.star === "" ? "circle" : tap.star === "$" ? "star" : "starStationary",
});

const parseHold = (hold: PT.Hold, bpm: number): AST.Hold => ({
  ...parseLaned(hold.ex, hold.brk, hold.loc),
  duration: parseLenHold(hold.dur, bpm),
});

const parseTouch = (touch: PT.Touch): AST.Touch => ({
  ...parseUnlaned(touch.firework, touch.loc),
});

const parseTouchHold = (
  touchHold: PT.TouchHold,
  bpm: number,
): AST.TouchHold => ({
  ...parseUnlaned(touchHold.firework, touchHold.loc),
  duration: parseLenHold(touchHold.len, bpm),
});

const parseLaned = (ex: "x" | null, brk: "b" | null, loc: PT.ButtonLoc) => ({
  decorators: {
    ex: ex === "x",
    break: brk === "b",
  },
  location: parseButton(loc),
});

const parseUnlaned = (f: "f" | null, loc: PT.TouchLoc) => ({
  decorators: {
    hanabi: f === "f",
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
    switch (slide.type) {
      case "constant":
        const { delay, length } = parseLenSlide(slide.len, bpm);
        return {
          delay,
          slideSegments: generateSegments(head, slide.segments, length),
          decorators: {
            break: slide.brk === "b",
            ex: false,
          },
        };
      case "variable":
        break;
    }
    throw new Error();
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
    throw new Error("Too many buttons in vertex list.");
  }
};

/**
 * Recursively generates a list of `SlideSegment`s for use in `SlidePath`.
 *
 * @param head The button location of the slide's initial vertex
 * @param tail The rest of the slide's body
 * @returns A parsed list of `SlideSegment`s
 */
const generateSegments = (
  head: PT.ButtonLoc,
  tail: Array<PT.Segment>,
  duration: number,
): Array<AST.SlideSegment> =>
  tail.length === 0
    ? []
    : [
        {
          type: parseSlideType(tail.at(0).slideType),
          duration,
          vertices: parseVertices([head, ...tail.at(0).verts]),
        },
        ...generateSegments(tail.at(0).verts.at(-1), tail.slice(1), duration),
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
