import { pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";

/**
 * A raw key-value representation of the parsed maidata.txt
 */
export type RawMaidata = { [key: string]: string };

/**
 * A typed maidata.txt representation
 */
export type MaidataFile = {
  title: string;
  artist: string;
  author: string;
  offset: number;
  levels: { [key: string]: Level };
  raw: RawMaidata;
};

/**
 * A single "difficulty" of the chart spread.
 */
export type Level = {
  chart?: Chart;
  level?: string;
};

/**
 * The actual fumen that comprises the chart. Charts can most notably be split
 * into a list of noteCollections and slides, in practice, these are often handled and
 * rendered by different systems.
 */
export type Chart = {
  noteCollections: Array<NoteCollection>;
  slides: Array<Slide>;
  timing: Array<TimingMarker>;
};

/**
 * Sets the bpm of a chart at a timing point. Represents {x} in simai.
 */
export type TimingMarker = {
  time: number;
  bpm: number;
};

/**
 * The first "layer" of a chart. `NoteCollection`s contain all notes (excluding slides)
 * to hit the judgement line at a point in time.
 */
export type NoteCollection = {
  contents: Array<Note>;
  time: number;
};

/**
 * "Anything that makes a sound when you hit it". All game objects except for slides.
 */
export type Note = Tap | Hold | Touch | TouchHold;

type NoteCollectionChild = {
  parent: NoteCollection;
};

/**
 * Touches and touch holds. Slides are excluded from this category.
 */
export type UnlanedNote = NoteCollectionChild & {
  location: Sensor;
  decorators: TouchDecorator;
};

/**
 * Touch note.
 */
export type Touch = UnlanedNote & {
  type: "touch";
};

/**
 * Touch hold
 */
export type TouchHold = UnlanedNote & {
  type: "touchHold";
  duration: number;
};

/**
 * Anything that is fixed to a lane.
 */
export type LanedNote = NoteCollectionChild & {
  decorators: NoteDecorator;
  location: Button;
};

/**
 * Tap note
 */
export type Tap = LanedNote & {
  type: "tap";
  style: TapStyle;
  slide?: Slide;
};

export type _Tap = Tap & {
  _ptId?: number;
};

/**
 * Hold note
 */
export type Hold = LanedNote & {
  type: "hold";
  duration: number;
};

// yeah i give up documenting these exported members, i'll do the rest later

export type TapStyle = "circle" | "star" | "starStationary";

export type Slide = {
  time: number;
  paths: Array<SlidePath>;
  tap?: Tap;
};

export type _Slide = Slide & {
  _ptId?: number;
};

export type SlidePath = {
  delay: number;
  slideSegments: Array<SlideSegment>;
  decorators: NoteDecorator; // we'll keep support for ex slides for now to remain consistent
};

export type NoteDecorator = {
  ex: boolean;
  break: boolean;
};

export type TouchDecorator = {
  hanabi: boolean;
};

export type SlideSegment = {
  type: SlideType;
  duration: number;
  vertices: [Button, Button] | [Button, Button, Button]; // we use the second case for grand V slides with 3 vertices
};

export type Button = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Sensor = { index: Button; area: SensorRegion };

export type SensorRegion = "A" | "B" | "C" | "D" | "E";

export type SlideType =
  | "straight"
  | "shortArc"
  | "vShape"
  | "cClockwise"
  | "clockwise"
  | "grandV"
  | "pShape"
  | "qShape"
  | "ppShape"
  | "qqShape"
  | "sShape"
  | "zShape"
  | "fan";

export const noteDuration = (note: Note) => {
  switch (note.type) {
    case "tap":
    case "touch":
      return 0;
    case "hold":
    case "touchHold":
      return note.duration;
  }
};

export const noteTime = (note: Note) => note.parent.time;

export type TapType = "star" | "starDouble" | "tap";

export const tapType = (tap: Tap): TapType => {
  return tap.style === "circle"
    ? "tap"
    : tap.slide.paths.length === 1
      ? "star"
      : "starDouble";
};

export const isStar = (tap: Tap) => tapType(tap) !== "tap";

/**
 * Given a full slide path, computes the total duration of the longest
 * slide path. The longest duration is the sum of that path's initial delay
 * and the time taken to complete the slide body.
 *
 * @param slide The slide to process
 * @returns The length in seconds of the longest path in the slide.
 */
export const slideVisibleDuration = (
  slide: Slide,
  sumWithDelay?: boolean,
): number =>
  pipe(
    slide.paths,
    A.reduce<SlidePath, number>(0, (maxPathDuration, path) =>
      Math.max(
        maxPathDuration,
        path.slideSegments.reduce<number>(
          (maxSegmentDuration, segment) =>
            Math.max(maxSegmentDuration, segment.duration),
          0,
        ) +
          path.delay * Number(sumWithDelay ?? true),
      ),
    ),
  );

/**
 * Gets the length of the longest hold in a note collection.
 * @param noteCol
 * @returns
 */
export const maxHoldDuration = (noteCol: NoteCollection) =>
  pipe(
    noteCol.contents,
    A.filter(({ type }) => type === "hold" || type === "touchHold"),
    A.map((n) => (n as Hold | TouchHold).duration),
    A.reduce(0, (acc, curr) => Math.max(acc, curr)),
  );

export const isEach = (note: Note): boolean => note.parent.contents.length > 1;
