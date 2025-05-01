import { fragrance } from "./chartData/fragranceMaster";
import { ravenEmperor } from "./chartData/ravenEmperor";
import { grievousLady } from "./chartData/grievousLady";
import { lowercaseLifetimeMaidata } from "./chartData/lowercaseLifetimeMaidata";

import { parseMaidata } from "../src/deserialization/maidataParser";
import { deserialize, deserializeSingle } from "../src/simai";
import { luciaRemas } from "./chartData/lucia";

describe("deserialization", () => {
  it("test", () => {
    const e = deserializeSingle(luciaRemas);
    expect(1).toBe(1);
  });

  it.each([
    ["fragrance master", fragrance],
    ["raven emperor master", ravenEmperor],
    ["grievous lady master", grievousLady],
  ])("deserializes %s without issue", (_, data) => {
    expect(() => deserializeSingle(data)).not.toThrow();
  });

  it.each([
    ["&title=lucia", { title: "lucia" }],
    ["&title=turn around", { title: "turn around" }],
    ["&lv_5=14+", { lv_5: "14+" }],
    [
      `
&inote_5=
7,8,1,2,3,4,5/6,,4/3,,6,4h[32:1],3h[32:1],C,,
E8/4,,3/B7,3,B6,3,E6,3,E8,4,B7,4,B6/3,3,4/E6,4,
E4/8,,7/B3,7,B2,6,E2,6,E4,5,B3,5,B2/5,5,6/E2,6,
&lv_5=14+`,
      {
        inote_5:
          "7,8,1,2,3,4,5/6,,4/3,,6,4h[32:1],3h[32:1],C,,E8/4,,3/B7,3,B6,3,E6,3,E8,4,B7,4,B6/3,3,4/E6,4,E4/8,,7/B3,7,B2,6,E2,6,E4,5,B3,5,B2/5,5,6/E2,6,",
        lv_5: "14+",
      },
    ],
  ])(
    "deserializes key value pair [ %s ] from chart data",
    (fragment, expected) => {
      expect(parseMaidata(fragment)).toEqual(expected);
    },
  );

  it("parses the entire chart data", () => {
    const chart = lowercaseLifetimeMaidata;
    const actual = parseMaidata(chart);
    expect(actual["title"]).toBe("lowercase lifetime");
    expect(actual["artist"]).toBe("ZAQUVA");
    expect(actual["first"]).toBe("2.54");
    expect(actual["des"]).toBe("kyubey");
    expect(actual["lv_5"]).toBe("14");
  });

  it("deserializes the entire chart data", () => {
    const chart = lowercaseLifetimeMaidata;
    const actual = deserialize(chart);
    expect(actual.title).toBe("lowercase lifetime");
    expect(actual.artist).toBe("ZAQUVA");
    expect(actual.offset).toBe(2.54);
    expect(actual.author).toBe("kyubey");
    expect(actual.levels["master"].level).toBe("14");
  });
});
