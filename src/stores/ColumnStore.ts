import { makeAutoObservable, runInAction, reaction } from "mobx";
import { v4 as uuidv4 } from "uuid";

import baseplateStore from "./BasePlateStore";
import wallStore from "./WallStore";
import { getRectanglePoints } from "../utils/GeometryUtils";

export interface Column {
  id: string;
  width: number;
  length: number;
  points: number[][]; // Array of four corner points
}

export class ColumnStore {
  width = 0;
  length = 0;
  columns: Column[] = [];

  constructor(width = 0, length = 0) {
    this.width = width;
    this.length = length;
    makeAutoObservable(this, {}, { autoBind: true });
    reaction(
      () => baseplateStore.basePlates.slice(),
      () => this.generateColumns()
    );
  }

  setWidth(newWidth: number) {
    runInAction(() => {
      this.width = newWidth;
    });
  }

  setLength(newLength: number) {
    runInAction(() => {
      this.length = newLength;
    });
  }

  generateColumns() {
    const cornerPlates = baseplateStore.basePlates.filter(
      (plate) => plate.type === "corner"
    );

    runInAction(() => {
      this.columns = [];
    });

    if (cornerPlates.length === 0 || wallStore.externalWallPoints.length === 0)
      return;

    const newColumns: Column[] = [];

    cornerPlates.forEach((plate) => {
      const { x, y } = plate;
      const plateConfig = baseplateStore.config[plate.type];

      // Calculate column dimensions
      const columnWidth =
        Math.abs(plateConfig.width) +
        (plateConfig.offsetY || 0) +
        wallStore.wallThickness +
        0.3;

      const columnLength =
        Math.abs(plateConfig.length) +
        (plateConfig.offsetX || 0) +
        wallStore.wallThickness +
        0.5;

      const wallPoints = wallStore.externalWallPoints;
      newColumns.push(
        {
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [wallPoints[0][0], wallPoints[0][1], 0],
            [wallPoints[0][0] + columnLength, wallPoints[0][1], 0],
            [
              wallPoints[0][0] + columnLength,
              wallPoints[0][1] + columnWidth,
              0,
            ],
            [wallPoints[0][0], wallPoints[0][1] + columnWidth, 0],
          ],
        },
        {
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [wallPoints[1][0], wallPoints[1][1], 0],
            [wallPoints[1][0] - columnLength, wallPoints[1][1], 0],
            [
              wallPoints[1][0] - columnLength,
              wallPoints[1][1] + columnWidth,
              0,
            ],
            [wallPoints[1][0], wallPoints[1][1] + columnWidth, 0],
          ],
        },
        {
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [wallPoints[2][0], wallPoints[2][1], 0],
            [wallPoints[2][0] - columnLength, wallPoints[2][1], 0],
            [
              wallPoints[2][0] - columnLength,
              wallPoints[2][1] - columnWidth,
              0,
            ],
            [wallPoints[2][0], wallPoints[2][1] - columnWidth, 0],
          ],
        },
        {
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [wallPoints[3][0], wallPoints[3][1], 0],
            [wallPoints[3][0] + columnLength, wallPoints[3][1], 0],
            [
              wallPoints[3][0] + columnLength,
              wallPoints[3][1] - columnWidth,
              0,
            ],
            [wallPoints[3][0], wallPoints[3][1] - columnWidth, 0],
          ],
        }
      );
    });

    runInAction(() => {
      this.columns = newColumns;
    });
  }
}

const columnStore = new ColumnStore();
export default columnStore;
