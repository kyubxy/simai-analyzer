import { parse } from "../../lib/parser";
import { pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";

export type Cell = {
  bpm?: number;
  div?: LenDef;
  noteCol: Array<Note>;
};

// TODO: defining non terminal cells like this feels really backwards
export type NonTerminalCell = Exclude<Cell, "E">;

export type Note = Tap | Hold | Slide | Touch | TouchHold;

// TODO: support for forced stars
export type Tap = {
  type: "tap";
  location: ButtonLoc;
  decorators: Array<Decorator>;
};

export type Hold = {
  type: "hold";
  location: ButtonLoc;
  decorators: Array<Decorator>;
  length: LenHold;
};

export type Slide = {
  type: "slide";
  decorators: Array<Decorator>;
  loc: ButtonLoc;
  style: "" | "@" | "?" | "!";
  slidePaths: Array<SlideHead>;
};

export type SlideHead =
  | {
      joinType: "variable";
      segments: Array<VariableSegment>;
    }
  | {
      joinType: "constant";
      segments: Array<ConstantSegment>;
      len: LenSlide;
      brk: string;
    };

export type ConstantSegment = {
  slideType: SlideType;
  verts: Array<ButtonLoc>;
};

export type VariableSegment = {
  slideType: SlideType;
  verts: Array<ButtonLoc>;
  len: LenSlide;
  brk: string;
};

export type LenSlide =
  | {
      type: "ratio";
      ratio: Ratio;
    }
  | {
      type: "delay-bpm-ratio";
      delay: number;
      bpm: number;
      ratio: Ratio;
    }
  | {
      type: "delay-ratio";
      delay: number;
      ratio: Ratio;
    }
  | {
      type: "delay-len";
      delay: number;
      len: number;
    }
  | {
      type: "bpm-ratio";
      bpm: number;
      ratio: Ratio;
    }
  | {
      type: "bpm-len";
      bpm: number;
      len: number;
    };

export type SlideType =
  | "pp"
  | "qq"
  | "p"
  | "q"
  | "-"
  | "<"
  | ">"
  | "^"
  | "v"
  | "s"
  | "z"
  | "w";

export type Decorator = "x" | "b" | "f";

export type LenHold =
  | {
      type: "ratio";
      ratio: Ratio;
    }
  | {
      type: "bpmratio";
      bpm: number;
      ratio: Ratio;
    }
  | {
      type: "delay";
      delay: number;
    };

export type LenDef =
  | {
      type: "div";
      val: number;
    }
  | {
      type: "sec";
      val: number;
    };

export type Touch = {
  type: "touch";
  decorators: Array<Decorator>;
  location: TouchLoc;
};

export type TouchHold = {
  type: "touchHold";
  decorators: Array<Decorator>;
  location: TouchLoc;
  length: LenHold;
};

export type Ratio = {
  div: number;
  num: number;
};

export type ButtonLoc = {
  button: number;
};

export type TouchLoc = {
  pos: number;
  frag: string;
};

export type ParseError = {
  errorMsg: string;
  cellId: number;
};

const preprocess = (chart: string) => chart.replace(/\s/g, "").split(",");

/**
 * Returns a list of eithers which resolve a cell represented as a parse tree
 *
 * @param chart A fragment of a chart
 * @returns The list of eithers
 */
export const mapParse = (chart: string): Array<E.Either<ParseError, Cell>> =>
  pipe(
    chart,
    preprocess,
    A.takeLeftWhile((rawCell) => rawCell !== "E"),
    A.mapWithIndex<string, E.Either<ParseError, Cell>>((cellId, cellImage) =>
      E.tryCatch(
        () => parse(cellImage) as Cell,
        (e) => ({
          cellId,
          errorMsg: JSON.stringify(e),
        }),
      ),
    ),
  );
