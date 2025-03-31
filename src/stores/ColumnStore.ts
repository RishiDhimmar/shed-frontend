import { makeAutoObservable, runInAction, reaction } from "mobx";
import { v4 as uuidv4 } from "uuid";
import baseplateStore from "./BasePlateStore";
import wallStore from "./WallStore";

export interface Column {
  id: string;
  width: number;
  length: number;
  points: number[][]; // Array of four corner points
}

class ColumnStore {
  columns: Column[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    // React to changes in baseplates and external wall points
    reaction(
      () => [
        baseplateStore.basePlates.slice(),
        wallStore.externalWallPoints.slice(),
      ],
      () => this.generateColumns()
    );
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
      const { x, y } = plate;
      const plateConfig = baseplateStore.config[plate.type];

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

    // Generate columns for horizontal plates
    horizontalPlates.forEach((plate) => {
      const { x, y } = plate;
      const plateConfig = baseplateStore.config[plate.type];

      const columnWidth =
        Math.abs(plateConfig.width) +
        (plateConfig.offsetY || 0) +
        wallStore.wallThickness;
      // 0.3;

      const columnLength =
        Math.abs(plateConfig.length) +
        (plateConfig.offsetX || 0) +
        wallStore.wallThickness;
      // 0.5;

      console.log(plate.wall);
      if (plate.wall === "left") {
        newColumns.push({
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
           
            [
              x + plateConfig.length / 2 + plateConfig.offsetX + 0.5,
              y - columnWidth / 2,
              0,
            ],
            [
              x -
                plateConfig.length/2  -
                plateConfig.offsetX -
                wallStore.wallThickness,
              y - columnWidth / 2,
              0,
            ],
            [
              x -
                plateConfig.length/2  -
                plateConfig.offsetX  -
                wallStore.wallThickness,
              y + columnWidth / 2,
              0,
            ],
            [
              x + plateConfig.length / 2 + plateConfig.offsetX + 0.5,
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
                plateConfig.offsetX +
                wallStore.wallThickness,
              y - columnWidth / 2,
              0,
            ],
            [
              x - plateConfig.length / 2 - plateConfig.offsetX - 0.5,
              y - columnWidth / 2,
              0,
            ],
            [
              x - plateConfig.length / 2 - plateConfig.offsetX - 0.5,
              y + columnWidth / 2,
              0,
            ],
            [
              x +
                plateConfig.length / 2 +
                plateConfig.offsetX +
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
        wallStore.wallThickness;
      // 0.3;

      const columnLength =
        Math.abs(plateConfig.length) +
        (plateConfig.offsetX || 0) +
        wallStore.wallThickness;
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
                plateConfig.offsetY -
                wallStore.wallThickness,
              0,
            ],
            [
              x - columnLength / 2,
              y + plateConfig.width / 2 + plateConfig.offsetY + 0.5,
              0,
            ],
            [
              x + columnLength / 2,
              y + plateConfig.width / 2 + plateConfig.offsetY + 0.5,
              0,
            ],
            [
              x + columnLength / 2,
              y -
                plateConfig.width / 2 -
                plateConfig.offsetY -
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
                plateConfig.offsetY +
                wallStore.wallThickness,
              0,
            ],
            [
              x - columnLength / 2,
              y - plateConfig.width / 2 - plateConfig.offsetY - 0.5,
              0,
            ],
            [
              x + columnLength / 2,
              y - plateConfig.width / 2 - plateConfig.offsetY  -  0.5,
              0,
            ],
            [
              x + columnLength / 2,
              y +
                plateConfig.width / 2 +
                plateConfig.offsetY +
                wallStore.wallThickness,
              0,
            ]
          ],
        });
      }
    });

    runInAction(() => {
      this.columns = newColumns;
    });
  }
}

const columnStore = new ColumnStore();
export default columnStore;
