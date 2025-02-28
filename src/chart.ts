export type RawMaidata = { [key: string]: string };

export type MaiChart = {
  title: string;
  artist: string;
  author: string;
  offset: number;
  levels: { [key: string]: Level };
  raw: RawMaidata;
};

export type Level = {
  chart?: Chart;
  level?: string;
};

export type Chart = {
  noteCollections: ReadonlyArray<NoteCollection>;
  timing: ReadonlyArray<TimingMarker>;
  slides: ReadonlyArray<Slide>;
};

export type TimingMarker = {
  time: number;
  bpm: number;
};

export type NoteCollection = {
  contents: Array<Note>;
  time: number;
};

export type Note = Tap | Hold | Touch | TouchHold;

export type UnlanedNote = {
  location: Sensor;
  decorators: TouchDecorator;
};

export type Touch = UnlanedNote;

export type TouchHold = UnlanedNote & {
  duration: number;
};

export type LanedNote = {
  decorators: NoteDecorator;
  location: Button;
};

export type Tap = LanedNote & {
  style: TapStyle;
};

export type Hold = LanedNote & {
  duration: number;
};

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
