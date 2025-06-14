import { pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { Chart, NoteCollection, Slide, TimingMarker, Tap, _Tap, _Slide } from "../chart";
import { AoSChart, AbsynCell } from "./absyn";

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

// NOTE: this function uses side effects internally to maintain reference equivalence

/**
 * Converts the AoS to a SoA and links struct elements.
 *
 * Assigns internal cross references between different object types. ie. NoteCollections have
 * pointer references to their slides etc.
 *
 * @param cells
 * @returns
 */
export const link = (cells: AoSChart): Chart => {
  const noteCollections: NoteCollection[] = [];
  for (const cell of cells) {
    if (O.isNone(cell.noteCollection)) continue;
    const noteCol = cell.noteCollection.value;
    noteCol.contents.forEach((note) => {
      // assign parent note collection
      note.parent = noteCol;

      // assign slide reference (assign both ways)
      if (note.type === "tap" && (note as _Tap)._ptId !== undefined) {
        const slide = cell.slides.find((sl) => (sl as _Slide)._ptId === (note as _Tap)._ptId);
        note.slide = slide;
        if (slide !== undefined)
          slide.tap = note as Tap;
      }
    });
    noteCollections.push(noteCol);
  }

  // Use pipe for slides and timing as before
  return {
    noteCollections,
    slides: cells.flatMap(({ slides }) => slides),
    timing: pipe(
      cells,
      A.reduce([] as TimingMarker[], (acc, cell) =>
        concatOption(acc, cell.timing),
      ),
    ),
  };
};
