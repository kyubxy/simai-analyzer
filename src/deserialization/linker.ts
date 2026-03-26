import { pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { Chart, NoteCollection, TimingMarker } from "../chart";
import { AoSChart } from "./absyn";

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
 * Converts the AoS to a SoA.
 *
 * @param cells
 * @returns
 */
export const link = (cells: AoSChart): Chart => {
  const noteCollections: NoteCollection[] = [];
  for (const cell of cells) {
    if (O.isNone(cell.noteCollection)) continue;
    noteCollections.push(cell.noteCollection.value);
  }

  return {
    noteCollections,
    timing: pipe(
      cells,
      A.reduce([] as TimingMarker[], (acc, cell) =>
        concatOption(acc, cell.timing),
      ),
    ),
  };
};
