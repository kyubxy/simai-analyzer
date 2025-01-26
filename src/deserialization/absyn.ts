import * as PT from "./parse";
import * as AST from "../chart";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";

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
          time: state.time,
          bpm,
        })),
      ),
      slides: pipe(
        O.fromNullable(elem.noteCol),
        O.fold(
          () => [],
          (noteCol) => parseSlides(noteCol, internalState.time),
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
    }
  };

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

const parseSlides = (noteCol: Array<PT.Note>, time: number): Array<AST.Slide> =>
  noteCol
    .filter((x) => x.type === "slide")
    .map((slide) => ({
      time,
      paths: slide.slidePaths.map(parseSlidePath),
    }));

const parseSlidePath = (path: PT.SlideHead) => {
  switch (path.type) {
    case "constant":
      return parseConstSlidePath(path);
    case "variable":
      return parseVariableSlidePath(path);
  }
};

const parseConstSlidePath = (path: PT.SlideHead): AST.SlidePath => {
  throw new Error();
};

const parseVariableSlidePath = (path: PT.SlideHead): AST.SlidePath => {
  throw new Error();
};

// we'll cut some corners with functional practices for
// these functions as they're rather trivial to write
// could look into making them more functional later if i'm bothered

// these still maintain function purity

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
  // TODO: I think io-ts gives access to "branded" types that can
  // delegate these guards to type checks.
  if (divisions === 0) throw new Error("division cannot be 0");
  if (bpm === 0) throw new Error("bpm cannot be 0");
  if (divisions < 0) throw new Error("division must be greater than 0");
  if (bpm < 0) throw new Error("bpm must be greater than 0");
  return (60 / bpm) * (4 / divisions) * num;
}
