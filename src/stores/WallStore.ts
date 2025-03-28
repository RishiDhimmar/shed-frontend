import { makeAutoObservable } from "mobx";
import { fetchWallData } from "../components/threeenv/inputs/Fetch";
import { arrayToPointArray, pointArrayToArray } from "../utils/ConversionUtils";

export class WallStore {
  width = 0;
  height = 0;
  wallThickness = 0;
  externalWallPoints = [];
  internalWallPoints = [];

  constructor(width = 0, height = 0, wallThickness = 0) {
    this.width = width;
    this.height = height;
    this.wallThickness = wallThickness;
    makeAutoObservable(this);
  }

  async loadWallData() {
    try {
      const data = await fetchWallData();
      // debugger;
      console.log("Fetched Wall Data:", JSON.stringify(data));
      this.processWallData(data);
    } catch (error) {
      console.error("Error loading wall data:", error);
    }
  }

  processWallData(data) {
    // debugger;
    if (data?.entities?.length) {
      const externalPolyline = data.entities[0]?.vertices || [];
      const internalPolyline = data.entities[1]?.vertices || [];

      console.log("External Polyline:", externalPolyline);
      console.log("Internal Polyline:", internalPolyline);

      const newExternalPoints = externalPolyline.map((point) => [
        point.x,
        point.y,
        0,
      ]);
      console.log(newExternalPoints);

      this.setExternalWallPoints(newExternalPoints);

      const newInternalPoints = internalPolyline.map((point) => [
        point.x,
        point.y,
        0,
      ]);
      this.internalWallPoints = newInternalPoints;

      console.log("Processed External Wall Points:", this.externalWallPoints);
      console.log("Processed Internal Wall Points:", this.internalWallPoints);
    } else {
      console.warn("No valid entities found in wall data");
    }
  }

  setExternalWallPoints(points) {
    this.externalWallPoints = points;
  }
}

const wallStore = new WallStore();
export default wallStore;
