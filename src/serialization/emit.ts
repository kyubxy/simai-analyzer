import * as PT from "../deserialization/parse";

export class EmitError extends Error {
  constructor(message?: string) {
    super(message);
  }
}
// ── Helpers ────────────────────────────────────────────────────────────────
const wrap = (wrapper: string, value: string | number) =>
  `${wrapper.at(0)}${value}${wrapper.at(1)}`;

// ── Primitives ────────────────────────────────────────────────────────────────

/** `(180)` */
const emitBpm = (bpm: number): string => wrap("()", bpm);

/** `{8}` / `{#0.5}` */
const emitDiv = (div: PT.LenDef): string =>
  wrap(
    "{}",
    (() => {
      switch (div.type) {
        case "div":
          return `${div.val}`;
        case "sec":
          return `#${div.val}`;
      }
    })(),
  );
/** `bx` etc. — concatenation of all decorator characters */
const emitDecorators = (decorators: Array<PT.Decorator>): string =>
  decorators.join("");

/** `1`–`8` */
const emitButtonLoc = (loc: PT.ButtonLoc): string => `${loc.button}`;

/** `A1`, `B3`, `C`, `C2`, … */
const emitTouchLoc = (loc: PT.TouchLoc): string =>
  loc.frag === "C"
    ? loc.pos == null || loc.pos === 1 ? "C" : `C${loc.pos}`
    : `${loc.frag}${loc.pos}`;

// ── Lengths ───────────────────────────────────────────────────────────────────

/** `4:1` */
const emitRatio = (ratio: PT.Ratio): string => `${ratio.div}:${ratio.num}`;

/**
 * `[4:1]` / `[120#4:1]` / `[#0.5]`
 *
 * Grammar: `"[" (ratio / bpm "#" ratio / "#" number) "]"`
 */
const emitLenHold = (len: PT.LenHold): string => {
  switch (len.type) {
    case "ratio":    return wrap("[]", emitRatio(len.ratio));
    case "bpmratio": return wrap("[]", `${len.bpm}#${emitRatio(len.ratio)}`);
    case "delay":    return wrap("[]", `#${len.delay}`);
  }
};

/**
 * `[4:1]` / `[120#4:1]` / `[0.5##4:1]` / `[0.5##120##4:1]` / `[120#0.5]` / `[0.5##0.5]`
 *
 * Grammar: `"[" (ratio / delay"##"bpm"##"ratio / delay"##"ratio / delay"##"len
 *               / bpm"#"ratio / bpm"#"len) "]"`
 */
const emitLenSlide = (len: PT.LenSlide): string => {
  switch (len.type) {
    case "ratio":           return wrap("[]", emitRatio(len.ratio));
    case "delay-bpm-ratio": return wrap("[]", `${len.delay}##${len.bpm}##${emitRatio(len.ratio)}`);
    case "delay-ratio":     return wrap("[]", `${len.delay}##${emitRatio(len.ratio)}`);
    case "delay-len":       return wrap("[]", `${len.delay}##${len.len}`);
    case "bpm-ratio":       return wrap("[]", `${len.bpm}#${emitRatio(len.ratio)}`);
    case "bpm-len":         return wrap("[]", `${len.bpm}#${len.len}`);
  }
};

// ── Slides ────────────────────────────────────────────────────────────────────

/**
 * Emits one slide tail segment (type + tailVerts), without its length.
 * e.g. `^5`, `V35`, `-8`
 *
 * For grand-V (`V`) the two tail vertices are emitted directly.
 * All other types emit their single tail vertex.
 */
const emitSlideTail = (
  slideType: PT.SlideType,
  tailVerts: Array<PT.ButtonLoc>,
): string =>
  slideType === "V"
    ? `V${tailVerts.map(emitButtonLoc).join("")}`
    : `${slideType}${emitButtonLoc(tailVerts[0])}`;

/**
 * Emits one full slide head (constant or variable).
 *
 * - constant: `slideTail+ brk? lenSlide brk?`  e.g. `^5[4:1]`
 * - variable: `(slideTail brk? lenSlide brk?)+`  e.g. `^5[4:1]-3[4:1]`
 */
const emitSlideHead = (head: PT.SlideHead): string => {
  switch (head.joinType) {
    case "constant":
      return (
        head.segments.map((s) => emitSlideTail(s.slideType, s.tailVerts)).join("") +
        head.brk +
        emitLenSlide(head.len)
      );
    case "variable":
      return head.segments
        .map((s) => emitSlideTail(s.slideType, s.tailVerts) + s.brk + emitLenSlide(s.len))
        .join("");
  }
};

// ── Notes ─────────────────────────────────────────────────────────────────────

/** `1b`, `3x`, `5` */
const emitTap = (tap: PT.Tap): string =>
  emitButtonLoc(tap.location) + emitDecorators(tap.decorators);

/**
 * `1h[4:1]`, `1bh[4:1]`
 *
 * Grammar: `buttonLoc holdDecorators lenHold decorators`
 * `holdDecorators = decorators "h" decorators`
 */
const emitHold = (hold: PT.Hold): string =>
  emitButtonLoc(hold.location) + emitDecorators(hold.decorators) + "h" + emitLenHold(hold.length);

/**
 * `1-5[4:1]`, `1b^3[4:1]*-5[4:1]`
 *
 * Grammar: `buttonLoc style? decorators slideHead ("*" slideHead)*`
 */
const emitSlide = (slide: PT.Slide): string =>
  emitButtonLoc(slide.location) +
  (slide.style ?? "") +
  emitDecorators(slide.decorators) +
  slide.slidePaths.map(emitSlideHead).join("*");

/** `A1`, `A1f`, `C` */
const emitTouch = (touch: PT.Touch): string =>
  emitTouchLoc(touch.location) + (touch.decorators.includes("f") ? "f" : "");

/**
 * `A1h[4:1]`, `A1fh[4:1]`
 *
 * Grammar: `touchLoc touchHoldDecorators lenHold`
 * `touchHoldDecorators = "f"? "h" "f"?`
 */
const emitTouchHold = (touchHold: PT.TouchHold): string =>
  emitTouchLoc(touchHold.location) +
  (touchHold.decorators.includes("f") ? "f" : "") +
  "h" +
  emitLenHold(touchHold.length);

const emitNote = (note: PT.Note): string => {
  switch (note.type) {
    case "tap":       return emitTap(note);
    case "hold":      return emitHold(note);
    case "slide":     return emitSlide(note);
    case "touch":     return emitTouch(note);
    case "touchHold": return emitTouchHold(note);
  }
};

/** Notes joined by `/`. e.g. `1b/2` */
const emitNoteCol = (noteCol: Array<PT.Note>): string =>
  noteCol.map(emitNote).join("/");

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Emits a single Cell as its simai text representation.
 * e.g. `(180){8}1b` for a break tap on button 1 at 180 BPM, 8th division.
 *
 * @param cell The cell to emit
 * @returns The simai text for this cell (without trailing comma)
 */
export const emitCell = (cell: PT.Cell): string =>
  (cell.bpm != null ? emitBpm(cell.bpm) : "") +
  (cell.div != null ? emitDiv(cell.div) : "") +
  emitNoteCol(cell.noteCol ?? []);

/**
 * Emits an array of Cells as a complete simai chart fragment.
 *
 * Joins the cells with commas and appends the `E` terminator.
 * Inverse of parse.ts mapParse().
 *
 * @param cells The cells to emit
 * @returns The simai chart string
 */
export const emit = (cells: Array<PT.Cell>): string =>
  cells.map(emitCell).join(",") + ",E,";
