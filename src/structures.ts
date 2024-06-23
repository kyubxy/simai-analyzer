import { NoteDecorator, StarAnimation, TapStyle, TouchDecorator } from "./styles"
import { LanedType, SlideType, UnlanedType } from "./types"

// To maximise charting flexibility, we treat chart elements as blobs of data
// instead of grouping them into a stricter inheritance hierarchy. 
// In essence, notes are nothing more than chart parameters with context, the
// context being inferred using the type field. In all cases, the type field
// shall prevail in conveying note semantics, ie. even if a LanedNote has a
// non null duration, if the type is a Tap, the note is to be read as though it were
// a tap

export class MaiChart {
    noteCollections: NoteCollection[]
    slides: Slide[]
    timingMarkers: TimingMarker[]
}

export class TimingMarker {

}

export class NoteCollection extends Array<Note> {
    time: Time
}

export class Note {
}

export class UnlanedNote extends Note {
    type: UnlanedType
    location: Location
    decorators: TouchDecorator
    duration: Time
}

export class LanedNote extends Note {
    type: LanedType
    style: TapStyle
    decorators: NoteDecorator
    location: Location
    duration: Time
    slide?: Slide // this is nothing more than a pointer to a slide object in
                    // another buffer. otherwise, the two types have nothing in common
}

export class Slide {
    time: Time
    delay: Time
    decorators: NoteDecorator
    paths: SlidePath
}

export class SlidePath {
    starAnimation: StarAnimation
    slideSegments: SlideSegment[]
    decorators: NoteDecorator

    isEachSlide(): boolean {
        return this.slideSegments.length > 1
    }
}

export class SlideSegment {
    type: SlideType
    duration: Time
    vertices: Location[]
}

export class Time {
    getSeconds(): number {
        throw new Error()
    }
}

export class Location {
    index: number // location indices start from 0
    fragment: Area

    constructor(index: number, fragment: Area = Area.Tap) {

    }
}

export enum Area {
    Tap, A, B, C, D, E
}