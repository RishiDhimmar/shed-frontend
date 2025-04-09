import { makeAutoObservable, runInAction, reaction } from "mobx";
import { v4 as uuidv4 } from "uuid";
import baseplateStore, { BaseplateType } from "./BasePlateStore";
import wallStore from "./WallStore";
import uiStore from "./UIStore";

export interface Column {
  id: string;
  width: number;
  length: number;
  points: number[][];
  wall: "horizontal" | "vertical" | "corner";
}

export class ColumnStore {
  cornerWidth: number = 0;
  cornerLength: number = 0;
  horizontalWidth: number = 0;
  horizontalLength: number = 0;
  verticalWidth: number = 0;
  verticalLength: number = 0;

  columns: Column[] = [];

  // Store previous valid values to revert in case of overlap
  previousValues = {
    cornerWidth: 0,
    cornerLength: 0,
    horizontalWidth: 0,
    horizontalLength: 0,
    verticalWidth: 0,
    verticalLength: 0,
  };

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    // Initialize previous values
    this.previousValues = {
      cornerWidth: this.cornerWidth,
      cornerLength: this.cornerLength,
      horizontalWidth: this.horizontalWidth,
      horizontalLength: this.horizontalLength,
      verticalWidth: this.verticalWidth,
      verticalLength: this.verticalLength,
    };

    reaction(
      () => [
        baseplateStore.basePlates.slice(),
        wallStore.externalWallPoints.slice(),
      ],
      () => this.generateColumns()
    );
  }

  // Helper method to check if two polygons overlap
  checkOverlap(rect1: number[][], rect2: number[][]): boolean {
    // Get bounding boxes for quick overlap check
    const rect1BBox = this.getBoundingBox(rect1);
    const rect2BBox = this.getBoundingBox(rect2);

    // Check if bounding boxes overlap
    if (
      rect1BBox.maxX < rect2BBox.minX ||
      rect1BBox.minX > rect2BBox.maxX ||
      rect1BBox.maxY < rect2BBox.minY ||
      rect1BBox.minY > rect2BBox.maxY
    ) {
      return false; // No overlap
    }

    // If bounding boxes overlap, we have an overlap
    return true;
  }

  // Helper to get bounding box of a polygon
  getBoundingBox(points: number[][]) {
    if (!points || points.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);

    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }

  // Modified setter methods with overlap prevention
  setCornerWidth(newWidth: number) {
    this.previousValues.cornerWidth = this.cornerWidth;

    runInAction(() => {
      this.cornerWidth = newWidth;
      uiStore.setModified(true);
    });

    const hasOverlap = this.generateColumns();

    if (hasOverlap) {
      runInAction(() => {
        this.cornerWidth = this.previousValues.cornerWidth;
      });

      this.generateColumns();
      console.warn("Column width change reverted due to overlap");
      alert("Cannot increase size: This would cause columns to overlap");

      return false;
    }

    return true;
  }

  setCornerLength(newLength: number) {
    this.previousValues.cornerLength = this.cornerLength;

    runInAction(() => {
      this.cornerLength = newLength;
      uiStore.setModified(true);
    });

    const hasOverlap = this.generateColumns();

    if (hasOverlap) {
      runInAction(() => {
        this.cornerLength = this.previousValues.cornerLength;
      });

      this.generateColumns();
      console.warn("Column length change reverted due to overlap");
      alert("Cannot increase size: This would cause columns to overlap");

      return false;
    }

    return true;
  }

  setHorizontalWidth(newWidth: number) {
    this.previousValues.horizontalWidth = this.horizontalWidth;

    runInAction(() => {
      this.horizontalWidth = newWidth;
      uiStore.setModified(true);
    });

    const hasOverlap = this.generateColumns();

    if (hasOverlap) {
      runInAction(() => {
        this.horizontalWidth = this.previousValues.horizontalWidth;
      });

      this.generateColumns();
      console.warn("Column width change reverted due to overlap");
      alert("Cannot increase size: This would cause columns to overlap");

      return false;
    }

    return true;
  }

  setHorizontalLength(newLength: number) {
    this.previousValues.horizontalLength = this.horizontalLength;

    runInAction(() => {
      this.horizontalLength = newLength;
      uiStore.setModified(true);
    });

    const hasOverlap = this.generateColumns();

    if (hasOverlap) {
      runInAction(() => {
        this.horizontalLength = this.previousValues.horizontalLength;
      });

      this.generateColumns();
      console.warn("Column length change reverted due to overlap");
      alert("Cannot increase size: This would cause columns to overlap");

      return false;
    }

    return true;
  }

  setVerticalWidth(newWidth: number) {
    this.previousValues.verticalWidth = this.verticalWidth;

    runInAction(() => {
      this.verticalWidth = newWidth;
      uiStore.setModified(true);
    });

    const hasOverlap = this.generateColumns();

    if (hasOverlap) {
      runInAction(() => {
        this.verticalWidth = this.previousValues.verticalWidth;
      });

      this.generateColumns();
      console.warn("Column width change reverted due to overlap");
      alert("Cannot increase size: This would cause columns to overlap");

      return false;
    }

    return true;
  }

  setVerticalLength(newLength: number) {
    this.previousValues.verticalLength = this.verticalLength;

    runInAction(() => {
      this.verticalLength = newLength;
      uiStore.setModified(true);
    });

    const hasOverlap = this.generateColumns();

    if (hasOverlap) {
      runInAction(() => {
        this.verticalLength = this.previousValues.verticalLength;
      });

      this.generateColumns();
      console.warn("Column length change reverted due to overlap");
      alert("Cannot increase size: This would cause columns to overlap");

      return false;
    }

    return true;
  }

  setColumns(newColumns: Column[]) {
    runInAction(() => {
      this.columns = newColumns;
      uiStore.setModified(true);
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
          y + plateConfig.width / 2 + this.verticalLength,
        ],
        [
          x + effectiveLength + widthOffset,
          y + plateConfig.width / 2 + this.verticalLength,
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

  // Main method to generate all columns - now returns boolean to indicate if there's an overlap
  generateColumns(): boolean {
    const { hasRequiredPlates, hasWallPoints, platesByType } =
      this.checkPrerequisites();

    if (!hasRequiredPlates || !hasWallPoints) {
      runInAction(() => {
        this.columns = [];
      });
      return false;
    }

    const newColumns: Column[] = [];
    const { wallThickness } = wallStore;
    const wallPoints = wallStore.externalWallPoints;
    let hasOverlap = false;

    // Generate corner columns
    if (platesByType.corner.length > 0) {
      const cornerColumns = this.generateCornerColumns(
        platesByType.corner,
        wallPoints
      );

      // Check for overlap among corner columns
      for (let i = 0; i < cornerColumns.length; i++) {
        for (let j = i + 1; j < cornerColumns.length; j++) {
          if (
            this.checkOverlap(cornerColumns[i].points, cornerColumns[j].points)
          ) {
            hasOverlap = true;
            break;
          }
        }
        if (hasOverlap) break;
      }

      // Only add corner columns if there's no overlap
      if (!hasOverlap) {
        newColumns.push(...cornerColumns);
      }
    }

    // If there's no overlap with corner columns, proceed with horizontal columns
    if (!hasOverlap) {
      // Generate horizontal columns
      const horizontalColumns: Column[] = [];
      platesByType.horizontal.forEach((plate) => {
        const plateConfig = baseplateStore.config[plate.type];
        const column = this.createHorizontalColumn(
          plate,
          plateConfig,
          wallThickness
        );
        horizontalColumns.push(column);
      });

      // Check for overlaps among all columns
      for (const column of horizontalColumns) {
        let columnOverlaps = false;

        // Check against existing columns
        for (const existingColumn of newColumns) {
          if (this.checkOverlap(column.points, existingColumn.points)) {
            columnOverlaps = true;
            hasOverlap = true;
            break;
          }
        }

        // Check against other horizontal columns
        if (!columnOverlaps) {
          for (const existingHColumn of horizontalColumns) {
            if (
              column.id !== existingHColumn.id &&
              this.checkOverlap(column.points, existingHColumn.points)
            ) {
              columnOverlaps = true;
              hasOverlap = true;
              break;
            }
          }
        }

        // Add column if no overlap
        if (!columnOverlaps) {
          newColumns.push(column);
        }
      }
    }

    // If there's still no overlap, proceed with vertical columns
    if (!hasOverlap) {
      // Generate vertical columns
      const verticalColumns: Column[] = [];
      platesByType.vertical.forEach((plate) => {
        const plateConfig = baseplateStore.config[plate.type];
        const column = this.createVerticalColumn(
          plate,
          plateConfig,
          wallThickness
        );
        verticalColumns.push(column);
      });

      // Check for overlaps among all columns
      for (const column of verticalColumns) {
        let columnOverlaps = false;

        // Check against existing columns
        for (const existingColumn of newColumns) {
          if (this.checkOverlap(column.points, existingColumn.points)) {
            columnOverlaps = true;
            hasOverlap = true;
            break;
          }
        }

        // Add column if no overlap
        if (!columnOverlaps) {
          newColumns.push(column);
        }
      }
    }

    // Update the store with the new columns if there's no overlap
    if (!hasOverlap) {
      runInAction(() => {
        this.columns = newColumns;
      });
    }

    return hasOverlap;
  }
}

// Create and export the singleton instance
const columnStore = new ColumnStore();
export default columnStore;
