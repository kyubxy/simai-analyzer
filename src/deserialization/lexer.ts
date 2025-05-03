import * as E from "fp-ts/Either";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";

type TimingMarker = {
  division: number;
};

type BpmMarker = {
  bpm: number;
};

type Marker = TimingMarker & BpmMarker;



export const tokenize = (cells: Array<string>) => pipe(cells, A.map(cell));

const cell = (str: string) => pipe(str, markers, E.map(noteCol));

const markers = (str: string) => E.right("");

const noteCol = (str: string) => E.right("");
