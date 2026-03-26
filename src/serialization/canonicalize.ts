import * as PT from "../deserialization/parse";

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/**
 * Collapses runs of consecutive empty cells into the fewest equivalent cells.
 *
 * N empty cells at {D} satisfy: total_time = N * (240 / (bpm * D)).
 * Dividing numerator and denominator by gcd(N, D) gives an equivalent
 * representation with fewer cells at a coarser division:
 *   N/g cells at {D/g}.
 *
 * Example: 4 cells at {4} → gcd(4,4)=4 → 1 cell at {1}.
 * Example: 2 cells at {8} → gcd(2,8)=2 → 1 cell at {4}.
 *
 * Runs are broken by notes, BPM markers, or division changes mid-run.
 * Sec-type divisions are left unchanged.
 *
 * Inverse operation to the multi-step filler insertion in lower.ts.
 */
export const canonicalize = (cells: PT.Cell[]): PT.Cell[] => {
  const result: PT.Cell[] = [];
  let currentDiv: PT.LenDef = { type: "div", val: 4 };
  let i = 0;

  while (i < cells.length) {
    const cell = cells[i];

    if (cell.div !== undefined) currentDiv = cell.div;

    const isEmpty = cell.noteCol.length === 0 && cell.bpm === undefined;
    const canSimplify = isEmpty && currentDiv.type === "div";

    if (canSimplify) {
      // Collect run: subsequent cells must have no notes, no bpm, no div change
      let runLength = 1;
      while (i + runLength < cells.length) {
        const next = cells[i + runLength];
        if (
          next.noteCol.length === 0 &&
          next.bpm === undefined &&
          next.div === undefined
        ) {
          runLength++;
        } else {
          break;
        }
      }

      const D = currentDiv.val;
      const g = gcd(runLength, D);
      const newN = runLength / g;
      const newD = D / g;

      if (newN < runLength) {
        const newDivDef: PT.LenDef = { type: "div", val: newD };
        result.push({ ...cell, div: newDivDef });
        currentDiv = newDivDef;
        for (let j = 1; j < newN; j++) {
          result.push({ noteCol: [] });
        }
      } else {
        for (let j = 0; j < runLength; j++) {
          result.push(cells[i + j]);
        }
      }

      i += runLength;
    } else {
      result.push(cell);
      i++;
    }
  }

  return result;
};
