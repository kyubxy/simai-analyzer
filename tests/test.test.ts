import * as parser from "../lib/parser"

interface chiumeroi {
    bruh: number
}

test("idk", () => {
    const idk = parser.parse("(160){8}1,1,1-4[4:5],E")
    console.log(idk)
    expect(true).toBe(true)
})