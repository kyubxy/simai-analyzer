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

/**
 * Touches and touch holds. Slides are excluded from this category.
 */
export type UnlanedNote = {
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
export type LanedNote = {
  decorators: NoteDecorator;
  location: Button;
};

/**
 * Tap note
 */
export type Tap = LanedNote & {
  type: "tap";
  style: TapStyle;
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
