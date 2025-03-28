import { makeAutoObservable, runInAction } from "mobx";
import { v4 as uuidv4 } from "uuid";
import { getRectanglePoints } from "../utils/geometryUtils";
import baseplateStore from "./BasePlateStore";
import basePlotStore from "./BasePlotStore";
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
  }

  generateColumns() {
    const cornerPlates = baseplateStore.basePlates.filter(
      (bp) => bp.type === "corner"
    );

    if (cornerPlates.length === 0) return;

    runInAction(() => {
      this.columns = [];
    });

    const newColumns: Column[] = [];

    cornerPlates.forEach((plate) => {
      const { x, y, points } = plate;
      const columnWidth =
        Math.abs(baseplateStore.config[plate.type].width ) +
        baseplateStore.config[plate.type].offsetY * 2+
        wallStore.wallThickness * 2 ; // Default width
      const columnLength =
        Math.abs(baseplateStore.config[plate.type].length) +
        baseplateStore.config[plate.type].offsetX * 2+
        wallStore.wallThickness * 2; 

      console.log(baseplateStore.config[plate.type].length, baseplateStore.config[plate.type].offsetX,  baseplateStore.config[plate.type].offsetY , wallStore.wallThickness);

      // Generate one column per baseplate
      newColumns.push({
        id: uuidv4(),
        width: columnWidth,
        length: columnLength,
        points: getRectanglePoints(columnLength , columnWidth, [x, y]),
      });
    });

    runInAction(() => {
      this.columns = newColumns;
    });
  }
}

const columnStore = new ColumnStore();
export default columnStore;
