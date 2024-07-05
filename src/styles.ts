export enum TapStyle {
    Circle, // this also includes the hexagon hold shape
    Star, // rotates
    StarStationary
}

export enum StarEnterAnim {
    Default, // star is always visible
    FadeIn,  // star is invisible and fades in
    Sudden   // star is invisible and suddenly appears when it needs to move
}

export enum NoteDecorator {
    None = 0,
    Ex = 1 >> 0,
    Break = 1 >> 1
}

export enum TouchDecorator {
    None,
    Hanabi,
}