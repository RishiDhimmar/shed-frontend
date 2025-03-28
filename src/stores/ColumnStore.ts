import { makeAutoObservable, runInAction, reaction } from "mobx";
import { v4 as uuidv4 } from "uuid";

import baseplateStore from "./BasePlateStore";
import wallStore from "./WallStore";
import { getRectanglePoints } from "../utils/GeometryUtils";

export interface Column {
  id: string;
  width: number;
  length: number;
  points: number[][];
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
      (bp) => bp.type === "corner"
    );

    runInAction(() => {
      this.columns = [];
    });

    if (cornerPlates.length === 0) return;

    const newColumns: Column[] = [];

    cornerPlates.forEach((plate) => {
      const { x, y } = plate;

      const plateConfig = baseplateStore.config[plate.type];

      const columnWidth =
        Math.abs(plateConfig.width) +
        (plateConfig.offsetY || 0) * 2 +
        wallStore.wallThickness * 2; // Adjusted width

      const columnLength =
        Math.abs(plateConfig.length) +
        (plateConfig.offsetX || 0) * 2 +
        wallStore.wallThickness * 2; // Adjusted length

      newColumns.push({
        id: uuidv4(),
        width: columnWidth,
        length: columnLength,
        points: getRectanglePoints(columnLength, columnWidth, [x, y]),
      });
    });

    runInAction(() => {
      this.columns = newColumns;
    });
  }
}

const columnStore = new ColumnStore();
export default columnStore;
