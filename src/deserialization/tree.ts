export interface TreeNode {
    label: string
    info: string
}

export interface Chart extends TreeNode {
    chart: Elem[]
}

export interface Elem extends TreeNode {
    bpm: number
    len: LenDef
    noteCol: TreeNode[]
}

export interface LenDef extends TreeNode {
    info: string
    div: number
    sec: number
}

export interface TreeNote extends TreeNode { }

export interface Tap extends TreeNote {
    loc: Loc
    brk: string
    ex: string
    star: string
}

export interface Hold extends TreeNote {
    loc: Loc
    brk: string
    ex: string
    dur: LenHold
}

export interface Slide extends TreeNote {
    loc: Loc
    style: string
    slidePaths: SlidePath[]
    brk: string
    ex: string
}

export interface SlidePath extends TreeNode { }

export interface ConstantLenSP extends SlidePath {
    segments: SlideSegmentConst[]
    len: LenSlide
    brk: string
}

export interface VariableLenSP extends SlidePath {
    segments: SlideSegmentVar[]
}

export interface SlideSegment extends TreeNode {}

export interface SlideSegmentConst extends SlideSegment {
    type: string
    verts: Loc[]
}

export interface SlideSegmentVar extends SlideSegment {
    type: string
    verts: Loc[]
    len: LenSlide
    brk: string
}

export interface LenSlide extends TreeNode {
    ratio: Ratio
    bpm: number
    len: number
    delay: number
}

export interface LenHold extends TreeNode {
    ratio: Ratio
    bpm: number
    delay: number
}

export interface Touch extends TreeNode {
    loc: Loc
    firework: string
}

export interface TouchHold extends TreeNode {
    loc: Loc
    firework: string
    len: LenHold
}

export interface Ratio {
    div: number
    num: number
}

export interface Loc {
    pos: string
    frag: string
}

