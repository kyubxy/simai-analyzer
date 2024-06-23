import { MaiChart } from "../maiChart";
import { NoteCollection, Slide, TimingMarker } from "../structures";

class AbsynError extends Error {

}

export function genAbsyn(parseTree: any): MaiChart {
    switch(parseTree.label) {
        case "chart":
            return parseChart(parseTree)
        default:
            throw new AbsynError("not a chart")
    }
}

function parseChart(tree: any): MaiChart {
    const noteCollections: NoteCollection[] = []
    const slides: Slide[] = []
    const timingMarkers: TimingMarker[] = []

    for (const elem of tree.chart) {
        if (elem.label !== "elem")
            throw new AbsynError("Expecting type elem, instead got " + elem.label)

        if (elem.bpm !== null)
            parseBpm(elem.bpm)

        if (elem.len !== null)
            parseBpm(elem.len)

        if (elem.noteCol !== null)
            parseNoteCol(elem.noteCol)

    }

    return new MaiChart(noteCollections, slides, timingMarkers)
}

function parseBpm(bpmExpr: any) {

}

function parseLen(lenExpr: any) {

}

function parseNoteCol(noteColExpr: any) {

}