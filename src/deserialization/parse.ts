import * as t from "io-ts";

// parsing already validates button locations are between 1-9
const buttonLoc = t.readonly(
  t.strict({
    button: t.number,
  })
)
export type ButtonLoc = t.TypeOf<typeof buttonLoc>;

export const touchLoc = t.readonly(
  t.strict({
    pos: t.string,
    frag: t.string,
  }),
);
export type Loc = t.TypeOf<typeof touchLoc>;

const ratio = t.readonly(
  t.strict({
    div: t.number,
    num: t.number,
  }),
);

const lenHold = t.union([
  t.readonly(
    t.strict({
      ratio: t.number,
    }),
  ),
  t.readonly(
    t.strict({
      bpm: t.number,
      ratio: ratio,
    }),
  ),
  t.readonly(
    t.strict({
      delay: t.number, // seconds
    }),
  ),
]);

const lenSlide = t.union([
  t.readonly(
    t.strict({
      ratio: ratio,
    }),
  ),
  t.readonly(
    t.strict({
      delay: t.number,
      bpm: t.number,
      ratio: ratio,
    }),
  ),
  t.readonly(
    t.strict({
      delay: t.number,
      ratio: ratio,
    }),
  ),
  t.readonly(
    t.strict({
      delay: t.number,
      len: t.number,
    }),
  ),
  t.readonly(
    t.strict({
      bpm: t.number,
      ratio: t.number,
    }),
  ),
  t.readonly(
    t.strict({
      bpm: t.number,
      len: t.number,
    }),
  ),
]);

const slideType = t.union([
  t.literal("pp"),
  t.literal("qq"),
  t.literal("p"),
  t.literal("q"),
  t.literal("-"),
  t.literal("<"),
  t.literal(">"),
  t.literal("^"),
  t.literal("v"),
  t.literal("s"),
  t.literal("z"),
  t.literal("w"),
]);

const touch = t.readonly(
  t.strict({
    noteType: t.literal("touch"),
    loc: touchLoc,
    firework: t.literal("f"),
  }),
);

const touchHold = t.readonly(
  t.strict({
    noteType: t.literal("touchHold"),
    loc: touchLoc,
    firework: t.literal("f"),
    len: lenHold,
  }),
);

const slideTail = t.readonly(
  t.strict({
    type: slideType,
    verts: t.array(buttonLoc),
  }),
);

export const slideHead = t.union([
  t.readonly(
    t.strict({
      timing: t.literal("variable"),
      segments: t.array(
        t.intersection([
          slideTail,
          t.readonly(
            t.strict({
              len: lenSlide,
              brk: t.string,
            }),
          ),
        ]),
      ),
    }),
  ),
  t.readonly(
    t.strict({
      timing: t.literal("constant"),
      segments: t.array(slideTail),
      len: lenSlide,
      brk: t.string,
    }),
  ),
]);
export type SlideHead = t.TypeOf<typeof slideHead>;

const slideBody = t.union([slideHead, slideTail]);

export const slide = t.readonly(
  t.strict({
    noteType: t.literal("slide"),
    brk: t.string,
    ex: t.string,
    loc: touchLoc,
    style: t.union([t.literal("@"), t.literal("?"), t.literal("!")]),
    slidePaths: t.array(slideBody),
  }),
);
export type Slide = t.TypeOf<typeof slide>;

export const hold = t.readonly(
  t.strict({
    noteType: t.literal("hold"),
    loc: touchLoc,
    brk: t.string,
    ex: t.string,
    dur: lenHold,
  }),
);
export type Hold = t.TypeOf<typeof hold>;

export const tap = t.readonly(
  t.strict({
    noteType: t.literal("tap"),
    loc: buttonLoc,
    brk: t.union([t.string, t.null]),
    ex: t.union([t.string, t.null]),
    star: t.string,
  }),
);
export type Tap = t.TypeOf<typeof tap>;

const note = t.union([tap, hold]);
export type Note = t.TypeOf<typeof note>;

export const lenDef = t.union([
  t.readonly(
    t.strict({
      div: t.number,
    }),
  ),
  t.readonly(
    t.strict({
      sec: t.number,
    }),
  ),
]);
export type Len = t.TypeOf<typeof lenDef>;

export const elem = t.readonly(
  t.strict({
    bpm: t.union([t.number, t.null]),
    len: t.union([lenDef, t.null]),
    noteCol: t.union([t.readonlyArray(note), t.null]),
  }),
);
export type Elem = t.TypeOf<typeof elem>;

export const parseTree = t.readonly(
  t.strict({
    chart: t.union([t.readonlyArray(elem), t.null]),
  }),
);
export type ParseTree = t.TypeOf<typeof parseTree>;

export type ParseError = Error;
