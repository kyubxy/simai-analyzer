export interface Tree {
    label: string
    info: string
}

export interface Chart extends Tree {
    chart: Elem[]
}

export interface Elem extends Tree {
    bpm: number
    len: Len
    noteCol: Tree[]
}

export interface Len extends Tree {
    info: string
    div: number
    sec: number
}

export interface TreeNote extends Tree { }

export interface Tap extends TreeNote {
    loc: string
    brk: string
    ex: string
    star: string
}

export interface Hold extends TreeNote {
    loc: string
    brk: string
    ex: string
    dur: LenHold
}

export interface Slide extends TreeNote {
    loc: string
    style: string
    slidePaths: SlidePath[]
}

export interface SlidePath extends Tree { }

export interface ConstantLenSP extends SlidePath {
    segments: SlideSegmentConst[]
    len: LenSlide
    brk: string
}

export interface VariableLenSP extends SlidePath {
    segments: SlideSegmentVar[]
}

export interface SlideSegment extends Tree {}

export interface SlideSegmentConst extends SlideSegment {
    type: string
    verts: string[]
}

export interface SlideSegmentVar extends SlideSegment {
    type: string
    verts: string[]
    len: LenSlide
    brk: string
}

export interface LenSlide extends Tree {
    ratio: Ratio
    bpm: number
    len: number
    delay: number
}

export interface LenHold extends Tree {
    ratio: Ratio
    bpm: number
    delay: number
}

export interface Ratio {
    div: number
    num: number
}
