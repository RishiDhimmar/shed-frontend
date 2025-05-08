import { makeAutoObservable, runInAction, reaction } from "mobx";
import { v4 as uuidv4 } from "uuid";
import baseplateStore, { BaseplateType, WallType } from "./BasePlateStore";
import wallStore from "./WallStore";
import uiStore from "./UIStore";
import { generateCenterFromRectanglePoints } from "../utils/GeometryUtils";
import {
  generateBiggerPolygonAtSomeOffset,
  sortPolygon,
  sortPolygonPointsClockwise,
} from "../utils/PolygonUtils";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import foundationStore from "./FoundationStore";

export interface Column {
  id: string;
  width: number;
  length: number;
  points: number[][];
  type: BaseplateType | null;
  wall: WallType | null;
  label: string | null;
  labelPosition: number[] | null;
  labelRotation: number | null;
}

export class ColumnStore {
  cornerWidth: number = 0;
  cornerLength: number = 0;
  horizontalWidth: number = 0;
  horizontalLength: number = 0;
  verticalWidth: number = 0;
  verticalLength: number = 0;
  uniqueColumnNumber = 0;
  internalOffset: number = 0.75;
  polygons: number[][][] = [];

  columns: Column[] = [];

  // columnInputs = {
  //   "+x": 75,
  //   "-x": 75,
  //   "+y": 75,
  //   "-y": 75,
  // };
  columnInputs = {};

  private offsetDistance = 0.075;

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
    if (!points || points.length === 0)
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
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
  setInternalOffset(newOffset: number) {
    runInAction(() => {
      this.internalOffset = newOffset;
      uiStore.setModified(true);
    });
  }
  setPolygons(newPolygons: number[][][]) {
    runInAction(() => {
      this.polygons = newPolygons;
      uiStore.setModified(true);
    });
  }
  setColumnInputs(newColumnInputs) {
    runInAction(() => {
      this.columnInputs = newColumnInputs;
      uiStore.setModified(true);
    });
    this.generateColumnPolygons();
    foundationStore.generateFoundations();
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
    dimensions: { width: number; length: number },
    wall: WallType | null
  ): Column {
    const { width, length } = dimensions;

    // Positions matrix for the four corners
    const positionConfigs = [
      // Top-left
      [
        [wallPoints[0][0], wallPoints[0][1], 0],
        [wallPoints[0][0] + length + this.offsetDistance, wallPoints[0][1], 0],
        [
          wallPoints[0][0] + length + this.offsetDistance,
          wallPoints[0][1] + width + this.offsetDistance,
          0,
        ],
        [wallPoints[0][0], wallPoints[0][1] + width + this.offsetDistance, 0],
      ],
      // Top-right
      [
        [wallPoints[1][0], wallPoints[1][1], 0],
        [wallPoints[1][0] - length - this.offsetDistance, wallPoints[1][1], 0],
        [
          wallPoints[1][0] - length - this.offsetDistance,
          wallPoints[1][1] + width + this.offsetDistance,
          0,
        ],
        [wallPoints[1][0], wallPoints[1][1] + width + this.offsetDistance, 0],
      ],
      // Bottom-right
      [
        [wallPoints[2][0], wallPoints[2][1], 0],
        [wallPoints[2][0] - length - this.offsetDistance, wallPoints[2][1], 0],
        [
          wallPoints[2][0] - length - this.offsetDistance,
          wallPoints[2][1] - width - this.offsetDistance,
          0,
        ],
        [wallPoints[2][0], wallPoints[2][1] - width - this.offsetDistance, 0],
      ],
      // Bottom-left
      [
        [wallPoints[3][0], wallPoints[3][1], 0],
        [wallPoints[3][0] + length + this.offsetDistance, wallPoints[3][1], 0],
        [
          wallPoints[3][0] + length + this.offsetDistance,
          wallPoints[3][1] - width - this.offsetDistance,
          0,
        ],
        [wallPoints[3][0], wallPoints[3][1] - width - this.offsetDistance, 0],
      ],
    ];

    return {
      id: uuidv4(),
      width,
      length,
      type: "corner",
      points: positionConfigs[cornerIndex],
      wall,
      label: `C${this.uniqueColumnNumber}`,
      labelPosition: [
        generateCenterFromRectanglePoints(positionConfigs[cornerIndex]).X,
        generateCenterFromRectanglePoints(positionConfigs[cornerIndex]).Y,
        0,
      ],
      labelRotation: 0,
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
      Math.abs(plateConfig.width) + (plateConfig.offsetY || 0) + wallThickness;
    // this.horizontalWidth;

    const columnLength =
      Math.abs(plateConfig.length) + (plateConfig.offsetX || 0) + wallThickness;
    // this.horizontalLength;

    const effectiveWidth =
      wallThickness < plateConfig.width ? plateConfig.width : wallThickness / 2;

    let offset = effectiveWidth + this.horizontalWidth / 2;

    if (plateConfig.width + this.offsetDistance * 2 > wallThickness) {
      offset = plateConfig.width / 2 + this.offsetDistance;
    }
    let points;
    if (wall === "left") {
      points = [
        [
          x +
            plateConfig.length / 2 +
            this.horizontalLength +
            this.offsetDistance,
          y - offset,
        ],
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
        [
          x +
            plateConfig.length / 2 +
            this.horizontalLength +
            this.offsetDistance,
          y + offset,
        ],
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
        [
          x -
            plateConfig.length / 2 -
            this.horizontalLength -
            this.offsetDistance,
          y - offset,
        ],
        [
          x -
            plateConfig.length / 2 -
            this.horizontalLength -
            this.offsetDistance,
          y + offset,
        ],
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
      type: "horizontal",
      points,
      wall,
      label: null,
      labelPosition: null,
      labelRotation: 0,
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
      wallThickness < plateConfig.length + this.offsetDistance
        ? plateConfig.length / 2 + this.offsetDistance
        : wallThickness / 2;

    // const widthOffset = this.verticalWidth / 4
    const widthOffset = 0;
    let offset = 0;

    if (plateConfig.length + this.offsetDistance * 2 > wallThickness) {
      offset = 0;
    }

    let points;
    if (wall === "bottom") {
      points = [
        [
          x - effectiveLength - widthOffset - offset,
          y -
            plateConfig.width / 2 -
            (plateConfig.offsetY ?? 0) -
            wallThickness,
        ],
        [
          x - effectiveLength - widthOffset - offset,
          y + plateConfig.width / 2 + this.verticalLength + this.offsetDistance,
        ],
        [
          x + effectiveLength + widthOffset,
          y + plateConfig.width / 2 + this.verticalLength + this.offsetDistance,
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
          y - plateConfig.width / 2 - this.verticalLength - this.offsetDistance,
        ],
        [
          x + effectiveLength + widthOffset,
          y - plateConfig.width / 2 - this.verticalLength - this.offsetDistance,
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
      type: "vertical",
      points: points!,
      wall,
      label: null,
      labelPosition: null,
      labelRotation: 0,
    };
  }

  // Generate corner columns
  private generateCornerColumns(
    cornerPlates: any[],
    wallPoints: number[][]
  ): Column[] {
    if (cornerPlates.length === 0) return [];
    const tempWalls: WallType[] = [
      "bottom-left",
      "bottom-right",
      "top-right",
      "top-left",
    ];

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
      this.createCornerColumn(
        index,
        wallPoints,
        {
          width: columnWidth,
          length: columnLength,
        },
        tempWalls[index]
      )
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

    this.generateColumnLables();

    return hasOverlap;
  }
  // generateColumnLables() {
  //   let count = 1;

  //   const topLeftColumn = this.columns.find(
  //     (column) => column.wall === "top-left"
  //   );
  //   const topRightColumn = this.columns.find(
  //     (column) => column.wall === "top-right"
  //   );
  //   const bottomLeftColumn = this.columns.find(
  //     (column) => column.wall === "bottom-left"
  //   );
  //   const bottomRightColumn = this.columns.find(
  //     (column) => column.wall === "bottom-right"
  //   );

  //   const leftWallColumns = this.columns.filter(
  //     (column) => column.wall === "left"
  //   );
  //   const rightWallColumns = this.columns.filter(
  //     (column) => column.wall === "right"
  //   );
  //   const topWallColumns = this.columns.filter(
  //     (column) => column.wall === "top"
  //   );
  //   const bottomWallColumns = this.columns.filter(
  //     (column) => column.wall === "bottom"
  //   );

  //   const leftUpperColumns = leftWallColumns.slice(leftWallColumns.length / 2 - 1).reverse();
  //   const leftLowerColumns = leftWallColumns.slice(
  //     0,
  //     leftWallColumns.length / 2 - 1
  //   ).reverse();

  //   const rightUpperColumns = rightWallColumns.slice(
  //     0,
  //     rightWallColumns.length / 2
  //   ).reverse();
  //   const rightLowerColumns = rightWallColumns.slice(
  //     rightWallColumns.length / 2
  //   ).reverse();

  //   const topLeftColumns = topWallColumns.slice(topWallColumns.length / 2 , topWallColumns.length);
  //   ;
  //   const topRightColumns = topWallColumns.slice(0, topWallColumns.length / 2   );
  //   // topRightColumns.reverse();

  //   const bottomLeftColumns = bottomWallColumns.slice(
  //     0,
  //     bottomWallColumns.length / 2
  //   ).reverse();
  //   const bottomRightColumns = bottomWallColumns.slice(
  //     bottomWallColumns.length / 2
  //   ).reverse();

  //   const allColumns = [
  //     topLeftColumn,
  //     ...topRightColumns,
  //     ...topLeftColumns,
  //     topRightColumn,
  //     ...rightUpperColumns,
  //     ...rightLowerColumns,
  //     ...bottomRightColumns,
  //     bottomRightColumn,
  //     ...bottomLeftColumns,
  //     bottomLeftColumn,
  //     ...leftUpperColumns,
  //     ...leftLowerColumns,
  //   ];

  //   allColumns.map((column) => {
  //     column!.label = `C` + count;
  //     column!.labelPosition = [
  //       generateCenterFromRectanglePoints(column!.points).X,
  //       generateCenterFromRectanglePoints(column!.points).Y,
  //       0,
  //     ];
  //     count++;
  //   });

  //   this.setColumns(allColumns as Column[]);
  // }

  generateColumnLables() {
    let count = 1;

    // Corner columns
    const topLeftColumn = this.columns.find(
      (column) => column.wall === "top-left"
    );
    const topRightColumn = this.columns.find(
      (column) => column.wall === "top-right"
    );
    const bottomLeftColumn = this.columns.find(
      (column) => column.wall === "bottom-left"
    );
    const bottomRightColumn = this.columns.find(
      (column) => column.wall === "bottom-right"
    );

    // Wall columns
    const leftWallColumns = this.columns.filter(
      (column) => column.wall === "left"
    );
    const rightWallColumns = this.columns.filter(
      (column) => column.wall === "right"
    );
    const topWallColumns = this.columns.filter(
      (column) => column.wall === "top"
    );
    const bottomWallColumns = this.columns.filter(
      (column) => column.wall === "bottom"
    );

    // Use Math.floor to get predictable indices
    const leftUpperColumns = leftWallColumns.slice(
      0,
      leftWallColumns.length / 2 + 1
    );
    const leftLowerColumns = leftWallColumns
      .slice(leftWallColumns.length / 2 + 1)
      .reverse();

    const rightUpperColumns = rightWallColumns
      .slice(0, rightWallColumns.length / 2 + 1)
      .reverse();
    const rightLowerColumns = rightWallColumns.slice(
      rightWallColumns.length / 2 + 1
    );

    const topLeftColumns = topWallColumns
      .slice(0, topWallColumns.length / 2 + 1)
      .reverse();
    const topRightColumns = topWallColumns.slice(topWallColumns.length / 2 + 1);

    const bottomLeftColumns = bottomWallColumns.slice(
      0,
      bottomWallColumns.length / 2 + 1
    );
    const bottomRightColumns = bottomWallColumns
      .slice(bottomWallColumns.length / 2 + 1)
      .reverse();

    // Construct the final ordered array
    const allColumns = [
      topLeftColumn,
      ...topLeftColumns,
      ...topRightColumns,
      topRightColumn,
      ...rightUpperColumns,
      ...rightLowerColumns,
      bottomRightColumn,
      ...bottomRightColumns,
      ...bottomLeftColumns,
      bottomLeftColumn,
      ...leftLowerColumns,
      ...leftUpperColumns,
    ].filter(Boolean); // Remove any undefined columns

    // Assign labels and calculate positions
    allColumns.forEach((column) => {
      if (!column) return;
      column.label = `C${count}`;
      const center = generateCenterFromRectanglePoints(column.points);
      column.labelPosition = [center.X, center.Y, 0];
      count++;
    });
    this.setColumns(allColumns as Column[]);
  }

  getExtendedPoints(
    points: Point[],
    hits: any,
    type: string,
    epsilon: number = 10
  ) {
    let clonedPoints = points.map((p) => ({ ...p }));
    let uniquePoints = this.removeDuplicatesWithEpsilon(clonedPoints, epsilon);
    uniquePoints = sortPolygonPointsClockwise(uniquePoints);

    hits.forEach((hit) => {
      if (hit.direction == "+x") {
        uniquePoints[0].x = hit.hitPoint.x + wallStore.wallThickness;
        uniquePoints[3].x = hit.hitPoint.x + wallStore.wallThickness;

        uniquePoints[1].x -= this.columnInputs[type]["-x"];
        uniquePoints[2].x -= this.columnInputs[type]["-x"];

        if (hits.length === 1) {
          uniquePoints[0].y -= this.columnInputs[type]["-y"];
          uniquePoints[3].y += this.columnInputs[type]["+y"];
          uniquePoints[1].y -= this.columnInputs[type]["-y"];
          uniquePoints[2].y += this.columnInputs[type]["+y"];
        }
      }
      if (hit.direction == "-y") {
        uniquePoints[0].y = hit.hitPoint.y - wallStore.wallThickness;
        uniquePoints[1].y = hit.hitPoint.y - wallStore.wallThickness;
        uniquePoints[2].y += this.columnInputs[type]["+y"];
        uniquePoints[3].y += this.columnInputs[type]["+y"];

        if (hits.length === 1) {
          uniquePoints[0].x += this.columnInputs[type]["+x"];
          uniquePoints[1].x -= this.columnInputs[type]["-x"];
          uniquePoints[2].x -= this.columnInputs[type]["-x"];
          uniquePoints[3].x += this.columnInputs[type]["+x"];
        }
      }
      if (hit.direction == "+y") {
        uniquePoints[2].y = hit.hitPoint.y + wallStore.wallThickness;
        uniquePoints[3].y = hit.hitPoint.y + wallStore.wallThickness;
        uniquePoints[1].y -= this.columnInputs[type]["-y"];
        uniquePoints[0].y -= this.columnInputs[type]["-y"];

        if (hits.length === 1) {
          uniquePoints[0].x += this.columnInputs[type]["+x"];
          uniquePoints[1].x -= this.columnInputs[type]["-x"];
          uniquePoints[2].x -= this.columnInputs[type]["-x"];
          uniquePoints[3].x += this.columnInputs[type]["+x"];
        }
      }
      if (hit.direction == "-x") {
        uniquePoints[1].x = hit.hitPoint.x - wallStore.wallThickness;
        uniquePoints[2].x = hit.hitPoint.x - wallStore.wallThickness;
        uniquePoints[3].x += this.columnInputs[type]["+x"];
        uniquePoints[0].x += this.columnInputs[type]["+x"];

        if (hits.length === 1) {
          uniquePoints[0].y -= this.columnInputs[type]["-y"];
          uniquePoints[3].y += this.columnInputs[type]["+y"];
          uniquePoints[1].y -= this.columnInputs[type]["-y"];
          uniquePoints[2].y += this.columnInputs[type]["+y"];
        }
      }
    });

    if (hits.length === 0) {
      uniquePoints[0].y -= this.columnInputs[type]["-y"];
      uniquePoints[3].y += this.columnInputs[type]["+y"];
      uniquePoints[1].y -= this.columnInputs[type]["-y"];
      uniquePoints[2].y += this.columnInputs[type]["+y"];

      uniquePoints[0].x += this.columnInputs[type]["+x"];
      uniquePoints[1].x -= this.columnInputs[type]["-x"];
      uniquePoints[2].x -= this.columnInputs[type]["-x"];
      uniquePoints[3].x += this.columnInputs[type]["+x"];
    }

    uniquePoints = this.removeDuplicatesWithEpsilon(uniquePoints, epsilon);
    return uniquePoints;
  }

  removeDuplicatesWithEpsilon(points: Point[], epsilon: number): Point[] {
    const result: Point[] = [];

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      let isDuplicate = false;

      for (let j = 0; j < result.length; j++) {
        const p2 = result[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < epsilon * epsilon) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        result.push(p1);
      }
    }

    return result;
  }
  generateColumnsInputs() {
    baseplateStore.groups.forEach((group) => {
      this.columnInputs[group.name] = {
        "+x": 75,
        "-x": 75,
        "+y": 75,
        "-y": 75,
      };
    });
  }

  generateColumnPolygons() {
    if (Object.keys(this.columnInputs).length === 0)
      this.generateColumnsInputs();

    this.polygons = baseplateStore.groups.map((group) => {
      return group.basePlates.map((plate) => ({
        points: this.getExtendedPoints(plate.points, plate.hits, group.name),
        label: `C${plate.label.slice(1)}`,
        center: plate.center,
        hits: plate.hits,
        group: group.name,
      }));
    });
    this.columns = this.polygons.flat();

  }
}

// Create and export the singleton instance
const columnStore = new ColumnStore();
export default columnStore;
