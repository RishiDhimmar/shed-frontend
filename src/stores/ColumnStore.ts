import { makeAutoObservable, runInAction, reaction } from "mobx";
import { v4 as uuidv4 } from "uuid";
import baseplateStore, { BaseplateType } from "./BasePlateStore";
import wallStore from "./WallStore";

export interface Column {
  id: string;
  width: number;
  length: number;
  points: number[][];
  wall: "horizontal" | "vertical" | "corner";
}

// type PlateType = "corner" | "horizontal" | "vertical";
// type WallPosition = "left" | "right" | "top" | "bottom";

export class ColumnStore {
  cornerWidth: number = 0;
  cornerLength: number = 0;
  horizontalWidth: number = 0;
  horizontalLength: number = 0;
  verticalWidth: number = 0;
  verticalLength: number = 0;

  columns: Column[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    reaction(
      () => [
        baseplateStore.basePlates.slice(),
        wallStore.externalWallPoints.slice(),
      ],
      () => this.generateColumns()
    );
  }

  // Setter methods remain the same
  setCornerWidth(newWidth: number) {
    runInAction(() => {
      this.cornerWidth = newWidth;
    });
    this.generateColumns();
  }

  setCornerLength(newLength: number) {
    runInAction(() => {
      this.cornerLength = newLength;
    });
    this.generateColumns();
  }

  setHorizontalWidth(newWidth: number) {
    runInAction(() => {
      this.horizontalWidth = newWidth;
    });
    this.generateColumns();
  }

  setHorizontalLength(newLength: number) {
    runInAction(() => {
      this.horizontalLength = newLength;
    });
    this.generateColumns();
  }

  setVerticalWidth(newWidth: number) {
    runInAction(() => {
      this.verticalWidth = newWidth;
    });
    this.generateColumns();
  }

  setVerticalLength(newLength: number) {
    runInAction(() => {
      this.verticalLength = newLength;
    });
    this.generateColumns();
  }

  setColumns(newColumns: Column[]) {
    runInAction(() => {
      this.columns = newColumns;
    });
  }

  // Helper method to get plates by type
  private getPlatesByType() {
    const { basePlates } = baseplateStore;
    return {
      corner: basePlates.filter((plate) => plate.type === "corner"),
      horizontal: basePlates.filter((plate) => plate.type === "horizontal"),
      vertical: basePlates.filter((plate) => plate.type === "vertical"),
    };
  }

  // Helper method to check prerequisites
  private checkPrerequisites() {
    const platesByType = this.getPlatesByType();
    const hasRequiredPlates = Object.values(platesByType).some(
      (plates) => plates.length > 0
    );
    const hasWallPoints = wallStore.externalWallPoints.length >= 4;

    return { hasRequiredPlates, hasWallPoints, platesByType };
  }

  // Create a corner column
  private createCornerColumn(
    cornerIndex: number,
    wallPoints: number[][],
    dimensions: { width: number; length: number }
  ): Column {
    const { width, length } = dimensions;

    // Positions matrix for the four corners
    const positionConfigs = [
      // Top-left
      [
        [wallPoints[0][0], wallPoints[0][1], 0],
        [wallPoints[0][0] + length, wallPoints[0][1], 0],
        [wallPoints[0][0] + length, wallPoints[0][1] + width, 0],
        [wallPoints[0][0], wallPoints[0][1] + width, 0],
      ],
      // Top-right
      [
        [wallPoints[1][0], wallPoints[1][1], 0],
        [wallPoints[1][0] - length, wallPoints[1][1], 0],
        [wallPoints[1][0] - length, wallPoints[1][1] + width, 0],
        [wallPoints[1][0], wallPoints[1][1] + width, 0],
      ],
      // Bottom-right
      [
        [wallPoints[2][0], wallPoints[2][1], 0],
        [wallPoints[2][0] - length, wallPoints[2][1], 0],
        [wallPoints[2][0] - length, wallPoints[2][1] - width, 0],
        [wallPoints[2][0], wallPoints[2][1] - width, 0],
      ],
      // Bottom-left
      [
        [wallPoints[3][0], wallPoints[3][1], 0],
        [wallPoints[3][0] + length, wallPoints[3][1], 0],
        [wallPoints[3][0] + length, wallPoints[3][1] - width, 0],
        [wallPoints[3][0], wallPoints[3][1] - width, 0],
      ],
    ];

    return {
      id: uuidv4(),
      width,
      length,
      wall: "corner",
      points: positionConfigs[cornerIndex],
    };
  }

  // Create a horizontal column
  private createHorizontalColumn(
    plate: any,
    plateConfig: any,
    wallThickness: number
  ): Column {
    const { x, y, wall } = plate;

    const columnWidth =
      Math.abs(plateConfig.width) +
      (plateConfig.offsetY || 0) +
      wallThickness +
      this.horizontalWidth;

    const columnLength =
      Math.abs(plateConfig.length) +
      (plateConfig.offsetX || 0) +
      wallThickness +
      this.horizontalLength;

    const effectiveWidth =
      wallThickness < plateConfig.width
        ? plateConfig.width / 2
        : wallThickness / 2;

    const offset = effectiveWidth + this.horizontalWidth / 2;

    let points;
    if (wall === "left") {
      points = [
        [x + plateConfig.length / 2 + this.horizontalLength, y - offset],
        [
          x -
            plateConfig.length / 2 -
            (plateConfig.offsetX ?? 0) -
            wallThickness,
          y - offset,
        ],
        [
          x -
            plateConfig.length / 2 -
            (plateConfig.offsetX ?? 0) -
            wallThickness,
          y + offset,
        ],
        [x + plateConfig.length / 2 + this.horizontalLength, y + offset],
      ];
    } else {
      points = [
        [
          x +
            plateConfig.length / 2 +
            (plateConfig.offsetX ?? 0) +
            wallThickness,
          y - offset,
        ],
        [x - plateConfig.length / 2 - this.horizontalLength, y - offset],
        [x - plateConfig.length / 2 - this.horizontalLength, y + offset],
        [
          x +
            plateConfig.length / 2 +
            (plateConfig.offsetX ?? 0) +
            wallThickness,
          y + offset,
        ],
      ];
    }

    return {
      id: uuidv4(),
      width: columnWidth,
      length: columnLength,
      wall: "horizontal",
      points,
    };
  }

  // Create a vertical column
  private createVerticalColumn(
    plate: any,
    plateConfig: any,
    wallThickness: number
  ): Column {
    const { x, y, wall } = plate;

    const columnWidth =
      Math.abs(plateConfig.width) + (plateConfig.offsetY || 0);
    const columnLength =
      Math.abs(plateConfig.length) + (plateConfig.offsetX || 0);

    const effectiveLength =
      wallThickness < plateConfig.length
        ? plateConfig.length / 2
        : wallThickness / 2;

    const widthOffset = this.verticalWidth / 4;

    let points;
    if (wall === "bottom") {
      points = [
        [
          x - effectiveLength - widthOffset,
          y -
            plateConfig.width / 2 -
            (plateConfig.offsetY ?? 0) -
            wallThickness,
        ],
        [
          x - effectiveLength - widthOffset,
          y +
            plateConfig.width / 2 +
            (plateConfig.offsetY ?? 0) +
            this.verticalLength,
        ],
        [
          x + effectiveLength + widthOffset,
          y +
            plateConfig.width / 2 +
            (plateConfig.offsetY ?? 0) +
            this.verticalLength,
        ],
        [
          x + effectiveLength + widthOffset,
          y -
            plateConfig.width / 2 -
            (plateConfig.offsetY ?? 0) -
            wallThickness,
        ],
      ];
    } else if (wall === "top") {
      points = [
        [
          x - effectiveLength - widthOffset,
          y +
            plateConfig.width / 2 +
            (plateConfig.offsetY ?? 0) +
            wallThickness,
        ],
        [
          x - effectiveLength - widthOffset,
          y - plateConfig.width / 2 - this.verticalLength,
        ],
        [
          x + effectiveLength + widthOffset,
          y - plateConfig.width / 2 - this.verticalLength,
        ],
        [
          x + effectiveLength + widthOffset,
          y +
            plateConfig.width / 2 +
            (plateConfig.offsetY ?? 0) +
            wallThickness,
        ],
      ];
    }

    return {
      id: uuidv4(),
      width: columnWidth,
      length: columnLength,
      wall: "vertical",
      points: points!,
    };
  }

  // Generate corner columns
  private generateCornerColumns(
    cornerPlates: any[],
    wallPoints: number[][]
  ): Column[] {
    if (cornerPlates.length === 0) return [];

    const plateConfig =
      baseplateStore.config[cornerPlates[0].type as BaseplateType];
    const { wallThickness } = wallStore;

    const columnWidth =
      Math.abs(plateConfig.width) +
      (plateConfig.offsetY || 0) +
      wallThickness +
      this.cornerLength;

    const columnLength =
      Math.abs(plateConfig.length) +
      (plateConfig.offsetX || 0) +
      wallThickness +
      this.cornerWidth;

    // Generate all four corners
    return [0, 1, 2, 3].map((index) =>
      this.createCornerColumn(index, wallPoints, {
        width: columnWidth,
        length: columnLength,
      })
    );
  }

  // Main method to generate all columns
  generateColumns() {
    const { hasRequiredPlates, hasWallPoints, platesByType } =
      this.checkPrerequisites();

    if (!hasRequiredPlates || !hasWallPoints) {
      runInAction(() => {
        this.columns = [];
      });
      return;
    }

    const newColumns: Column[] = [];
    const { wallThickness } = wallStore;
    const wallPoints = wallStore.externalWallPoints;

    // Generate corner columns
    if (platesByType.corner.length > 0) {
      newColumns.push(
        ...this.generateCornerColumns(platesByType.corner, wallPoints)
      );
    }

    // Generate horizontal columns
    platesByType.horizontal.forEach((plate) => {
      const plateConfig = baseplateStore.config[plate.type];
      newColumns.push(
        this.createHorizontalColumn(plate, plateConfig, wallThickness)
      );
    });

    // Generate vertical columns
    platesByType.vertical.forEach((plate) => {
      const plateConfig = baseplateStore.config[plate.type];
      newColumns.push(
        this.createVerticalColumn(plate, plateConfig, wallThickness)
      );
    });

    // Update the store with the new columns
    runInAction(() => {
      this.columns = newColumns;
    });
  }
}

// Create and export the singleton instance
const columnStore = new ColumnStore();
export default columnStore;
