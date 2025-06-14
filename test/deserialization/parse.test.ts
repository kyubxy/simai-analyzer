import { mapParse } from "../../src/deserialization/parse";
import * as E from "fp-ts/Either";

describe("mapParse", () => {
  it.each([
    ["a well-formed chart", "{1},(2),3,4-5[6:7],(8)7,E"],
    ["a well-formed without a terminating E", "{1},(2),3,4-5[6:7],(8)7,"],
    [
      "a well-formed chart with whitespace",
      "{1}, (2 ),3,4  -5[6:  7],(8)7,E    ",
    ],
  ])("parses %s without errors", (_, chart) => {
    const result = mapParse(chart);
    for (const either of result) {
      expect(E.isRight(either)).toBeTruthy();
    }
  });

  it("parses nothing", () => {
    const chart = ",,,";
    const actual = mapParse(chart);
    for (const x of actual) {
      expect(E.isRight(x)).toBeTruthy();
      if (x._tag === "Right") {
        const val = x.right;
        console.log(x)
        expect(val.noteCol).toMatchObject([])
      }
    }
  })

  it("parses with one error", () => {
    const chart = "BROKEN,(2),3,4-5[6:7],(8)7,E";
    const [head, ...tail] = mapParse(chart);
    expect(E.isLeft(head)).toBeTruthy();
    for (const either of tail) {
      expect(E.isRight(either)).toBeTruthy();
    }
  });

  it("terminates after first E", () => {
    const chart = "BROKEN,(2),E,4-5[6:7],(8)7,E";
    const result = mapParse(chart);
    expect(result.length).toBe(2);
  });
});
