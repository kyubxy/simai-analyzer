import { parse } from "../lib/parser";

describe("parser", () => {
  const holdDecoratorThatIs = (deco): [string, string] => [
    `4${deco}[4:1],`,
    `4${deco}[4:1],`,
  ];

  const tapDecoratorThatIs = (deco): [string, string] => [
    `decorator that is ${deco}`,
    `4${deco},`,
  ];

  const group = (
    region: string,
    tests: [string, string][],
  ): [string, string, string][] => tests.map((test) => [region, ...test]);

  it.each([
    ...group("elem", [
      ["empty notecollection", ","],
      ["only bpm", "(120),"],
      ["only lenDef", "{4},"],
      ["only note collection", "3,"],
      ["bpm and lenDef", "(120){4},"],
      ["bpm and note collection", "(120)4,"],
      ["lenDef and note collection", "{4}4,"],
    ]),

    ...group("tap", [
      tapDecoratorThatIs(""),
      tapDecoratorThatIs("b"),
      tapDecoratorThatIs("x"),
      tapDecoratorThatIs("bx"),
      tapDecoratorThatIs("xb"),
    ]),

    ...group("hold", [
      holdDecoratorThatIs("h"),
      holdDecoratorThatIs("hxb"),
      holdDecoratorThatIs("hx"),
      holdDecoratorThatIs("bhx"),
      holdDecoratorThatIs("bh"),
      holdDecoratorThatIs("hbx"),
      holdDecoratorThatIs("hb"),
      holdDecoratorThatIs("bxh"),
      holdDecoratorThatIs("xhb"),
      holdDecoratorThatIs("xh"),
      holdDecoratorThatIs("xbh"),
      holdDecoratorThatIs("hx"),
      holdDecoratorThatIs("hb"),
    ]),
  ])("[%s]: valid when fumen is %s", (_, __, fumen) => {
    expect(() => parse(fumen)).not.toThrow();
  });

  it.each([
    ...group("elem", [
      ["no comma on bpm", "(120)"],
      ["no comma on lenDef", "{4}"],
      ["no comma on note collection", "4"],
    ]),
  ])("[%s]: invalid when fumen is %s", (_, __, fumen) => {
    expect(() => parse(fumen)).toThrow();
  });
});
