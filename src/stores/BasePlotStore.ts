import { makeAutoObservable } from "mobx";
import { getRectanglePoints } from "../utils/geometryUtils";

export class BasePlotStore {
  width: number;
  height: number;
  points: number[][];

  constructor(width = 0, height = 0) {
    this.width = width;
    this.height = height;
    this.points = [];
    makeAutoObservable(this);
    this.updatePointsIfValid();
  }

  setWidth(newWidth: number) {
    this.width = newWidth;
    this.updatePointsIfValid();
  }

  setHeight(newHeight: number) {
    this.height = newHeight;
    this.updatePointsIfValid();
  }

  addPoint(point: number[]) {
    this.points.push(point);
  }

  setPoints(newPoints: number[][]) {
    this.points = newPoints;
  }

  updatePointsIfValid() {
    if (this.width && this.height) {
      this.points = getRectanglePoints(this.width, this.height);
    }
  }
}
const basePlotStore = new BasePlotStore(80, 80);
export default basePlotStore;