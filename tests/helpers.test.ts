import { QuantiseError, unquantise } from "../src/helpers"

describe("helper functions - unquantisation", () => {
    it("unquantises the ratio 4:1 at 160BPM", () => {
        expect(unquantise(4, 1, 160)).toBeCloseTo(0.375)
    })

    it("unquantises the ratio 4:2 at 160BPM", () => {
        expect(unquantise(4, 2, 160)).toBeCloseTo(0.75)
    })

    it("unquantises the ratio 8:1 at 160BPM", () => {
        expect(unquantise(8, 1, 160)).toBeCloseTo(0.1875)
    })

    it("unquantises the ratio 5:1 at 160BPM", () => {
        // value retrieved with this website 
        // https://toolstud.io/music/bpm.php?bpm=160&bpm_unit=4%2F4&base=5
        expect(unquantise(5, 1, 160)).toBeCloseTo(0.3)
    })

    it("unquantises the ratio 4:0 at 160BPM", () => {
        expect(unquantise(4, 0, 160)).toBeCloseTo(0)
    })

    it("does not try to unquantise a division of 0", () => {
        expect(() => unquantise(0,3,3)).toThrow(QuantiseError)
    })

    it("does not try to unquantise 0BPM", () => {
        expect(() => unquantise(4,2,0)).toThrow(QuantiseError)
    })

    it("does not try to unquantise the ratio 4:2 at -160BPM", () => {
        expect(() => unquantise(4,2,-160)).toThrow(QuantiseError)
    })

    it("does not try to unquantise the ratio -4:2 at 160BPM", () => {
        expect(() => unquantise(-4,2,160)).toThrow(QuantiseError)
    })

    it("does not try to unquantise the ratio 4:-2 at 160BPM", () => {
        expect(() => unquantise(4,-2,160)).toThrow(QuantiseError)
    })
})