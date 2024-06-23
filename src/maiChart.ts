import { NoteCollection, Slide, TimingMarker } from "./structures"

export class MaiChart {
    noteCollections: NoteCollection[]
    slides: Slide[]
    timingMarkers: TimingMarker[]

    constructor(ncs:NoteCollection[], ss: Slide[], tms: TimingMarker[]) {
        this.noteCollections = ncs
        this.slides = ss
        this.timingMarkers = tms
    }
}