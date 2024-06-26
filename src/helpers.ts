export class QuantiseError extends Error {

}

export function unquantise(divisions: number, num: number, bpm: number): number {
    if (divisions === 0)
        throw new QuantiseError("division cannot be 0")

    if (bpm === 0)
        throw new QuantiseError("bpm cannot be 0")

    if (divisions < 0)
        throw new QuantiseError("division must be greater than 0")

    if (bpm < 0)
        throw new QuantiseError("bpm must be greater than 0")

    if (num < 0)
        throw new QuantiseError("num must be greater than 0")

    return (60/bpm)*(4/divisions) * num
}



// returns the number of divisions
export function quantise(sec: number, bpm: number, divisions?: number): number {

}