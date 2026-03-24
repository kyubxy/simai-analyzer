import * as O from "fp-ts/Option";
import * as A from "fp-ts/Array";
import * as N from "fp-ts/number";
import { pipe } from "fp-ts/function";
import { Chart, NoteCollection, Slide, TimingMarker } from "../chart";
import { AbsynCell, AoSChart } from "../deserialization/absyn";

/**
 * Converts a Chart (SoA) back to an AoSChart (AoS).
 *
 * Builds O(1) lookup maps for noteCollections and timing, then sorts the
 * deduplicated set of time points and maps each to an AbsynCell.
 * Inverse of linker.ts link().
 *
 * @param chart The linked SoA chart to flatten
 * @returns The chart as an unlinked, ordered array of AbsynCells
 */
export const unlink = (chart: Chart): AoSChart => {
  const noteColAt = new Map<number, NoteCollection>(
    chart.noteCollections.map((nc) => [nc.time, nc]),
  );
  const timingAt = new Map<number, TimingMarker>(
    chart.timing.map((tm) => [tm.time, tm]),
  );
  const slidesAt = chart.slides.reduce(
    (m, sl) => m.set(sl.time, [...(m.get(sl.time) ?? []), sl]),
    new Map<number, Slide[]>(),
  );

  return pipe(
    [
      ...chart.noteCollections.map((nc) => nc.time),
      ...chart.slides.map((sl) => sl.time),
      ...chart.timing.map((tm) => tm.time),
    ],
    A.uniq(N.Eq),
    A.sort(N.Ord),
    A.map(
      (t): AbsynCell => ({
        noteCollection: O.fromNullable(noteColAt.get(t)),
        timing: O.fromNullable(timingAt.get(t)),
        slides: slidesAt.get(t) ?? [],
      }),
    ),
  );
};
