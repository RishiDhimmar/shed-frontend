import { makeAutoObservable, runInAction, reaction } from "mobx";
import { v4 as uuidv4 } from "uuid";
import { getRectanglePoints } from "../utils/geometryUtils";
import baseplateStore from "./BasePlateStore";
import wallStore from "./WallStore";

export interface Column {
  id: string;
  width: number;
  length: number;
  points: number[][];
}

class ColumnStore {
  columns: Column[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    // React to changes in baseplates and regenerate columns automatically
    reaction(
      () => baseplateStore.basePlates.slice(), // Track changes to baseplates
      () => this.generateColumns()
    );
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
