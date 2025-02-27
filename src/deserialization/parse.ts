export type ParseTree = {
  chart: Array<Elem> | null;
};

export type Elem = {
  bpm: number | null;
  len: LenDef | null;
  noteCol: Array<Note> | null;
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

export type Note = Tap | Hold | Touch | TouchHold | Slide;

export type Tap = {
  type: "tap";
  loc: ButtonLoc;
  brk: "b" | null;
  ex: "x" | null;
  star: "" | "$" | "$$";
};

export type Hold = {
  type: "hold";
  loc: ButtonLoc;
  brk: "b" | null;
  ex: "x" | null;
  dur: LenHold;
};

export type Slide = {
  type: "slide";
  brk: "b" | null;
  ex: "x" | null;
  loc: ButtonLoc;
  style: "" | "@" | "?" | "!";
  slidePaths: Array<SlideHead>;
};

export type SlideHead =
  | {
      type: "variable";
      segments: Array<Segment & { type: "variable" }>;
    }
  | {
      type: "constant";
      segments: Array<Segment & { type: "constant" }>;
      len: LenSlide;
      brk: "b" | null;
    };

export type Segment = {
  slideType: SlideType;
  verts: Array<ButtonLoc>;
} & (
  | {
      type: "variable";
      len: LenSlide;
      brk: "b" | null;
    }
  | {
      type: "constant";
    }
);

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

export type Ratio = {
  div: number;
  num: number;
};

export type Touch = {
  type: "touch";
  loc: TouchLoc;
  firework: "f" | null;
};

export type TouchHold = {
  type: "touchHold";
  loc: TouchLoc;
  firework: "f" | null;
  len: LenHold;
};

export type ButtonLoc = {
  button: number;
};

export type TouchLoc = {
  pos: number;
  frag: string;
};
