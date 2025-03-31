import { makeAutoObservable, runInAction, reaction } from "mobx";
import { v4 as uuidv4 } from "uuid";
import baseplateStore from "./BasePlateStore";
import wallStore from "./WallStore";

export interface Column {
  id: string;
  width: number;
  length: number;
 
  points: number[][];
}

export class ColumnStore {
  cornerWidth: number;
  cornerLength: number;
  horizontalWidth: number;
  horizontalLength: number;
  verticalWidth: number;
  verticalLength: number;
  columns: Column[] = [];

  constructor(
    cornerWidth: number = 0,
    cornerLength: number = 0,
    horizontalWidth: 0,
    horizontalLength: 0,
    verticalWidth: 0,
    verticalLength: 0
  ) {
    this.cornerLength = cornerLength;
    this.cornerWidth = cornerWidth;
    this.horizontalWidth = horizontalWidth;
    this.horizontalLength = horizontalLength;
    this.verticalWidth = verticalWidth;
    this.verticalLength = verticalLength;

    makeAutoObservable(this, {}, { autoBind: true });
    reaction(
      () => baseplateStore.basePlates.slice(),
      () => this.generateColumns()
    );
  }

  setCornerWidth(newWidth: number) {
    runInAction(() => {
      this.cornerWidth = newWidth;
    });
  }

  setCornerLength(newLength: number) {
    runInAction(() => {
      this.cornerLength = newLength;
    });
  }

  setHorizontalWidth(newWidth: number) {
    runInAction(() => {
      this.horizontalWidth = newWidth;
    });
  }

  setHorizontalLength(newLength: number) {
    runInAction(() => {
      this.horizontalLength = newLength;
    });
  }

  setVerticalWidth(newWidth: number) {
    runInAction(() => {
      this.verticalWidth = newWidth;
    });
  }

  setVerticalLength(newLength: number) {
    runInAction(() => {
      this.verticalLength = newLength;
    });
  }

  generateColumns() {
    const cornerPlates = baseplateStore.basePlates.filter(
      (plate) => plate.type === "corner"
    );

    const horizontalPlates = baseplateStore.basePlates.filter(
      (plate) => plate.type === "horizontal"
    );

    const verticalPlates = baseplateStore.basePlates.filter(
      (plate) => plate.type === "vertical"
    );

    runInAction(() => {
      this.columns = [];
    });

    if (
      (cornerPlates.length === 0 && horizontalPlates.length === 0) ||
      wallStore.externalWallPoints.length === 0
    )
      return;

    const newColumns: Column[] = [];

    // Generate columns for corner plates
    cornerPlates.forEach((plate) => {
      const plateConfig = baseplateStore.config[plate.type];

      const columnWidth =
        Math.abs(plateConfig.width) +
        (plateConfig.offsetY || 0) +
        wallStore.wallThickness +
        this.cornerLength +
        0.3;

      const columnLength =
        Math.abs(plateConfig.length) +
        (plateConfig.offsetX || 0) +
        wallStore.wallThickness +
        this.cornerWidth +
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

    // Generate columns for horizontal plates
    horizontalPlates.forEach((plate) => {
      const { x, y } = plate;
      const plateConfig = baseplateStore.config[plate.type];

      const columnWidth =
        Math.abs(plateConfig.width) +
        (plateConfig.offsetY || 0) +
        wallStore.wallThickness + 
        this.horizontalLength;

      // 0.3;

      const columnLength =
        Math.abs(plateConfig.length) +
        (plateConfig.offsetX || 0) +
        wallStore.wallThickness +
        this.horizontalWidth;
      // 0.5;

      if (plate.wall === "left") {
        newColumns.push({
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [
              x + plateConfig.length / 2 + (plateConfig.offsetX ?? 0) + 0.5,
              y - columnWidth / 2,
              0,
            ],
            [
              x -
                plateConfig.length / 2 -
                (plateConfig.offsetX ?? 0) -
                wallStore.wallThickness,
              y - columnWidth / 2,
              0,
            ],
            [
              x -
                plateConfig.length / 2 -
                (plateConfig.offsetX ?? 0) -
                wallStore.wallThickness,
              y + columnWidth / 2,
              0,
            ],
            [
              x + plateConfig.length / 2 + (plateConfig.offsetX ?? 0) + 0.5,
              y + columnWidth / 2,
              0,
            ],
          ],
        });
      } else {
        newColumns.push({
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [
              x +
                plateConfig.length / 2 +
                (plateConfig.offsetX ?? 0) +
                wallStore.wallThickness,
              y - columnWidth / 2,
              0,
            ],
            [
              x - plateConfig.length / 2 - (plateConfig.offsetX ?? 0) - 0.5,
              y - columnWidth / 2,
              0,
            ],
            [
              x - plateConfig.length / 2 - (plateConfig.offsetX ?? 0) - 0.5,
              y + columnWidth / 2,
              0,
            ],
            [
              x +
                plateConfig.length / 2 +
                (plateConfig.offsetX ?? 0) +
                wallStore.wallThickness,
              y + columnWidth / 2,
              0,
            ],
          ],
        });
      }
    });

    // Generate columns for vertical plates
    verticalPlates.forEach((plate) => {
      const { x, y } = plate;
      const plateConfig = baseplateStore.config[plate.type];

      const columnWidth =
        Math.abs(plateConfig.width) +
        (plateConfig.offsetY || 0) +
        wallStore.wallThickness + 
        this.verticalLength;
      // 0.3;

      const columnLength =
        Math.abs(plateConfig.length) +
        (plateConfig.offsetX || 0) +
        wallStore.wallThickness +
        this.verticalWidth;
      // 0.5;

      if (plate.wall === "bottom") {
        newColumns.push({
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [
              x - columnLength / 2,
              y -
                plateConfig.width / 2 -
                (plateConfig.offsetY ?? 0) -
                wallStore.wallThickness,
              0,
            ],
            [
              x - columnLength / 2,
              y + plateConfig.width / 2 + (plateConfig.offsetY ?? 0) + 0.5,
              0,
            ],
            [
              x + columnLength / 2,
              y + plateConfig.width / 2 + (plateConfig.offsetY ?? 0) + 0.5,
              0,
            ],
            [
              x + columnLength / 2,
              y -
                plateConfig.width / 2 -
                (plateConfig.offsetY ?? 0) -
                wallStore.wallThickness,
              0,
            ],
          ],
        });
      } else {
        newColumns.push({
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [
              x - columnLength / 2,
              y +
                plateConfig.width / 2 +
                (plateConfig.offsetY ?? 0) +
                wallStore.wallThickness,
              0,
            ],
            [
              x - columnLength / 2,
              y - plateConfig.width / 2 - (plateConfig.offsetY ?? 0) - 0.5,
              0,
            ],
            [
              x + columnLength / 2,
              y - plateConfig.width / 2 - (plateConfig.offsetY ?? 0) - 0.5,
              0,
            ],
            [
              x + columnLength / 2,
              y +
                plateConfig.width / 2 +
                (plateConfig.offsetY ?? 0) +
                wallStore.wallThickness,
              0,
            ],
          ],
        });
      }
    });

    runInAction(() => {
      this.columns = newColumns;
    });
  }
}

const columnStore = new ColumnStore(0,0,0,0,0,0);
export default columnStore;
