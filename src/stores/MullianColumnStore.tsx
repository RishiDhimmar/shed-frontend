import { makeAutoObservable, reaction, runInAction } from "mobx";
import { getRectanglePoints } from "../utils/GeometryUtils";
import wallStore from "./WallStore";

class MullionColumnStore {
  mullionLength: number = 0;
  mullionWidth: number = 0;
  mullionPositions: number[][][] = []; // Stores rectangle points for each mullion

  constructor() {
    makeAutoObservable(this);

    // Automatically update mullion positions when wall dimensions change
    reaction(
      () => ({
        width: wallStore.width,
        height: wallStore.height,
        thickness: wallStore.wallThickness,
        externalWallPoints: wallStore.externalWallPoints,
      }),
      () => {
        this.calculateMullions();
      }
    );
  }

  calculateMullions() {
    const { wallThickness, externalWallPoints } = wallStore;

    if (!externalWallPoints.length || wallThickness <= 0) {
      console.warn("Invalid data for mullion calculations");
      return;
    }

    const newMullions: number[][][] = externalWallPoints.map(
      ([x, y], index) => {
        let adjustedX = x;
        let adjustedY = y;

        if (index === 0) {
          adjustedX += wallThickness / 2;
          adjustedY += wallThickness / 2;
        } else if (index === 1) {
          adjustedX -= wallThickness / 2;
          adjustedY += wallThickness / 2;
        } else if (index === 2) {
          adjustedX -= wallThickness / 2;
          adjustedY -= wallThickness / 2;
        } else if (index === 3) {
          adjustedX += wallThickness / 2;
          adjustedY -= wallThickness / 2;
        }

        return getRectanglePoints(wallThickness, wallThickness, [
          adjustedX,
          adjustedY,
        ]);
      }
    );

    runInAction(() => {
      this.mullionPositions = newMullions;
    });
  }

  setMullionLength(value: number) {
    this.mullionLength = value;
  }

  setMullionWidth(value: number) {
    this.mullionWidth = value;
  }
}

const mullionColumnStore = new MullionColumnStore();
export default mullionColumnStore;
