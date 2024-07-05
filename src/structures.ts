import { unquantise } from "./helpers"
import { NoteDecorator, StarEnterAnim, TapStyle, TouchDecorator } from "./styles"
import { LanedType, SlideType, UnlanedType } from "./types"

// To maximise charting flexibility, we treat chart elements as blobs of data
// instead of grouping them into a stricter inheritance hierarchy. 
// In essence, notes are nothing more than chart parameters with context, the
// context being inferred using the type field. In all cases, the type field
// shall prevail in conveying note semantics, ie. even if a LanedNote has a
// non null duration, if the type is a Tap, the note is to be read as though it were
// a tap

// a note on time: eventually we'll want to move to using proper values to improve serialisation
// and not just seconds. for the time being we'll just stick with using seconds and
// quantise the second values 

export class TimingMarker {
    constructor(public bpm: number, public division: number) {

    }

    getSecondsInMeasure(division?: number, num?: number): number {
        return unquantise(division ?? 4, num ?? 1, this.bpm)
    }
}

export class NoteCollection extends Array<Note> {
    time: number
}

export class Note {
}

export class UnlanedNote extends Note {
    constructor( 
        public type: UnlanedType,
        public location: Location,
        public decorators: TouchDecorator,
        public duration: number
    ) { 
        super()
    }
}

export class LanedNote extends Note {
    constructor(
        public type: LanedType,
        public style: TapStyle,
        public decorators: NoteDecorator,
        public location: Location,
        public duration: number,

        // this is nothing more than a pointer to a slide object in another buffer
        public slide?: Slide 
                        
    ) { 
        super()
    }
}

export class Slide {
    time: number
    constructor(
        public paths: SlidePath[]
    ) { }
}

export class SlidePath {
    constructor (
        public delay: number,
        public slideSegments: SlideSegment[],
        public decorators: NoteDecorator
    ) { }

    isEachSlide(): boolean {
        return this.slideSegments.length > 1
    }
}

export class SlideSegment {
    constructor(
        public type: SlideType,
        public duration: number,
        public vertices: Location[],
    ) { }
}

export class Location {
    constructor(
        public index: number,  // location indices start from 0
        public fragment: Area = Area.Tap
    ) { }
}

export enum Area {
    Tap, A, B, C, D, E
}