import { pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { Chart } from "../chart";
import { AoSChart, ParsedCell } from "./absyn";

// TODO: experiment whether passing array directly still works.
// spreading might be slowing things down unnecessarily

const concatOption = <A>(as: Array<A>, ma: O.Option<A>): Array<A> =>
  pipe(
    ma,
    O.fold(
      () => [...as],
      (a) => [...as, a],
    ),
  );

/**
 * Converts the AoS to a SoA
 *
 * @param cells
 * @returns
 */
export const explode = (cells: AoSChart): Chart =>
  pipe(
    cells,
    A.reduce<ParsedCell, Chart>(
      {
        noteCollections: [],
        slides: [],
        timing: [],
      },
      (acc, cell) => ({
        noteCollections: concatOption(acc.noteCollections, cell.noteCollection),
        slides: [...acc.slides, ...cell.slides],
        timing: concatOption(acc.timing, cell.timing),
      }),
    ),
  );
