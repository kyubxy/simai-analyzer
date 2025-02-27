import * as AST from "chart";
import * as PT from "./parse";

// We define slides recursively to make processing more idiomatic

type Vertices = [PT.ButtonLoc] | [PT.ButtonLoc, PT.ButtonLoc];

type SlideNode = {
  vertices: Vertices;
  stem: SlideStem | null;
};

type SlideStem = {
  slideType: PT.SlideType;
  node: SlideNode;
};

const toVerts = (buttonLocs: Array<PT.ButtonLoc>): Vertices => {
  if (buttonLocs.length === 1) {
    return [buttonLocs[0]];
  } else if (buttonLocs.length === 2) {
    return [buttonLocs[0], buttonLocs[1]];
  } else {
    throw new Error("Too many buttons in vertex array.");
  }
};

export const toStructure = (
  head: Vertices,
  tail: Array<PT.Segment>,
): SlideNode => ({
  vertices: head,
  stem:
    tail.length === 0
      ? null
      : {
          slideType: tail[0].slideType,
          node: toStructure(toVerts(tail[0].verts), tail.slice(1)),
        },
});

export const toAstConstant =
  (parseSlideType: (pt: PT.SlideType) => AST.SlideType) =>
  (duration: number) => {
    const processSlides = (head: SlideNode): Array<AST.SlideSegment> =>
      head.stem === null
        ? []
        : [
            {
              type: parseSlideType(head.stem.slideType),
              vertices: [...head.vertices, ...head.stem.node.vertices].map(
                ({ button, ...rest }) => ({
                  button: button as AST.Button,
                  ...rest,
                })
              ),
              duration,
            },
            ...processSlides(head.stem.node),
          ];
    return processSlides;
  };
