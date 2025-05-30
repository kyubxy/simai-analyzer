import { parseMaidata } from "../../src/deserialization/maidataParser";

describe("maidata parser", () => {
  it.each([
    [
      "single key value pair",
      "&title=Acceleration",
      {
        title: "Acceleration",
      },
    ],
    [
      "two key value pairs",
      `&title=Acceleration
&artist=REDALiCE`,
      {
        title: "Acceleration",
        artist: "REDALiCE",
      },
    ],
    [
      "multiline values",
      `&title=Acceleration
&artist=REDALiCE
testtest
some more stuff
&lv_1=4
`,
      {
        title: "Acceleration",
        artist: "REDALiCE\ntesttest\nsome more stuff",
        lv_1: "4",
      },
    ],
    [
      "whitespace in key",
      `&title=Acceleration
& artist =REDALiCE
&lv_1=4
`,
      {
        title: "Acceleration",
        artist: "REDALiCE",
        lv_1: "4",
      },
    ],
    [
      "whitespace in value",
      `&title=Acceleration
&artist= REDALiCE
&lv_1=4
`,
      {
        title: "Acceleration",
        artist: "REDALiCE",
        lv_1: "4",
      },
    ],
    [
      "messed up first &",
      `title=Acceleration
&artist= REDALiCE
&lv_1=4
`,
      {
        artist: "REDALiCE",
        lv_1: "4",
      },
    ],
    [
      "& in value",
      "&title=宙天\n&artist=t+pazolite & Kanekochiharu",
      {
        title: "宙天",
        artist: "t+pazolite & Kanekochiharu",
      },
    ],
    [
      "= in value",
      "&key=value = 3",
      {
        key: "value = 3",
      },
    ],
    [
      "empty 1",
      "",
      {},
    ],
    [
      "empty 2",
      "   ",
      {},
    ],
    [
      "invalid",
      "alsdkjfdlskfj",
      {},
    ],
    [
      "ampersand",
      "&",
      {},
    ],
    [
      "multiple ampersands",
      "&&&&&",
      {},
    ],
    [
      "equals",
      "=",
      {},
    ],
  ])("%s - [ %s ]", (_, maidata, expected) => {
    const actual = parseMaidata(maidata);
    expect(actual).toMatchObject(expected);
  });
});
