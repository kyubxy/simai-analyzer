import { deserializeSingle } from "../../src/simai";

const deferredParent = {
  contents: [],
  time: 0,
};

describe("linking", () => {
  it("Links notecollections to their parents", () => {
    const input = "(120)4/5, 6,";
    const { data, errors } = deserializeSingle(input);
    expect(errors.length).toBe(0);
    const ncParent = data?.noteCollections[0];
    const ncChild = ncParent?.contents[0];
    const actualChild2 = ncChild?.parent.contents[1]
    const expectedChild2 = ncParent?.contents[1]
    expect(actualChild2).toBe(expectedChild2);
  });

  it("Links slides to notecollections", () => {
    const input = "(120)4-5[4:1],";
    const { data, errors } = deserializeSingle(input);
    expect(errors.length).toBe(0);
    const actualSlide = data?.noteCollections[0].slides![0];
    const expectedSlide = data?.slides[0];
    expect(actualSlide).toBe(expectedSlide)
  });
});
