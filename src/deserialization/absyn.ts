import { unquantise } from "../helpers";
import { MaiChart } from "../maiChart";
import { NoteDecorator, StarEnterAnim, TapStyle, TouchDecorator } from "../styles";
import { LanedType, SlideType, UnlanedType } from "../types";

import * as Absyn from "../structures";
import * as Tree from "./tree"

class AbsynError extends Error {

}

// TODO: providing a default division could introduce novel semantics
//      that are otherwise unsupported by other parsers/simulators

export function genAbsyn(pt) {
    const a = new AbsynGen(pt)
    return a.generate()
}

class AbsynWarning {
    constructor(
        public message: string
    ) { }
}

class AbsynGen {
    private currentTime: number = 0
    private bpm?: number
    private division?: number = null

    private pt: any;

    private warnings: AbsynWarning[]

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
            if (t) {
                timing.push(t)
                this.division = t.division
                this.bpm = t.bpm
            }

            if (this.division != null && this.bpm != null)
                this.currentTime += unquantise(this.division, 1, this.bpm)
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
            //this.validateBpm(this.bpm)
            timingIsDirty = true
        }

        // parse length divider 
        if (elem.len !== null) {
            this.division = elem.len.div // TODO: validate with getLengthDivider
            timingIsDirty = true
        }

        // parse note collection
        if (elem.noteCol !== null) {
            [noteCol, slide] = this.parseNoteCol(elem.noteCol)
        }

        if (timingIsDirty) {
            timingMarker = new Absyn.TimingMarker(this.bpm, this.division)
        }

        if (noteCol) noteCol.time = this.currentTime
        if (slide) slide.time = this.currentTime
        if (timingMarker) timingMarker.time = this.currentTime

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
                    const [sl_, nc_] = this.parseSlide(<Tree.Slide>item)
                    if (nc_) noteCol.push(nc_)
                    slide = sl_
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
        const loc: Absyn.Location = parseLoc(tap.loc)

        if (loc.fragment !== Absyn.Area.Tap)
            throw new AbsynError("was expecting a tap location for taps, instead got: " + loc.fragment)

        return new Absyn.LanedNote(LanedType.Tap, tapStyle, decorator, loc, 0, null)
    }

    private parseHold(hold: Tree.Hold): Absyn.LanedNote {
        // decorators
        let decorator = NoteDecorator.None
        if (hold.ex === "x") 
            decorator |= NoteDecorator.Ex
        if (hold.brk === "b") 
            decorator |= NoteDecorator.Break

        // location
        const loc: Absyn.Location = parseLoc(hold.loc)

        if (loc.fragment !== Absyn.Area.Tap)
            throw new AbsynError("was expecting a tap location for holds, instead got: " + loc.fragment)

        // duration
        const duration = this.parseLenHold(hold.dur)

        return new Absyn.LanedNote(LanedType.Hold, TapStyle.Circle, decorator, loc, duration, null)
    }

    private parseTouch(touch: Tree.Touch): Absyn.UnlanedNote {
        // decorators
        let decorator = TouchDecorator.None
        if (touch.firework === "f") 
            decorator |= TouchDecorator.Hanabi

        // location
        const loc: Absyn.Location = parseLoc(touch.loc)

        return new Absyn.UnlanedNote(UnlanedType.Touch, loc, decorator, 0)
    }

    private parseTouchHold(touchHold: Tree.TouchHold): Absyn.UnlanedNote {
        // decorators
        let decorator = TouchDecorator.None
        if (touchHold.firework === "f") 
            decorator |= TouchDecorator.Hanabi

        // location
        const loc: Absyn.Location = new Absyn.Location(+touchHold.loc.pos - 1, parseFrag(touchHold.loc.frag))

        // duration
        const duration = this.parseLenHold(touchHold.len)

        return new Absyn.UnlanedNote(UnlanedType.TouchHold, loc, decorator, duration)
    }

    // TODO: grammar doesn't support break/ex stars on slides yet
    private parseSlide(slide: Tree.Slide): [Absyn.Slide, Absyn.LanedNote?] {
        let decorator = NoteDecorator.None
        if (slide.brk === "b")
            decorator |= NoteDecorator.Break
        if (slide.ex === "e")
            decorator |= NoteDecorator.Ex

        let tapStyle = TapStyle.Star
        let starAnim = StarEnterAnim.Default
        switch(slide.style) {
            case "@":
                tapStyle = TapStyle.Circle
                break;
            case "?":
                starAnim = StarEnterAnim.FadeIn
                break;
            case "!":
                starAnim = StarEnterAnim.Sudden
                break;
        }

        const loc = parseLoc(slide.loc)

        let ln = null;
        let sl = new Absyn.Slide(this.parseSlidePaths(slide.slidePaths, slide.loc));

        if (starAnim === StarEnterAnim.Default) {
            ln = new Absyn.LanedNote(LanedType.Tap, tapStyle, decorator, loc, 0, sl)
        }

        return [sl, ln]
    }

    private parseSlidePaths(paths: Tree.SlidePath[], rootLoc: Tree.Loc): Absyn.SlidePath[] {
        const absynpaths: Absyn.SlidePath[] = []
        for (const path of paths) {
            switch(path.info) {
                case "variableLen":
                    absynpaths.push(this.parseVariableSPth(<Tree.VariableLenSP>path, rootLoc))
                    break;
                case "constantLen":
                    absynpaths.push(this.parseConstSPth(<Tree.ConstantLenSP>path, rootLoc))
                    break;
                default:
                    throw new AbsynError("cannot identify slidepath of type: " + path.info)
            }
        }
        return absynpaths

    }

    private parseVariableSPth(path: Tree.VariableLenSP, rootLoc: Tree.Loc): Absyn.SlidePath {
        // delay is indicated only by the first segment's length marker
        const [delay, _] = this.parseSlideLen(path.segments[0].len)
        // path decorator is indicated only by the last segment's decorator
        const deco = path.segments[path.segments.length-1].brk === "b" ? 
            NoteDecorator.Break : NoteDecorator.None

        let lastVertex = rootLoc

        // parse segments
        const segs = []
        path.segments.forEach((seg, i) => {
            if (seg.info !== "variableLen")
                throw new AbsynError("non-variableLen slide segment found whilst iterating, got: " + seg.info)

            const verts = [parseLoc(lastVertex)].concat(seg.verts.map(v => parseLoc(v)))
            lastVertex = seg.verts.at(-1)

            const [_, length] = this.parseSlideLen(seg.len)
            const type = this.parseSlideType(seg.type)

            segs.push(new Absyn.SlideSegment(type, length, verts))

            if (i < path.segments.length - 1 && seg.brk === "b") {
                this.warnings.push(
                    new AbsynWarning(`
                        A break marker was found in a non-terminal timing marker. Although this 
                        is still syntatically valid it will be ignored at this stage. Place the 
                        break marker at the end of the slide to indicate a break slide.
                    `))
            }
        }) 


        return new Absyn.SlidePath(delay, segs, deco)
    }

    private parseConstSPth(path: Tree.ConstantLenSP, rootLoc: Tree.Loc): Absyn.SlidePath {
        // delay is indicated directly in the slide
        const [delay, tlength] = this.parseSlideLen(path.len)
        // path decorator is also indicated directly in the slide
        const deco = path.brk === "b" ? 
            NoteDecorator.Break : NoteDecorator.None

        // parse segments
        const segs = []
        let lastVertex = rootLoc
        path.segments.forEach((seg, _) => {
            if (seg.info !== "constantLen")
                throw new AbsynError("non-constantLen slide segment found whilst iterating, got: " + seg.info)

            const verts = [parseLoc(lastVertex)].concat(seg.verts.map(v => parseLoc(v)))
            const type = this.parseSlideType(seg.type)
            lastVertex = seg.verts.at(-1)

            // the total length of the slide is shared equally among other constant slides
            segs.push(new Absyn.SlideSegment(type, tlength / path.segments.length, verts))
        }) 


        return new Absyn.SlidePath(delay, segs, deco)
    }

    // TODO: not right yet
    private parseSlideLen(len: Tree.LenSlide): [delay: number, length: number] {
        switch(len.info) {
            case "ratio":
                return [unquantise(4, 1, this.bpm), unquantise(len.ratio.div, len.ratio.num, this.bpm)]
            case "bpmratio":
                return [unquantise(4, 1, len.bpm), unquantise(len.ratio.div, len.ratio.num, len.bpm)]
            case "bpmlen":
                return [unquantise(4, 1, len.bpm), len.len]
            case "delaylen":
                return [len.delay, len.len]
            case "delayratio":
                return [len.delay, unquantise(len.ratio.div, len.ratio.num, this.bpm)]
            case "delaybpmratio":
                return [len.delay, unquantise(len.ratio.div, len.ratio.num, len.bpm)]
        }
        throw new AbsynError("Unrecognised slide length type: " + len.info)
    }

    private parseSlideType(type: string): SlideType {
        switch(type) {
            case "-":
                return SlideType.Straight
            case "^":
                return SlideType.ShortArc
            case "v":
                return SlideType.VShape
            case "<":
                return SlideType.CClockwise
            case ">":
                return SlideType.Clockwise
            case "V":
                return SlideType.GrandV
            case "p":
                return SlideType.PShape
            case "q":
                return SlideType.QShape
            case "pp":
                return SlideType.PpShape
            case "qq":
                return SlideType.QqShape
            case "s":
                return SlideType.SShape
            case "z":
                return SlideType.ZShape
            case "w":
                return SlideType.Fan
        }
        throw new AbsynError("could not identify slide type. Got: " + type)
    }

    // retrieves the total time of the hold duration
    // in seconds
    private parseLenHold(duration: Tree.LenHold): number {
        let localBpm: number;
        switch(duration.info) {
            case "bpmratio":
                localBpm = this.validateBpm(duration.bpm) // collapse onto the next case
            case "ratio":
                localBpm ??= this.validateBpm(this.bpm)
                return unquantise(duration.ratio.div, duration.ratio.num, localBpm)
            case "delay":
                return duration.delay
        }
        throw new AbsynError("Invalid lenHold type " + duration.info)
    }

    // TODO: replace all this with getBPM
    private validateBpm(bpm?: number): number {
        if (this.bpm === undefined) {
            throw new AbsynError("No BPM was previously defined")
        }
        if (this.bpm <= 0) {
            throw new AbsynError("Malformed value, BPM must be positive integer") // TODO: double check whether 0 BPM is valid
        }
        return bpm!
    }

}


function parseLoc(loc: Tree.Loc): Absyn.Location {
    return new Absyn.Location(+loc.pos - 1, parseFrag(loc.frag))
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
