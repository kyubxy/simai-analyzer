import * as PT from "../deserialization/parse";
import * as E from "fp-ts/Either";
import { AoSChart } from "../deserialization/absyn";

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
  throw new Error("Not implemented");
};
