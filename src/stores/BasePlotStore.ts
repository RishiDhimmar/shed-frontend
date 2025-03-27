import { makeAutoObservable } from "mobx";
import { getRectanglePoints } from "../utils/geometryUtils";

export class BasePlotStore {
  width: number;
  length: number;
  points: number[][];

  constructor(width = 0, length = 0) {
    this.width = width;
    this.length = length;
    this.points = [];
    makeAutoObservable(this);
    this.updatePointsIfValid();
  }

  setWidth(newWidth: number) {
    this.width = newWidth;
    this.updatePointsIfValid();
  }

  setLength(newLength: number) {
    this.length = newLength;
    this.updatePointsIfValid();
  }

  addPoint(point: number[]) {
    this.points.push(point);
  }

  setPoints(newPoints: number[][]) {
    this.points = newPoints;
  }

  updatePointsIfValid() {
    if (this.width && this.length) {
      this.points = getRectanglePoints(this.width, this.length);
    }
  }
}
const basePlotStore = new BasePlotStore(35, 40);
export default basePlotStore;
