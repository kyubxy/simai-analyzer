import { identity, pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { Chart, NoteCollection, Slide, TimingMarker } from "../chart";
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

// NOTE: this function uses side effects to maintain reference equivalence

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
    noteCol.contents.forEach((note) => (note.parent = noteCol));
    noteCol.slides = cell.slides.length > 0 ? cell.slides : undefined;
    noteCollections.push(noteCol);
  }

  let concatSlides: Slide[] = [];
  for (const cell of cells) {
    const slides = cell.slides;
    slides.forEach((slide) => {
      const noteCol = cell.noteCollection;
      if (O.isSome(noteCol)) slide.noteCol = noteCol.value;
    });
    concatSlides = [...concatSlides, ...slides]
  }

  // Use pipe for slides and timing as before
  return {
    noteCollections,
    slides: concatSlides,
    timing: pipe(
      cells,
      A.reduce([] as TimingMarker[], (acc, cell) =>
        concatOption(acc, cell.timing),
      ),
    ),
  };
};

/*


  const noteCollections = [];
  for (const cell of cells) {
    if (O.isNone(cell.noteCollection)) continue;
    const noteCol = cell.noteCollection.value;
    noteCol.contents.forEach((note) => (note.parent = noteCol));
    noteCol.slides = cell.slides.length > 0 ? cell.slides : undefined;
    cell.slides.forEach((slide) => (slide.noteCol = noteCol));
    noteCollections.push(cell.noteCollection);
  }
  return {
    slides: pipe(
      cells,
      A.flatMap(({ slides }) => slides),
    ),
    timing: pipe(
      cells,
      A.reduce([], (acc, { timing }) =>
        pipe(
          timing,
          O.fold(
            () => acc,
            (x) => [...acc, x],
          ),
        ),
      ),
    ),
    noteCollections,
  };
};


  pipe(
    cells,
    A.reduce<ParsedCell, Chart>(
      {
        noteCollections: [],
        slides: [],
        timing: [],
      },
      (acc, cell) => ({
        noteCollections: pipe(
          cell.noteCollection,
          O.map((noteCol) => {
            // references require side effects
            noteCol.contents.forEach((note) => (note.parent = noteCol));
            noteCol.slides = cell.slides.length > 0 ? cell.slides : undefined;
            return noteCol;
          }),
          O.fold(
            () => acc.noteCollections,
            (newNoteCol) => [...acc.noteCollections, newNoteCol],
          ),
        ),
        slides: [
          ...acc.slides,
          ...pipe(
            cell.slides,
            A.map((slide) => ({
              ...slide,
              noteCol: pipe(
                cell.noteCollection,
                O.fold(() => undefined, identity),
              ),
            })),
          ),
        ],
        timing: concatOption(acc.timing, cell.timing),
      }),
    ),
  );




  pipe(
    cells,
    A.reduce<ParsedCell, Chart>(
      {
        noteCollections: [],
        slides: [],
        timing: [],
      },
      (acc, cell) => ({
        noteCollections: pipe(
          cell.noteCollection,
          O.map((noteCol) => {
            const contents = noteCol.contents.map((note) => ({
              ...note,
              parent: noteCol,
            }));
            return {
              ...noteCol,
              contents,
              slides: cell.slides.length > 0 ? cell.slides : undefined,
            };
          }),
          O.fold(
            () => acc.noteCollections,
            (newNoteCol) => [...acc.noteCollections, newNoteCol],
          ),
        ),
        slides: [
          ...acc.slides,
          ...pipe(
            cell.slides,
            A.map((slide) => ({
              ...slide,
              noteCol: pipe(
                cell.noteCollection,
                O.fold(() => undefined, identity),
              ),
            })),
          ),
        ],
        timing: concatOption(acc.timing, cell.timing),
      }),
    ),
  );
  */
