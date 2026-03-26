import { _Tap, _Slide, parentOf, slideOf, tapOf } from "../../src/chart";
import { deserializeSingle } from "../../src/simai";

describe("linking", () => {
  it("Links notecollections to their notes", () => {
    const input = "(120)4/5, 6,";
    const { chart } = deserializeSingle(input);
    const ncParent = chart?.noteCollections[0]!;
    const ncChild = ncParent.contents[0];
    const actualChild2 = parentOf(ncChild, chart!)?.contents[1];
    const expectedChild2 = ncParent.contents[1];
    expect(actualChild2).toBe(expectedChild2);
  });

  it("Links slides to taps", () => {
    const input = "(120)4-5[4:1]/1, 6w7[4:1]/1/1,";
    const { chart } = deserializeSingle(input);

    // test that taps link to slides
    const [nc1, nc2] = chart?.noteCollections!;

    const slidetap1 = nc1.contents[0];
    if (slidetap1.type !== "tap") throw new Error();
    expect(slideOf(slidetap1 as _Tap, chart!)?.paths[0].slideSegments[0].type).toBe("straight");

    const slidetap2 = nc2.contents[0];
    if (slidetap2.type !== "tap") throw new Error();
    expect(slideOf(slidetap2 as _Tap, chart!)?.paths[0].slideSegments[0].type).toBe("fan");

    // test that slides link to taps
    const sl1 = chart!.noteCollections[0].slides[0];
    const sl2 = chart!.noteCollections[1].slides[0];
    expect(tapOf(sl1 as _Slide, chart!)?.location).toBe(3);
    expect(tapOf(sl2 as _Slide, chart!)?.location).toBe(5);
  });
});
