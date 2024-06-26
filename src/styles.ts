export enum TapStyle {
    Circle, // this also includes the hexagon hold shape
    Star, // rotates
    StarStationary
}

export enum StarAnimation {
    FadeIn,
    Sudden
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