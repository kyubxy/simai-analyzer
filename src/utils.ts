import { Slide } from "chart";

/**
 * Given a full slide path, computes the total duration of the longest
 * slide path. The longest duration is the sum of that path's initial delay
 * and the time taken to complete the slide body.
 * 
 * @param slide The slide to process
 * @returns The length in seconds of the longest path in the slide. 
 */
// TODO: test this
export const slideVisibleDuration = (slide: Slide): number =>
  slide.paths.reduce<number>(
    (maxPathDuration, path) =>
      Math.max(
        maxPathDuration,
        path.slideSegments.reduce<number>(
          (maxSegmentDuration, segment) =>
            Math.max(maxSegmentDuration, segment.duration),
          0,
        ) + path.delay,
      ),
    0,
  );
