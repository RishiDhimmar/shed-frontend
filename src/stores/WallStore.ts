import { makeAutoObservable } from "mobx";
import { getInternalWallPoints, getRectanglePoints } from "../utils/geometryUtils";

export class WallStore {
    width: number;
    height: number;
    wallThickness: number;
    externalWallPoints: number[][] = [];
    internalWallPoints: number[][] = [];
  
    constructor(width = 0, height = 0, wallThickness = 0) {
      this.width = width;
      this.height = height;
      this.wallThickness = wallThickness;
      makeAutoObservable(this);
      this.updateWallPoints();
    }
  
    setWidth(newWidth: number) {
      this.width = newWidth;
      this.updateWallPoints();
    }
  
    setHeight(newHeight: number) {
      this.height = newHeight;
      this.updateWallPoints();
    }
  
    setWallThickness(newWallThickness: number) {
      this.wallThickness = newWallThickness;
      this.updateWallPoints();
    }
  
    updateWallPoints() {
      this.externalWallPoints = getRectanglePoints(this.width, this.height);
      this.internalWallPoints = getInternalWallPoints(
        this.width,
        this.height,
        this.wallThickness
      );
    }
  }
  
  const wallStore = new WallStore(800, 600, 50);
  export default wallStore;