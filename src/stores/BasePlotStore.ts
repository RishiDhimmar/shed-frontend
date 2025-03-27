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
      this.points = getRectanglePoints(this.width, this.height, [0, 0]);
    }
  }
}
const basePlotStore = new BasePlotStore( 35, 40);
export default basePlotStore;
