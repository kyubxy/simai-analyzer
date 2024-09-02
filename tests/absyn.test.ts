import { genAbsyn } from "../src/deserialization/absyn"
import { parse } from "../lib/parser"
import { MaiChart } from "../src/maiChart"
import { Area, LanedNote, TimingMarker, UnlanedNote } from "../src/structures"
import { NoteDecorator, StarEnterAnim, TapStyle, TouchDecorator } from "../src/styles"
import { unquantise } from "../src/helpers"
import { LanedType, SlideType, UnlanedType } from "../src/types"

function getAst(str: string): MaiChart {
    const tree = parse(str)
    const ast = genAbsyn(tree)
    return ast
}

describe("AbsynGen - basic usage", () => {
    it ("can parse a single bpm marker", () => {
        const ast = getAst("(160),")
        expect(ast.timingMarkers[0].bpm).toBe(160)
    })

    it("can parse a series of only taps", () => {
        const ast = getAst("(160){4}5,4,3,")
        expect(ast.noteCollections.length).toBe(3)
        expect((<LanedNote>ast.noteCollections[0][0]).type).toBe(LanedType.Tap)

        expect((<LanedNote>ast.noteCollections[0][0]).location.fragment).toBe(Area.Tap)
        expect((<LanedNote>ast.noteCollections[1][0]).location.fragment).toBe(Area.Tap)
        expect((<LanedNote>ast.noteCollections[2][0]).location.fragment).toBe(Area.Tap)

        expect((<LanedNote>ast.noteCollections[0][0]).location.index).toBe(4)
        expect((<LanedNote>ast.noteCollections[1][0]).location.index).toBe(3)
        expect((<LanedNote>ast.noteCollections[2][0]).location.index).toBe(2)
    })


    it("can parse a series of taps with decorators", () => {
        const ast = getAst("(160){4}5x,4b,3bx,")
        expect(ast.noteCollections.length).toBe(3)
        expect((<LanedNote>ast.noteCollections[0][0]).type).toBe(LanedType.Tap)

        expect((<LanedNote>ast.noteCollections[0][0]).location.fragment).toBe(Area.Tap)
        expect((<LanedNote>ast.noteCollections[1][0]).location.fragment).toBe(Area.Tap)
        expect((<LanedNote>ast.noteCollections[2][0]).location.fragment).toBe(Area.Tap)

        expect((<LanedNote>ast.noteCollections[0][0]).location.index).toBe(4)
        expect((<LanedNote>ast.noteCollections[1][0]).location.index).toBe(3)
        expect((<LanedNote>ast.noteCollections[2][0]).location.index).toBe(2)

        expect((<LanedNote>ast.noteCollections[0][0]).decorators).toBe(NoteDecorator.Ex)
        expect((<LanedNote>ast.noteCollections[1][0]).decorators).toBe(NoteDecorator.Break)
        expect((<LanedNote>ast.noteCollections[2][0]).decorators).toBe(NoteDecorator.Ex | NoteDecorator.Break)
    })

    it("can parse a series of only touches", () => {
        const ast = getAst("(160){4}A5,B4,C3,")
        expect(ast.noteCollections.length).toBe(3)
        expect((<LanedNote>ast.noteCollections[0][0]).type).toBe(UnlanedType.Touch)

        expect((<UnlanedNote>ast.noteCollections[0][0]).location.fragment).toBe(Area.A)
        expect((<UnlanedNote>ast.noteCollections[1][0]).location.fragment).toBe(Area.B)
        expect((<UnlanedNote>ast.noteCollections[2][0]).location.fragment).toBe(Area.C)

        expect((<UnlanedNote>ast.noteCollections[0][0]).location.index).toBe(4)
        expect((<UnlanedNote>ast.noteCollections[1][0]).location.index).toBe(3)
        expect((<UnlanedNote>ast.noteCollections[2][0]).location.index).toBe(2)
    })

    it("can parse a touch with the firework effect", () => {
        const ast = getAst("(160){4}A5f,")
        expect(ast.noteCollections.length).toBe(1)

        const touch = (<UnlanedNote>ast.noteCollections[0][0])
        expect(touch.type).toBe(UnlanedType.Touch)
        expect(touch.location.fragment).toBe(Area.A)
        expect(touch.location.index).toBe(4)
        expect(touch.decorators).toBe(TouchDecorator.Hanabi)
    })

    // holds

    it("can parse a hold note in the form xh[a:b]", () => {
        const ast = getAst("(160){4}4h[4:3],")

        expect(ast.noteCollections.length).toBe(1)

        const hold = (<LanedNote>ast.noteCollections[0][0])
        expect(hold.type).toBe(LanedType.Hold)
        expect(hold.location.fragment).toBe(Area.Tap)
        expect(hold.location.index).toBe(3)
        expect(hold.duration).toBeCloseTo(unquantise(4, 3, 160))
        expect(hold.decorators).toBe(NoteDecorator.None)
        expect(hold.slide).toBeNull()
        expect(hold.style).toBe(TapStyle.Circle)
    })

    it("can parse a hold note in the form xh[bpm#a:b]", () => {
        const ast = getAst("(160){4}4h[200#4:3],")
        expect(ast.noteCollections.length).toBe(1)
        expect((<LanedNote>ast.noteCollections[0][0]).type).toBe(LanedType.Hold)

        const hold = (<LanedNote>ast.noteCollections[0][0])
        expect(hold.type).toBe(LanedType.Hold)
        expect(hold.location.fragment).toBe(Area.Tap)
        expect(hold.location.index).toBe(3)
        expect(hold.duration).toBeCloseTo(unquantise(4, 3, 200))
        expect(hold.decorators).toBe(NoteDecorator.None)
        expect(hold.slide).toBeNull()
        expect(hold.style).toBe(TapStyle.Circle)
    })

    it("can parse a hold note in the form xh[#secs]", () => {
        const ast = getAst("(160){4}4h[#9],")
        expect(ast.noteCollections.length).toBe(1)

        const hold = (<LanedNote>ast.noteCollections[0][0])
        expect(hold.type).toBe(LanedType.Hold)
        expect(hold.location.fragment).toBe(Area.Tap)
        expect(hold.location.index).toBe(3)
        expect(hold.duration).toBeCloseTo(9)
        expect(hold.decorators).toBe(NoteDecorator.None)
        expect(hold.slide).toBeNull()
        expect(hold.style).toBe(TapStyle.Circle)
    })

    it("can parse a hold note with decorators", () => {
        const ast = getAst("(160){4}4bh[4:3], 4hx[2#6:9], 4bhx[#1],")

        expect(ast.noteCollections.length).toBe(3)

        const hold1 = (<LanedNote>ast.noteCollections[0][0])
        expect(hold1.type).toBe(LanedType.Hold)
        expect(hold1.location.fragment).toBe(Area.Tap)
        expect(hold1.location.index).toBe(3)
        expect(hold1.duration).toBeCloseTo(unquantise(4, 3, 160))
        expect(hold1.decorators).toBe(NoteDecorator.Break)
        expect(hold1.slide).toBeNull()
        expect(hold1.style).toBe(TapStyle.Circle)

        const hold2 = (<LanedNote>ast.noteCollections[1][0])
        expect(hold2.type).toBe(LanedType.Hold)
        expect(hold2.location.fragment).toBe(Area.Tap)
        expect(hold2.location.index).toBe(3)
        expect(hold2.duration).toBeCloseTo(unquantise(6, 9, 2))
        expect(hold2.decorators).toBe(NoteDecorator.Ex)
        expect(hold2.slide).toBeNull()
        expect(hold2.style).toBe(TapStyle.Circle)

        const hold3 = (<LanedNote>ast.noteCollections[2][0])
        expect(hold3.type).toBe(LanedType.Hold)
        expect(hold3.location.fragment).toBe(Area.Tap)
        expect(hold3.location.index).toBe(3)
        expect(hold3.duration).toBeCloseTo(1)
        expect(hold3.decorators).toBe(NoteDecorator.Ex | NoteDecorator.Break)
        expect(hold3.slide).toBeNull()
        expect(hold3.style).toBe(TapStyle.Circle)
    })

    // touchholds

    it("can parse a touchhold note in the form xxh[a:b]", () => {
        const ast = getAst("(160){4}A4h[4:3],")

        expect(ast.noteCollections.length).toBe(1)

        const touchhold = (<UnlanedNote>ast.noteCollections[0][0])
        expect(touchhold.type).toBe(UnlanedType.TouchHold)
        expect(touchhold.location.fragment).toBe(Area.A)
        expect(touchhold.location.index).toBe(3)
        expect(touchhold.duration).toBeCloseTo(unquantise(4, 3, 160))
        expect(touchhold.decorators).toBe(TouchDecorator.None)
    })

    it("can parse a touchhold note in the form xxh[bpm#a:b]", () => {
        const ast = getAst("(160){4}B4h[200#4:3],")
        expect(ast.noteCollections.length).toBe(1)

        const touchhold = (<UnlanedNote>ast.noteCollections[0][0])
        expect(touchhold.type).toBe(UnlanedType.TouchHold)
        expect(touchhold.location.fragment).toBe(Area.B)
        expect(touchhold.location.index).toBe(3)
        expect(touchhold.duration).toBeCloseTo(unquantise(4, 3, 200))
        expect(touchhold.decorators).toBe(TouchDecorator.None)
    })

    it("can parse a touchhold note in the form xxh[#secs]", () => {
        const ast = getAst("(160){4}C4h[#9],")
        expect(ast.noteCollections.length).toBe(1)

        const touchhold = (<UnlanedNote>ast.noteCollections[0][0])
        expect(touchhold.type).toBe(UnlanedType.TouchHold)
        expect(touchhold.location.fragment).toBe(Area.C)
        expect(touchhold.location.index).toBe(3)
        expect(touchhold.duration).toBeCloseTo(9)
        expect(touchhold.decorators).toBe(TouchDecorator.None)
    })

    it("can parse a touchhold note with decorators", () => {
        const ast = getAst("(160){4}D4fh[4:3],")

        expect(ast.noteCollections.length).toBe(1)

        const touchhold = (<UnlanedNote>ast.noteCollections[0][0])
        expect(touchhold.type).toBe(UnlanedType.TouchHold)
        expect(touchhold.location.fragment).toBe(Area.D)
        expect(touchhold.location.index).toBe(3)
        expect(touchhold.duration).toBeCloseTo(unquantise(4, 3, 160))
        expect(touchhold.decorators).toBe(TouchDecorator.Hanabi)
    })

    // slides 

    it("can parse a simple slide", () => {
        const ast = getAst("(160){4}3-5[4:3],")

        expect(ast.noteCollections.length).toBe(1)

        const slideNote = (<LanedNote>ast.noteCollections[0][0])
        expect(slideNote.location.fragment).toBe(Area.Tap)
        expect(slideNote.location.index).toBe(2)
        expect(slideNote.duration).toBe(0) // the note itself has zero duration

        const tp = new TimingMarker(160, 4)

        expect(slideNote.slide).not.toBeNull()
        const slide = slideNote.slide!
        expect(slide.isEach()).toBe(false)
        expect(slide.paths.length).toBe(1)
        const slidePath = slide.paths[0]
        expect(slidePath.delay).toBeCloseTo(tp.getSecondsInMeasure()) 
        expect(slidePath.slideSegments.length).toBe(1)
        const slideSeg = slidePath.slideSegments[0]
        expect(slideSeg.duration).toBeCloseTo(tp.getSecondsInMeasure(4, 3))
        expect(slideSeg.type).toBe(SlideType.Straight)
        expect(slideSeg.vertices[0].index).toBe(2)
        expect(slideSeg.vertices[1].index).toBe(4)
    })

    it("can parse a grand V slide", () => {
        const ast = getAst("(160){4}3V56[4:3],")

        expect(ast.noteCollections.length).toBe(1)

        const slideNote = (<LanedNote>ast.noteCollections[0][0])
        expect(slideNote.location.fragment).toBe(Area.Tap)
        expect(slideNote.location.index).toBe(2)
        expect(slideNote.duration).toBe(0) // the note itself has zero duration

        const tp = new TimingMarker(160, 4)

        expect(slideNote.slide).not.toBeNull()
        const slide = slideNote.slide!
        expect(slide.isEach()).toBe(false)
        expect(slide.paths.length).toBe(1)
        const slidePath = slide.paths[0]
        expect(slidePath.delay).toBeCloseTo(tp.getSecondsInMeasure()) 
        expect(slidePath.slideSegments.length).toBe(1)
        const slideSeg = slidePath.slideSegments[0]
        expect(slideSeg.duration).toBeCloseTo(tp.getSecondsInMeasure(4, 3))
        expect(slideSeg.type).toBe(SlideType.GrandV)
        const expSeg = [2, 4, 5]
        slideSeg.vertices.forEach((v,i) => {
            expect(v.index).toBe(expSeg[i])
        })
    })

    it("can parse a slide with multiple simple paths", () => {
        const ast = getAst("(160){4}3-5[4:3]*^8[3:5],")

        expect(ast.noteCollections.length).toBe(1)

        const slideNote = (<LanedNote>ast.noteCollections[0][0])
        expect(slideNote.location.fragment).toBe(Area.Tap)
        expect(slideNote.location.index).toBe(2)
        expect(slideNote.duration).toBe(0) // the note itself has zero duration

        const tp = new TimingMarker(160, 4)

        expect(slideNote.slide).not.toBeNull()
        const slide = slideNote.slide!

        expect(slide.paths.length).toBe(2)
        expect(slide.isEach()).toBe(true)

        // test path 1
        {
            const slidePath = slide.paths[0]
            expect(slidePath.delay).toBeCloseTo(tp.getSecondsInMeasure()) 
            expect(slidePath.slideSegments.length).toBe(1)
            const slideSeg = slidePath.slideSegments[0]
            expect(slideSeg.duration).toBeCloseTo(tp.getSecondsInMeasure(4, 3))
            expect(slideSeg.type).toBe(SlideType.Straight)
            const expSeg = [2, 4]
            slideSeg.vertices.forEach((v,i) => {
                expect(v.index).toBe(expSeg[i])
            })
        }

        // test path 2
        {
            const slidePath = slide.paths[1]
            expect(slidePath.delay).toBeCloseTo(tp.getSecondsInMeasure()) 
            expect(slidePath.slideSegments.length).toBe(1)
            const slideSeg = slidePath.slideSegments[0]
            expect(slideSeg.duration).toBeCloseTo(tp.getSecondsInMeasure(3, 5))
            expect(slideSeg.type).toBe(SlideType.ShortArc)
            const expSeg = [2, 7]
            slideSeg.vertices.forEach((v,i) => {
                expect(v.index).toBe(expSeg[i])
            })
        }
    })

    it("can parse a slide with a single path with multiple segments running at a constant speed", () => {
        const ast = getAst("(160){4}3-5^2[4:3],")

        expect(ast.noteCollections.length).toBe(1)

        const slideNote = (<LanedNote>ast.noteCollections[0][0])
        expect(slideNote.location.fragment).toBe(Area.Tap)
        expect(slideNote.location.index).toBe(2)
        expect(slideNote.duration).toBe(0) // the note itself has zero duration

        const tp = new TimingMarker(160, 4)

        expect(slideNote.slide).not.toBeNull()
        const slide = slideNote.slide!
        expect(slide.isEach()).toBe(false)
        expect(slide.paths.length).toBe(1)
        const slidePath = slide.paths[0]
        expect(slidePath.delay).toBeCloseTo(tp.getSecondsInMeasure()) 
        expect(slidePath.slideSegments.length).toBe(2)
        const globalSpeed = tp.getSecondsInMeasure(4, 3) / 2
        // test slide segment 1
        {
            const slideSeg = slidePath.slideSegments[0]
            expect(slideSeg.duration).toBeCloseTo(globalSpeed)
            expect(slideSeg.type).toBe(SlideType.Straight)
            console.log(slideSeg.vertices)
            const vs = slideSeg.vertices
            expect(vs[0].index).toBe(2)
            expect(vs[1].index).toBe(4)
        }

        // test slide segment 2
        {
            const slideSeg = slidePath.slideSegments[1]
            expect(slideSeg.duration).toBeCloseTo(globalSpeed)
            expect(slideSeg.type).toBe(SlideType.ShortArc)
            const vs = slideSeg.vertices
            expect(vs[0].index).toBe(4)
            expect(vs[1].index).toBe(1)
        }
    })

    it("can parse a slide with a single path with multiple segments running at variable speeds", () => {
        const ast = getAst("(160){4}3-5[4:3]^2[9:2],")

        expect(ast.noteCollections.length).toBe(1)

        const slideNote = (<LanedNote>ast.noteCollections[0][0])
        expect(slideNote.location.fragment).toBe(Area.Tap)
        expect(slideNote.location.index).toBe(2)
        expect(slideNote.duration).toBe(0) // the note itself has zero duration

        const tp = new TimingMarker(160, 4)

        expect(slideNote.slide).not.toBeNull()
        const slide = slideNote.slide!
        expect(slide.isEach()).toBe(false)
        expect(slide.paths.length).toBe(1)
        const slidePath = slide.paths[0]
        expect(slidePath.delay).toBeCloseTo(tp.getSecondsInMeasure()) 
        expect(slidePath.slideSegments.length).toBe(2)
        // test slide segment 1
        {
            const slideSeg = slidePath.slideSegments[0]
            expect(slideSeg.duration).toBeCloseTo(tp.getSecondsInMeasure(4, 3))
            expect(slideSeg.type).toBe(SlideType.Straight)
            const vs = slideSeg.vertices
            expect(vs[0].index).toBe(2)
            expect(vs[1].index).toBe(4)
        }

        // test slide segment 2
        {
            const slideSeg = slidePath.slideSegments[1]
            expect(slideSeg.duration).toBeCloseTo(tp.getSecondsInMeasure(9, 2))
            expect(slideSeg.type).toBe(SlideType.ShortArc)
            const vs = slideSeg.vertices
            expect(vs[0].index).toBe(4)
            expect(vs[1].index).toBe(1)
        }
    })

    it("can parse a multi-path, multi-segment slide, both paths with constant speed segments", () => {
        const ast = getAst("(160){4}3-5^2[4:3]*p2w7[1:8],")

        expect(ast.noteCollections.length).toBe(1)

        const slideNote = (<LanedNote>ast.noteCollections[0][0])
        expect(slideNote.location.fragment).toBe(Area.Tap)
        expect(slideNote.location.index).toBe(2)
        expect(slideNote.duration).toBe(0) // the note itself has zero duration

        const tp = new TimingMarker(160, 4)

        expect(slideNote.slide).not.toBeNull()
        const slide = slideNote.slide!

        expect(slide.paths.length).toBe(2)

        // test path 1
        {
            const slidePath = slide.paths[0]
            expect(slidePath.delay).toBeCloseTo(tp.getSecondsInMeasure()) 
            expect(slidePath.slideSegments.length).toBe(2)

            const globalSpeed = tp.getSecondsInMeasure(4,3) / 2

            // test slide segment 1
            {
                const slideSeg = slidePath.slideSegments[0]
                expect(slideSeg.duration).toBeCloseTo(globalSpeed)
                expect(slideSeg.type).toBe(SlideType.Straight)
                expect(slideSeg.vertices[0].index).toBe(2)
                expect(slideSeg.vertices[1].index).toBe(4)
            }

            // test slide segment 2
            {
                const slideSeg = slidePath.slideSegments[1]
                expect(slideSeg.duration).toBeCloseTo(globalSpeed)
                expect(slideSeg.type).toBe(SlideType.ShortArc)
                expect(slideSeg.vertices[0].index).toBe(4)
                expect(slideSeg.vertices[1].index).toBe(1)
            }
        }

        // test path 2
        {
            const slidePath = slide.paths[1]
            expect(slidePath.delay).toBeCloseTo(tp.getSecondsInMeasure()) 
            expect(slidePath.slideSegments.length).toBe(2)

            const globalSpeed = tp.getSecondsInMeasure(1,8) / 2

            // test slide segment 1
            {
                const slideSeg = slidePath.slideSegments[0]
                expect(slideSeg.duration).toBeCloseTo(globalSpeed)
                expect(slideSeg.type).toBe(SlideType.PShape)
                expect(slideSeg.vertices[0].index).toBe(2)
                expect(slideSeg.vertices[1].index).toBe(1)
            }

            // test slide segment 2
            {
                const slideSeg = slidePath.slideSegments[1]
                expect(slideSeg.duration).toBeCloseTo(globalSpeed)
                expect(slideSeg.type).toBe(SlideType.Fan)
                expect(slideSeg.vertices[0].index).toBe(1)
                expect(slideSeg.vertices[1].index).toBe(6)
            }
        }
    })

    it("can parse a multi-path, multi-segment slide, both paths with variable speed segments", () => {
        const ast = getAst("(160){4}3-5[1:2]^2[3:4]*p2[5:6]w7[7:8],")

        expect(ast.noteCollections.length).toBe(1)

        const slideNote = (<LanedNote>ast.noteCollections[0][0])
        expect(slideNote.location.fragment).toBe(Area.Tap)
        expect(slideNote.location.index).toBe(2)
        expect(slideNote.duration).toBe(0) // the note itself has zero duration

        const tp = new TimingMarker(160, 4)

        expect(slideNote.slide).not.toBeNull()
        const slide = slideNote.slide!

        expect(slide.paths.length).toBe(2)

        // test path 1
        {
            const slidePath = slide.paths[0]
            expect(slidePath.slideSegments.length).toBe(2)
            expect(slidePath.delay).toBeCloseTo(tp.getSecondsInMeasure()) 

            // test slide segment 1
            {
                const slideSeg = slidePath.slideSegments[0]
                expect(slideSeg.duration).toBeCloseTo(tp.getSecondsInMeasure(1,2))
                expect(slideSeg.type).toBe(SlideType.Straight)
                expect(slideSeg.vertices[0].index).toBe(2)
                expect(slideSeg.vertices[1].index).toBe(4)
            }

            // test slide segment 2
            {
                const slideSeg = slidePath.slideSegments[1]
                expect(slideSeg.duration).toBeCloseTo(tp.getSecondsInMeasure(3,4))
                expect(slideSeg.type).toBe(SlideType.ShortArc)
                expect(slideSeg.vertices[0].index).toBe(4)
                expect(slideSeg.vertices[1].index).toBe(1)
            }
        }

        // test path 2
        {
            const slidePath = slide.paths[1]
            expect(slidePath.slideSegments.length).toBe(2)
            expect(slidePath.delay).toBeCloseTo(tp.getSecondsInMeasure()) 

            // test slide segment 1
            {
                const slideSeg = slidePath.slideSegments[0]
                expect(slideSeg.duration).toBeCloseTo(tp.getSecondsInMeasure(5,6))
                expect(slideSeg.type).toBe(SlideType.PShape)
                expect(slideSeg.vertices[0].index).toBe(2)
                expect(slideSeg.vertices[1].index).toBe(1)
            }

            // test slide segment 2
            {
                const slideSeg = slidePath.slideSegments[1]
                expect(slideSeg.duration).toBeCloseTo(tp.getSecondsInMeasure(7,8))
                expect(slideSeg.type).toBe(SlideType.Fan)
                expect(slideSeg.vertices[0].index).toBe(1)
                expect(slideSeg.vertices[1].index).toBe(6)
            }
        }
    })

    it("can parse a multi-path, multi-segment slide, one segment with variable speeds and the other constant", () => {
        const ast = getAst("(160){4}3-5[1:2]^2[3:4]*p2w7[1:8],")

        expect(ast.noteCollections.length).toBe(1)

        const slideNote = (<LanedNote>ast.noteCollections[0][0])
        expect(slideNote.location.fragment).toBe(Area.Tap)
        expect(slideNote.location.index).toBe(2)
        expect(slideNote.duration).toBe(0) // the note itself has zero duration

        const tp = new TimingMarker(160, 4)

        expect(slideNote.slide).not.toBeNull()
        const slide = slideNote.slide!

        expect(slide.paths.length).toBe(2)

        // test path 1
        {
            const slidePath = slide.paths[0]
            expect(slidePath.slideSegments.length).toBe(2)
            expect(slidePath.delay).toBeCloseTo(tp.getSecondsInMeasure()) 

            // test slide segment 1
            {
                const slideSeg = slidePath.slideSegments[0]
                expect(slideSeg.duration).toBeCloseTo(tp.getSecondsInMeasure(1,2))
                expect(slideSeg.type).toBe(SlideType.Straight)
                expect(slideSeg.vertices[0].index).toBe(2)
                expect(slideSeg.vertices[1].index).toBe(4)
            }

            // test slide segment 2
            {
                const slideSeg = slidePath.slideSegments[1]
                expect(slideSeg.duration).toBeCloseTo(tp.getSecondsInMeasure(3,4))
                expect(slideSeg.type).toBe(SlideType.ShortArc)
                expect(slideSeg.vertices[0].index).toBe(4)
                expect(slideSeg.vertices[1].index).toBe(1)
            }
        }

        // test path 2
        {
            const slidePath = slide.paths[1]
            expect(slidePath.slideSegments.length).toBe(2)
            expect(slidePath.delay).toBeCloseTo(tp.getSecondsInMeasure()) 

            const globalSpeed = tp.getSecondsInMeasure(1,8) / 2

            // test slide segment 1
            {
                const slideSeg = slidePath.slideSegments[0]
                expect(slideSeg.duration).toBeCloseTo(globalSpeed)
                expect(slideSeg.type).toBe(SlideType.PShape)
                expect(slideSeg.vertices[0].index).toBe(2)
                expect(slideSeg.vertices[1].index).toBe(1)
            }

            // test slide segment 2
            {
                const slideSeg = slidePath.slideSegments[1]
                expect(slideSeg.duration).toBeCloseTo(globalSpeed)
                expect(slideSeg.type).toBe(SlideType.Fan)
                expect(slideSeg.vertices[0].index).toBe(1)
                expect(slideSeg.vertices[1].index).toBe(6)
            }
        }
    })

    // see the SLIDE section on the simai wiki for more information
    // https://w.atwiki.jp/simai/pages/1003.html#id_d9e6227a

    it("can parse a slide with duration specified in the form [bpm#x:y]", () => {
        const ast = getAst("(160){4}3-5[180#4:3],")

        expect(ast.noteCollections.length).toBe(1)

        const slideNote = (<LanedNote>ast.noteCollections[0][0])
        expect(slideNote.location.fragment).toBe(Area.Tap)
        expect(slideNote.location.index).toBe(2)
        expect(slideNote.duration).toBe(0) // the note itself has zero duration

        const tp = new TimingMarker(160, 4)

        expect(slideNote.slide).not.toBeNull()
        const slide = slideNote.slide!
        expect(slide.paths.length).toBe(1)
        expect(slide.isEach()).toBe(false)
        const slidePath = slide.paths[0]
        expect(slidePath.delay).toBeCloseTo(unquantise(180, 4, 1)) 
        expect(slidePath.slideSegments.length).toBe(1)
        const slideSeg = slidePath.slideSegments[0]
        expect(slideSeg.duration).not.toBeCloseTo(tp.getSecondsInMeasure(4, 3))
        expect(slideSeg.duration).toBeCloseTo(unquantise(180, 4, 3))
        expect(slideSeg.type).toBe(SlideType.Straight)
        expect(slideSeg.vertices[0].index).toBe(2)
        expect(slideSeg.vertices[0].index).toBe(4)
    })

    it("can parse a slide with duration specified in the form [bpm#length]", () => {
        const ast = getAst("(160){4}3-5[180#4],")

        expect(ast.noteCollections.length).toBe(1)

        const slideNote = (<LanedNote>ast.noteCollections[0][0])
        expect(slideNote.location.fragment).toBe(Area.Tap)
        expect(slideNote.location.index).toBe(2)
        expect(slideNote.duration).toBe(0) // the note itself has zero duration

        expect(slideNote.slide).not.toBeNull()
        const slide = slideNote.slide!
        expect(slide.paths.length).toBe(1)
        const slidePath = slide.paths[0]
        expect(slidePath.delay).toBeCloseTo(unquantise(180, 4, 1)) 
        expect(slidePath.slideSegments.length).toBe(1)
        const slideSeg = slidePath.slideSegments[0]
        expect(slideSeg.duration).toBeCloseTo(4)
        expect(slideSeg.type).toBe(SlideType.Straight)
        expect(slideSeg.vertices[0].index).toBe(2)
        expect(slideSeg.vertices[0].index).toBe(4)
    })

    it("can parse a slide with duration specified in the form [delay##length]", () => {
        const ast = getAst("(160){4}3-5[1##2],")

        expect(ast.noteCollections.length).toBe(1)

        const slideNote = (<LanedNote>ast.noteCollections[0][0])
        expect(slideNote.location.fragment).toBe(Area.Tap)
        expect(slideNote.location.index).toBe(2)
        expect(slideNote.duration).toBe(0) // the note itself has zero duration

        expect(slideNote.slide).not.toBeNull()
        const slide = slideNote.slide!
        expect(slide.paths.length).toBe(1)
        const slidePath = slide.paths[0]
        expect(slidePath.delay).toBeCloseTo(1)
        expect(slidePath.slideSegments.length).toBe(1)
        const slideSeg = slidePath.slideSegments[0]
        expect(slideSeg.duration).toBeCloseTo(2)
        expect(slideSeg.type).toBe(SlideType.Straight)
        expect(slideSeg.vertices[0].index).toBe(2)
        expect(slideSeg.vertices[0].index).toBe(4)
    })

    it("can parse a slide with duration specified in the form [delay##x:y]", () => {
        const ast = getAst("(160){4}3-5[1##2:3],")

        expect(ast.noteCollections.length).toBe(1)

        const slideNote = (<LanedNote>ast.noteCollections[0][0])
        expect(slideNote.location.fragment).toBe(Area.Tap)
        expect(slideNote.location.index).toBe(2)
        expect(slideNote.duration).toBe(0) // the note itself has zero duration

        const tp = new TimingMarker(160, 4)

        expect(slideNote.slide).not.toBeNull()
        const slide = slideNote.slide!
        expect(slide.paths.length).toBe(1)
        const slidePath = slide.paths[0]
        expect(slidePath.delay).toBeCloseTo(1) 
        expect(slidePath.slideSegments.length).toBe(1)
        const slideSeg = slidePath.slideSegments[0]
        expect(slideSeg.duration).toBeCloseTo(tp.getSecondsInMeasure(2, 3))
        expect(slideSeg.type).toBe(SlideType.Straight)
        expect(slideSeg.vertices[0].index).toBe(2)
        expect(slideSeg.vertices[0].index).toBe(4)
    })

    it("can parse a slide with duration specified in the form [delay##bpm##x:y]", () => {
        const ast = getAst("(160){4}3-5[1##2##3:4],")
        expect(ast.noteCollections.length).toBe(1)
        const slideNote = (<LanedNote>ast.noteCollections[0][0])
        expect(slideNote.location.fragment).toBe(Area.Tap)
        expect(slideNote.location.index).toBe(2)
        expect(slideNote.duration).toBe(0) // the note itself has zero duration
        expect(slideNote.slide).not.toBeNull()
        const slide = slideNote.slide!
        expect(slide.paths.length).toBe(1)
        const slidePath = slide.paths[0]
        expect(slidePath.delay).toBeCloseTo(1) 
        expect(slidePath.slideSegments.length).toBe(1)
        const slideSeg = slidePath.slideSegments[0]
        expect(slideSeg.duration).toBeCloseTo(unquantise(2, 3, 4))
        expect(slideSeg.type).toBe(SlideType.Straight)
        expect(slideSeg.vertices[0].index).toBe(2)
        expect(slideSeg.vertices[0].index).toBe(4)
    })

    it("can parse eaches", () => {
        const ast = getAst("(150){4}1/2,")
        const ast1 = getAst("(150){4}1-2[4:1]/2,")
        const ast2 = getAst("(150){4}1-2[4:1]/2h[8:3],")
    })
})

describe("AbsynGen - whitespace", () => { })

describe("AbsynGen - start timing", () => { 
    it("can correctly order notes' time", () => {
        for (let i = 0; i < 10; i++) {
            const ast = getAst("(160){"+i+"}1,1,1")
        }
    })

    it("can correctly interpret empty segments", () => {
        const ast = getAst("(160){4}1,,1")
    })

    it("can correctly handle bpm changes", () => {
        const ast = getAst("(150){4}1,1,1,1,(200)1,1,1,1,")
    })
})

describe("AbsynGen - utage elements (base simai)", () => {
    it("can change normal taps to star shaped taps", () => {

    })

    it("can change normal taps to star shaped taps with decorators", () => {

    })

    it("can parse slide without star shaped tap", () => {

    })

    // TODO: v

    it("can parse tap pseudo holds", () => {

    })

    it("can parse touch pseudo holds", () => {

    })

    it("can parse pseudo each", () => {

    })
})


// TODO:
/*
describe("AbsynGen - random tests", () => {
})

describe("AbsynGen - existing charts", () => {

})

describe("AbsynGen - malformities", () => {
})
*/