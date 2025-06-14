import { Slide } from "../../src/chart";
import { deserializeSingle } from "../../src/simai";

const deferredParent = {
  contents: [],
  time: 0,
};

describe("linking", () => {
  it("Links notecollections to their parents", () => {
    const input = "(120)4/5, 6,";
    const { chart } = deserializeSingle(input);
    const ncParent = chart?.noteCollections[0];
    const ncChild = ncParent?.contents[0];
    const actualChild2 = ncChild?.parent.contents[1];
    const expectedChild2 = ncParent?.contents[1];
    expect(actualChild2).toBe(expectedChild2);
  });

  it("Links slides to taps", () => {
    const input = "(120)4-5[4:1]/1, 6w7[4:1]/1/1,";
    const { chart } = deserializeSingle(input);

    // test that taps link to slides
    const [nc1, nc2] = chart?.noteCollections!;

    const slidetap1 = nc1.contents[0];
    if (slidetap1.type !== "tap") throw new Error();
    expect(slidetap1.slide?.paths[0].slideSegments[0].type).toBe("straight");

    const slidetap2 = nc2.contents[0];
    if (slidetap2.type !== "tap") throw new Error();
    expect(slidetap2.slide?.paths[0].slideSegments[0].type).toBe("fan");

    // test that slides link to taps
    const [sl1, sl2] = chart?.slides!;
    expect(sl1.tap?.location).toBe(3);
    expect(sl2.tap?.location).toBe(5);
  });
});
