import * as PT from "../deserialization/parse";

export class EmitError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

/**
 * Emits a single Cell as its simai text representation.
 * e.g. `(180)(8)1b,` for a break tap on button 1 at 180 BPM, 8th division.
 *
 * @param cell The cell to emit
 * @returns The simai text for this cell
 */
export const emitCell = (cell: PT.Cell): string => {
  throw new Error("Not implemented");
};

/**
 * Emits an array of Cells as a complete simai chart fragment.
 *
 * Joins the cells with commas and appends the `E` terminator.
 * Inverse of parse.ts mapParse().
 *
 * @param cells The cells to emit
 * @returns The simai chart string
 */
export const emit = (cells: Array<PT.Cell>): string => {
  throw new Error("Not implemented");
};
