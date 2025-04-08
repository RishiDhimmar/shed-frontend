import { makeAutoObservable } from "mobx";
import { getRectanglePoints } from "../utils/GeometryUtils";
import uiStore from "./UIStore";

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
    uiStore.setModified(true);
  }

  setLength(newLength: number) {
    this.length = newLength;
    this.updatePointsIfValid();
    uiStore.setModified(true);
  }

  addPoint(point: number[]) {
    this.points.push(point);
    uiStore.setModified(true);
  }

  setPoints(newPoints: number[][]) {
    this.points = newPoints;
    uiStore.setModified(true);
  }

  updatePointsIfValid() {
    if (this.width && this.length) {
      this.points = getRectanglePoints(this.width, this.length);
    }
  }
}
const basePlotStore = new BasePlotStore(50, 55);
export default basePlotStore;
