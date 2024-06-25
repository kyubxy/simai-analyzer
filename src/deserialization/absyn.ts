import { MaiChart } from "../maiChart";
import * as Absyn from "../structures";
import { NoteDecorator, TapStyle, TouchDecorator } from "../styles";
import { LanedType, UnlanedType } from "../types";
import * as Tree from "./tree"

class AbsynError extends Error {

}

// TODO: providing a default division could introduce novel semantics
//      that are otherwise unsupported by other parsers/simulators
const DEFAULT_DIVISION = 8

export function genAbsyn(pt) {
    const a = new AbsynGen(pt)
    return a.generate()
}

class AbsynGen {
    private currentTime: number = 0
    private bpm?: number
    private division: number = DEFAULT_DIVISION

    private pt: any;

    constructor(parseTree: any) {
        this.pt = parseTree
    }

    generate(): MaiChart {
        return this.parseChart(<Tree.Chart>this.pt)
    }

    private parseChart(chart: Tree.Chart): MaiChart {
        const noteCols = []
        const slides = []
        const timing = []
        for (const elem of chart.chart) {
            const [noteCol, slide, t] = this.parseElem(<Tree.Elem>elem)
            if (noteCol)
                noteCols.push(noteCol)
            if (slide)
                slides.push(slide)
            if (t)
                timing.push(t)
        }
        return new MaiChart(noteCols, slides, timing)
    }

    private parseElem(elem: Tree.Elem): [Absyn.NoteCollection, Absyn.Slide, Absyn.TimingMarker] {
        let timingMarker: Absyn.TimingMarker
        let noteCol: Absyn.NoteCollection
        let slide: Absyn.Slide
        let timingIsDirty = false

        // parse bpm
        if (elem.bpm !== null) {
            this.bpm = elem.bpm
            timingIsDirty = true
        }

        // parse length divider
        if (elem.len !== null) {
            if (this.bpm === undefined) {
                throw new AbsynError("No BPM was previously defined")
            }
            if (this.bpm <= 0) {
                throw new AbsynError("Malformed value, BPM must be positive integer") // TODO: double check whether 0 BPM is valid
            }

            timingIsDirty = true
        }

        // parse note collection
        if (elem.noteCol !== null) {
            [noteCol, slide] = this.parseNoteCol(elem.noteCol)
        }

        if (timingIsDirty)
            timingMarker = new Absyn.TimingMarker(this.bpm, this.division)

        return [noteCol, slide, timingMarker]
    }

    private parseNoteCol(nc: Tree.TreeNode[]): [Absyn.NoteCollection, Absyn.Slide] {
        const noteCol = new Absyn.NoteCollection()
        let slide: Absyn.Slide;

        for (const item of nc) {
            switch(item.label) {
                case "tap":
                    noteCol.push(this.parseTap(<Tree.Tap>item))
                    break;
                case "hold":
                    noteCol.push(this.parseHold(<Tree.Hold>item))
                    break;
                case "slide":
                    noteCol.push(this.parseSlide(<Tree.Slide>item))
                    break;
                case "touch":
                    noteCol.push(this.parseTouch(<Tree.Touch>item))
                    break;
                case "touchHold":
                    noteCol.push(this.parseTouchHold(<Tree.TouchHold>item))
                    break;
            }
        }
        return [noteCol, slide]
    }

    private parseTap(tap: Tree.Tap): Absyn.LanedNote {
        // star
        let tapStyle;
        switch (tap.star) {
            case "$":
                tapStyle = TapStyle.StarStationary
                break;
            case "$$":
                tapStyle = TapStyle.Star
                break;
            default:
                tapStyle = TapStyle.Circle
                break;
        }

        // decorators
        let decorator = NoteDecorator.None
        if (tap.ex === "x") 
            decorator |= NoteDecorator.Ex
        if (tap.brk === "b") 
            decorator |= NoteDecorator.Break

        // location
        const loc: Absyn.Location = new Absyn.Location(+tap.loc.pos - 1)

        return new Absyn.LanedNote(LanedType.Tap, tapStyle, decorator, loc, 0, null)
    }

    private parseHold(hold: Tree.Hold): Absyn.LanedNote {
        throw new Error()
    }

    private parseTouch(touch: Tree.Touch): Absyn.UnlanedNote {
        // decorators
        let decorator = TouchDecorator.None
        if (touch.firework === "f") 
            decorator |= TouchDecorator.Hanabi

        // location
        const loc: Absyn.Location = new Absyn.Location(+touch.loc.pos - 1, parseFrag(touch.loc.frag))

        return new Absyn.UnlanedNote(UnlanedType.Touch, loc, decorator, 0)
    }

    private parseTouchHold(touchHold: Tree.TouchHold): Absyn.UnlanedNote {
        throw new Error()
    }

    private parseSlide(slide: Tree.Slide): Absyn.Slide {
        throw new Error()
    }
}

function parseFrag(f: string): Absyn.Area {
    switch (f) {
        case "tap":
            return Absyn.Area.Tap
        case "A":
            return Absyn.Area.A
        case "B":
            return Absyn.Area.B
        case "C":
            return Absyn.Area.C
        case "D":
            return Absyn.Area.D
        case "E":
            return Absyn.Area.E
    }
    throw new AbsynError("Invalid fragment area " + f)
}