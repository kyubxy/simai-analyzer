export type MaiChart = {
  title: string;
  artist: string;
  author: string;
  // probs not the smartest way of doing this
  easy: Chart;
  basic: Chart;
  advanced: Chart;
  expert: Chart;
  master: Chart;
  remaster: Chart;
  original: Chart;
};

export type Chart = {
  noteCollections: Array<NoteCollection>;
  timing: Array<TimingMarker>;
  slides: Array<Slide>;
};

export type TimingMarker = {
  time: number;
  bpm: number;
  division: number;
};

export type NoteCollection = {
  contents: Array<Note>
  time: number;
};

export type Note = Tap | Hold | Touch | TouchHold;

export type Touch = {
  location: Sensor;
  decorators: TouchDecorator;
};

export type TouchHold = Touch & {
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
  decorators: NoteDecorator;
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
  vertices: Array<Location>;
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
