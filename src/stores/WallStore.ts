import { makeAutoObservable, reaction, runInAction } from "mobx";
import { fetchWallData } from "../components/threeenv/inputs/Fetch";
import { getRectanglePoints } from "../utils/GeometryUtils";
import uiStore from "./UIStore";
import baseplateStore from "./BasePlateStore";

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

    // Whenever width, height, or wallThickness change, regenerate wall points.
    reaction(
      () => [this.width, this.height, this.wallThickness],
      ([newWidth, newHeight]) => {
        if (newWidth > 0 && newHeight > 0) {
          this.generateWallPoints();
        }
      }
    );
  }

  setWidth(newWidth: number) {
    this.width = newWidth;
    uiStore.setModified(true);
  }

  setHeight(newHeight: number) {
    this.height = newHeight;
    uiStore.setModified(true);
  }

  setWallThickness(newThickness: number) {
    this.wallThickness = newThickness;
    uiStore.setModified(true);
  }

  setWallPoints(external: number[][], internal: number[][]) {
    this.externalWallPoints = external; // Convert to Point[] for external;
    this.internalWallPoints = internal; // Convert to Point[] for internal;
    this.calculateDimensions();
    this.calculateThickness();
    uiStore.setModified(true);
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
      this.calculateThickness();
      this.calculateDimensions();
    } else {
      console.warn("No valid entities found in wall data");
    }
  }

  calculateDimensions() {
    if (this.externalWallPoints.length === 0) return;

    const xValues = this.externalWallPoints.map((point) => point[0]);
    const yValues = this.externalWallPoints.map((point) => point[1]);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    runInAction(() => {
      this.width = maxX - minX;
      this.height = maxY - minY;
    });
  }

  calculateThickness() {
    if (
      this.externalWallPoints.length === 0 ||
      this.internalWallPoints.length === 0
    )
      return;

    let totalThickness = 0;
    let count = 0;

    for (
      let i = 0;
      i <
      Math.min(this.externalWallPoints.length, this.internalWallPoints.length);
      i++
    ) {
      const ey = this.externalWallPoints[i][1]; // External Y
      const iy = this.internalWallPoints[i][1]; // Internal Y

      const thickness = Math.abs(ey - iy);
      totalThickness += thickness;
      count++;
    }

    if (count > 0) {
      runInAction(() => {
        this.wallThickness = totalThickness / count;
      });
    }
  }

  // Generates new wall points based on the current dimensions.
  generateWallPoints() {
    // External wall as a rectangle from (0,0) to (width,height)
    const external = getRectanglePoints(this.width, this.height);
    // Internal wall inset uniformly by wallThickness from all sides.
    const internal = getRectanglePoints(
      this.width - 2 * this.wallThickness,
      this.height - 2 * this.wallThickness
    );

    this.setWallPoints(external, internal);
  }
  generateWallPointsFromBaseplates() {
    const basePlates = baseplateStore.basePlates;
    if (basePlates.length === 0) return;

    const cornerConfig = baseplateStore.config.corner;

    const cornerPlates = basePlates.filter((p) => p.type === "corner");
    if (cornerPlates.length < 3) {
      console.warn("Need at least 3 corner plates to define an inner wall");
      return;
    }

    const allPoints = cornerPlates.flatMap((p) => p.points);

    const xValues = allPoints.map((p) => p[0]);
    const yValues = allPoints.map((p) => p[1]);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    console.log("Wall bounds from corner plate points:", {
      minX,
      maxX,
      minY,
      maxY,
    });

    const innerWallPoints = [
      [minX - (cornerConfig.offsetX ?? 0), minY - (cornerConfig.offsetY ?? 0)],
      [maxX + (cornerConfig.offsetX ?? 0), minY - (cornerConfig.offsetY ?? 0)],
      [maxX + (cornerConfig.offsetX ?? 0), maxY + (cornerConfig.offsetY ?? 0)],
      [minX - (cornerConfig.offsetX ?? 0), maxY + (cornerConfig.offsetY ?? 0)],
    ];

    this.wallThickness = 0.5;

    const externalWallPoints = [
      [minX - this.wallThickness, minY - this.wallThickness],
      [maxX + this.wallThickness, minY - this.wallThickness],
      [maxX + this.wallThickness, maxY + this.wallThickness],
      [minX - this.wallThickness, maxY + this.wallThickness],
    ];

    // Step 5: Set wall points and calculate values
    this.externalWallPoints = externalWallPoints;
    this.internalWallPoints = innerWallPoints;
    this.calculateThickness();
    this.calculateDimensions();
  }

  // Computed getters for inner dimensions without modifying other logic.
  get innerWidth() {
    return Math.max(0, this.width - this.wallThickness);
  }

  get innerHeight() {
    return Math.max(0, this.height - 2 * this.wallThickness);
  }
}

const wallStore = new WallStore();
export default wallStore;
