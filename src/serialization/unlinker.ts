import * as O from "fp-ts/Option";
import * as A from "fp-ts/Array";
import * as N from "fp-ts/number";
import { pipe } from "fp-ts/function";
import { Chart, NoteCollection, Slide, TimingMarker } from "../chart";
import { AbsynCell, AoSChart } from "../deserialization/absyn";

/**
 * Converts a Chart (SoA) back to an AoSChart (AoS).
 *
 * Groups noteCollections, slides, and timing markers by their shared time
 * points into a flat sequence of AbsynCells, preserving ordering by time.
 * Inverse of linker.ts link().
 *
 * @param chart The linked SoA chart to flatten
 * @returns The chart as an unlinked, ordered array of AbsynCells
 */
export const unlink = (chart: Chart): AoSChart => {};
