import { makeAutoObservable } from "mobx";
import { fetchWallData } from "../components/threeenv/inputs/Fetch";

export class WallStore {
  width = 0;
  height = 0;
  wallThickness = 0;
  externalWallPoints: number[][] = [];
  internalWallPoints: number[][] = [];

  constructor(width = 0, height = 0, wallThickness = 0) {
    this.width = width;
    this.height = height;
    this.wallThickness = wallThickness;
    makeAutoObservable(this);
  }

  async loadWallData() {
    try {
      const data = await fetchWallData();
      console.log("Fetched Wall Data:", JSON.stringify(data));
      this.processWallData(data);
    } catch (error) {
      console.error("Error loading wall data:", error);
    }
  }

  processWallData(data: any) {
    if (data?.entities?.length) {
      const externalPolyline = data.entities[0]?.vertices || [];
      const internalPolyline = data.entities[1]?.vertices || [];

      const newExternalPoints = externalPolyline.map((point: any) => [
        point.x,
        point.y,
        0,
      ]);

      const newInternalPoints = internalPolyline.map((point: any) => [
        point.x,
        point.y,
        0,
      ]);

      this.setWallPoints(newExternalPoints, newInternalPoints);
    } else {
      console.warn("No valid entities found in wall data");
    }
  }

  setWallPoints(external: number[][], internal: number[][]) {
    this.externalWallPoints = external;
    this.internalWallPoints = internal;
    this.calculateDimensions();
    this.calculateThickness();
  }

  calculateDimensions() {
    if (this.externalWallPoints.length === 0) return;

    const xValues = this.externalWallPoints.map((point) => point[0]);
    const yValues = this.externalWallPoints.map((point) => point[1]);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    this.width = maxX - minX;
    this.height = maxY - minY;

    console.log("Updated Wall Dimensions - Width:", this.width, "Height:", this.height);
  }

  calculateThickness() {
    if (this.externalWallPoints.length === 0 || this.internalWallPoints.length === 0) return;

    let totalThickness = 0;
    let count = 0;

    for (let i = 0; i < Math.min(this.externalWallPoints.length, this.internalWallPoints.length); i++) {
      const ey = this.externalWallPoints[i][1]; // External Y
      const iy = this.internalWallPoints[i][1]; // Internal Y

      const thickness = Math.abs(ey - iy); // Thickness = |y1 - y2|
      totalThickness += thickness;
      count++;
    }

    if (count > 0) {
      this.wallThickness = totalThickness / count;
      console.log("Updated Wall Thickness:", this.wallThickness);
    }
  }
}

const wallStore = new WallStore();
export default wallStore;
