import * as E from "fp-ts/Either";
import * as S from "fp-ts/Separated";

/**
 * Partitions a list of eithers, preserving the "structure" of the list of `as` and moving lefts to
 * a separate list of `bs`
 *
 * Example:
 *
 * ```
 * partitionAndPreserveRights([E.right(3), E.left("error"), E.right(5)], -1) ===
 * [["error"], [3, -1, 5]]
 * ```
 *
 * @param eithers The list of eithers to partition
 * @param nothingB A default value of B to replace left values (A) with
 * @returns A tuple with the list of lefts as the first element and the (preserved) list of rights as the second
 */
export const partitionAndPreserveRights =
  <E, A>(nothingB: () => A) =>
  (eithers: Array<E.Either<E, A>>): S.Separated<Array<E>, Array<A>> => {
    const left: Array<E> = []; // as
    const right: Array<A> = []; // bs
    for (const either of eithers) {
      right.push(E.isRight(either) ? either.right : nothingB());
      if (E.isLeft(either)) left.push(either.left);
    }
    return { left, right };
  };

