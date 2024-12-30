import * as E from "fp-ts/Either";
import { Chart, MaiChart } from "./chart";
import { absynErrorToJsError, genAbsyn } from "./deserialization/absyn";
import { parseTree } from "./deserialization/parse";
import { parse } from "../lib/parser";
import { PathReporter } from "io-ts/lib/PathReporter";

/**
 * We will opt out of exposing any fp-ts structures like eithers in any front facing
 * functions like the below directly to make the code more pleasant to work with in
 * non-functional codebases. Serialisation/deserialisation functions will instead either
 * return the chart or throw errors.
 */

export const deserializeChart = (data: string): Chart => {
  // PathReporter gives us no easy way to report errors
  // in a mapLeft, we'll avoid pipes to make handling
  // errors slightly easier in this case.
  const tree = parse(data);
  const typedTree = parseTree.decode(tree);
  const treeErrors = PathReporter.report(typedTree);
  if (E.isLeft(typedTree)) {
    throw new Error(
      treeErrors.reduce(
        (acc, val) =>
          `Something went wrong went adding types to the parse tree.\n\n${acc}\n${val}`,
      ),
    );
  }

  const absyn = genAbsyn(typedTree.right);
  if (E.isLeft(absyn)) {
    throw absynErrorToJsError(absyn.left);
  }

  return absyn.right;
};

// TODO:
export const serializeChart = (chart: MaiChart) => new Error();
