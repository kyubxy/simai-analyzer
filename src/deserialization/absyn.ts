import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as PT from "./parse";
import * as AST from "../chart";

/**
 * Helpers
 */

/**
 * Maps a function that sends A to an either resolving to B onto a list
 * of A and returns another either which resolves to B. ie. it tries to map
 * a function onto a list and returns the left value when one of the elements is a left value.
 * @param f The function to map onto the list
 * @returns A list with f applied to all of the elements or the left value.
 */
const mapEithersInList = <A, B, L>(
  f: (a: A) => E.Either<L, B>,
  as: ReadonlyArray<A>,
): E.Either<L, Array<B>> =>
  pipe(
    as,
    A.reduce<A, E.Either<L, Array<B>>>(E.right([]), (bs, a) =>
      pipe(
        bs,
        E.fold(
          (l) => E.left(l),
          (as) =>
            pipe(
              f(a),
              E.fold(
                (l) => E.left(l),
                (ma) => E.right([...as, ma]),
              ),
            ),
        ),
      ),
    ),
  );

/**
 * Errors
 */

type AbsynError = {
  message: string;
};

export const absynErrorToJsError = (absynError: AbsynError) =>
  new Error(absynError.message);

const invalidCharError = (expected, actual): AbsynError => ({
  message: `Expected character(s) [${expected}] here, instead got [${actual}].`,
});

type EE<T> = E.Either<AbsynError, T>;

/**
 * Absyn generator
 */

/**
 * Converts the structure from the peggy parser (parse tree) to
 * the desired in-memory format (abstract syntax tree)
 * @param pt Parse tree
 * @returns Abstract syntax tree
 */
export const genAbsyn = (pt: PT.ParseTree) =>
  pt.chart
  pipe(
    E.Do,
    //E.bind("noteCollections", () => mapEithersInList(parseElem, pt.chart)),
    E.bind("noteCollections", () =>
    ),
    E.bind("slides", () => E.right([])), // TODO:
    E.bind("timing", () => E.right([])), // TODO:
  );

const parseElem = (elem: PT.Elem, time: number): EE<AST.NoteCollection> =>
  pipe(
    E.Do,
    E.bind("contents", () => mapEithersInList(parseNote, elem.noteCol)),
    E.bind("time", () => E.right(time)),
  );

const parseNote = (n: PT.Note): EE<AST.Note> => {
  switch (n.noteType) {
    case "tap":
      return parseTap(n);
    case "hold":
      break;
  }
};

const parseTap = (t: PT.Tap): EE<AST.Tap> =>
  pipe(
    E.Do,
    E.bind("location", () => parseButtonLoc(t.loc)),
    E.bind("decorators", () => parseDecorators(t)),
    E.bind("style", () => parseStyle(t.star)),
  );

const parseButtonLoc = (loc: PT.ButtonLoc): EE<AST.Button> =>
  loc.button >= 1 && loc.button <= 8
    ? E.right((loc.button - 1) as AST.Button) // buttons are zero indexed
    : E.left({
        message:
          "Button indices in note collections should be between 1 and 8 " +
          `inclusive, found button with out of bounds index [${loc.button}].`,
      });

const parseDecorators = (n: PT.Note) =>
  E.right({
    ex: n.ex === "x",
    break: n.brk === "b",
  });

const parseStyle = (style: string): E.Either<AbsynError, AST.TapStyle> => {
  switch (style) {
    case "":
      return E.right("circle");
    case "$":
      return E.right("star");
    case "$$":
      return E.right("starStationary");
    default:
      return E.left(invalidCharError(" , $, $$", style));
  }
};
