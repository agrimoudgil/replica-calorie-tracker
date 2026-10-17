import { describe, expect, it } from "vitest";
import { markerPosition, readPhotoBoxes } from "./photo-boxes";

const box = { x: 0.4, y: 0.4, w: 0.2, h: 0.2 }; // centred

describe("photo markers", () => {
  it("sit on the food's centre when the photo has the frame's shape", () => {
    expect(markerPosition(box, 4 / 3)).toEqual({ left: 50, top: 50 });
    expect(markerPosition({ x: 0, y: 0, w: 0.5, h: 0.5 }, 4 / 3)).toEqual({ left: 25, top: 25 });
  });

  it("allow for the edges cut off a tall or wide photo", () => {
    // A 3:4 portrait photo in a 4:3 frame shows the middle 56.25% of its height.
    expect(markerPosition({ x: 0.2, y: 0.4, w: 0.2, h: 0.1 }, 3 / 4).top).toBeCloseTo(((0.45 - 0.21875) / 0.5625) * 100, 0);
    // A 16:9 photo shows the middle 75% of its width.
    expect(markerPosition({ x: 0.6, y: 0.4, w: 0.1, h: 0.2 }, 16 / 9).left).toBeCloseTo(((0.65 - 0.125) / 0.75) * 100, 0);
  });

  it("stay inside the frame when the food is cut off", () => {
    expect(markerPosition({ x: 0, y: 0, w: 0.04, h: 0.04 }, 3 / 4)).toEqual({ left: 8, top: 8 });
    expect(markerPosition({ x: 0.96, y: 0.96, w: 0.04, h: 0.04 }, 16 / 9)).toEqual({ left: 92, top: 92 });
  });

  it("read only well-formed stored boxes", () => {
    expect(readPhotoBoxes(JSON.stringify({ aspect: 1.5, boxes: { a: box, b: { x: "1" }, c: { x: 0.2, y: 0.2, w: 0, h: 0.1 } } }))).toEqual({ aspect: 1.5, boxes: { a: box } });
    expect(readPhotoBoxes(JSON.stringify({ aspect: 0, boxes: { a: box } }))).toBeNull();
    expect(readPhotoBoxes(JSON.stringify({ aspect: 1.5, boxes: {} }))).toBeNull();
    expect(readPhotoBoxes("{not json")).toBeNull();
    expect(readPhotoBoxes(null)).toBeNull();
  });
});
