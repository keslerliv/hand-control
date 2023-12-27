import { Points } from "./types";

export function getGlobalDistance(p1: Points, p2: Points) {
  return Math.abs(
    Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  );
}
