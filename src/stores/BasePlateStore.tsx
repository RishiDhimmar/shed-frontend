import { makeAutoObservable, observable, action, runInAction } from "mobx";
import wallStore from "./WallStore";
import { getRectanglePoints } from "../utils/GeometryUtils";
import { v4 as uuidv4 } from "uuid";
import uiStore from "./UIStore";
import foundationStore from "./FoundationStore";
import { sortPolygon } from "../utils/PolygonUtils";

export type BaseplateType = "corner" | "horizontal" | "vertical";

export type WallType =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface Baseplate {
  id: string;
  x: number;
  y: number;
  type: BaseplateType;
  points: number[][];
  wall: WallType | null;
  centerLinePoints: { horizontal: number[][]; vertical: number[][] } | null;
  label: string;
  labelPosition: number[];
  labelRotation: number;
}

export interface BaseplateConfig {
  width: number;
  length: number;
  offsetX?: number;
  offsetY?: number;
}

class BaseplateStore {
  config: Record<BaseplateType, BaseplateConfig> = observable({
    corner: { width: 0.5, length: 0.5, offsetX: 0.01, offsetY: 0.05 },
    horizontal: { width: 0.3, length: 0.55, offsetX: 0.01 },
    vertical: { width: 0.25, length: 0.3, offsetY: 0.01 },
  });
  uniqueLabelCount = 0;

  // Store previous valid values to revert in case of overlap
  previousConfig: Record<BaseplateType, BaseplateConfig> = {
    corner: { width: 0.5, length: 0.5, offsetX: 0.01, offsetY: 0.05 },
    horizontal: { width: 0.3, length: 0.55, offsetX: 0.01 },
    vertical: { width: 0.25, length: 0.3, offsetY: 0.01 },
  };

  idealHorizontalDistance = 7;
  idealVerticalDistance = 6;
  basePlates: Baseplate[] = observable([]);
  previousBasePlates: Baseplate[] = [];
  polygons: number[][][] = [];
  cornerBasePlates: any[] = [];
  edgeBasePlates: any[] = [];
  middleBasePlates: any[] = [];
  sortedCenterPoints: any[] = [];
  groups: any[] = [
    { name: "Corner", type: "corner", basePlates: this.cornerBasePlates },
    { name: "Edge", type: "edge", basePlates: this.edgeBasePlates },
    { name: "Middle", type: "Middle", basePlates: this.middleBasePlates },
  ];

  constructor() {
    makeAutoObservable(this, {
      setLength: action,
      setWidth: action,
      setOffsetX: action,
      setOffsetY: action,
      generatePlates: action,
    });

    // Initialize previous config with current values
    this.previousConfig = JSON.parse(JSON.stringify(this.config));
  }

  getConfig() {
    return this.config;
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
  setConfig(newConfig: Record<BaseplateType, BaseplateConfig>) {
    this.config = newConfig;
  }

  // Helper to get bounding box of a polygon
  getBoundingBox(points: number[][]) {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);

    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }

  setIdealHorizontalDistance(newVal: number) {
    // this.idealHorizontalDistance = newVal;
    // uiStore.setModified(true);
    // this.generatePlates();

    runInAction(() => {
      this.idealHorizontalDistance = newVal;
      uiStore.setModified(true);
      this.generatePlates();
    });
  }

  setIdealVerticalDistance(newVal: number) {
    // this.idealVerticalDistance = newVal;
    // uiStore.setModified(true);
    // this.generatePlates();

    runInAction(() => {
      this.idealVerticalDistance = newVal;
      uiStore.setModified(true);
      this.generatePlates();
    });
  }

  setLength(type: BaseplateType, newLength: number) {
    // Store the previous config before making changes
    this.previousConfig[type] = { ...this.config[type] };
    this.previousBasePlates = [...this.basePlates];

    runInAction(() => {
      this.config[type].length = newLength;
      uiStore.setModified(true);
    });

    const hasOverlap = this.generatePlates();

    if (hasOverlap) {
      runInAction(() => {
        // Restore previous config
        this.config[type] = { ...this.previousConfig[type] };
      });

      // Regenerate baseplates with reverted parameters
      this.generatePlates(false);

      console.warn("Baseplate length change reverted due to overlap");
      alert("Cannot change length: This would cause baseplates to overlap");

      return false;
    }

    return true;
  }

  setWidth(type: BaseplateType, newWidth: number) {
    // Store the previous config before making changes
    this.previousConfig[type] = { ...this.config[type] };
    this.previousBasePlates = [...this.basePlates];

    runInAction(() => {
      this.config[type].width = newWidth;
      uiStore.setModified(true);
    });

    const hasOverlap = this.generatePlates();

    if (hasOverlap) {
      runInAction(() => {
        // Restore previous config
        this.config[type] = { ...this.previousConfig[type] };
      });

      // Regenerate baseplates with reverted parameters
      this.generatePlates(false);

      console.warn("Baseplate width change reverted due to overlap");
      alert("Cannot change width: This would cause baseplates to overlap");

      return false;
    }

    return true;
  }

  setOffsetX(type: BaseplateType, newOffsetX: number) {
    // Store the previous config before making changes
    this.previousConfig[type] = { ...this.config[type] };
    this.previousBasePlates = [...this.basePlates];

    runInAction(() => {
      if (this.config[type].offsetX !== undefined) {
        this.config[type].offsetX = newOffsetX;
        uiStore.setModified(true);
      }
    });

    const hasOverlap = this.generatePlates();

    if (hasOverlap) {
      runInAction(() => {
        // Restore previous config
        this.config[type] = { ...this.previousConfig[type] };
      });

      // Regenerate baseplates with reverted parameters
      this.generatePlates(false);

      console.warn("Baseplate offsetX change reverted due to overlap");
      alert("Cannot change offset: This would cause baseplates to overlap");

      return false;
    }

    return true;
  }

  setOffsetY(type: BaseplateType, newOffsetY: number) {
    // Store the previous config before making changes
    this.previousConfig[type] = { ...this.config[type] };
    this.previousBasePlates = [...this.basePlates];

    runInAction(() => {
      if (this.config[type].offsetY !== undefined) {
        this.config[type].offsetY = newOffsetY;
        uiStore.setModified(true);
      }
    });

    const hasOverlap = this.generatePlates();

    if (hasOverlap) {
      runInAction(() => {
        // Restore previous config
        this.config[type] = { ...this.previousConfig[type] };
      });

      // Regenerate baseplates with reverted parameters
      this.generatePlates(false);

      console.warn("Baseplate offsetY change reverted due to overlap");
      alert("Cannot change offset: This would cause baseplates to overlap");

      return false;
    }

    return true;
  }

  setBasePlates(newBasePlates: Baseplate[]) {
    runInAction(() => {
      this.basePlates = newBasePlates;
      uiStore.setModified(true);
    });
  }

  setBasePlateConfig(newConfig: Record<BaseplateType, BaseplateConfig>) {
    this.previousConfig = JSON.parse(JSON.stringify(this.config));
    this.previousBasePlates = [...this.basePlates];

    runInAction(() => {
      this.config = newConfig;
      uiStore.setModified(true);
    });

    const hasOverlap = this.generatePlates();

    if (hasOverlap) {
      runInAction(() => {
        // Restore previous config
        this.config = JSON.parse(JSON.stringify(this.previousConfig));
      });

      // Regenerate baseplates with reverted parameters
      this.generatePlates(false);

      console.warn("Baseplate config change reverted due to overlap");
      alert("Cannot change config: This would cause baseplates to overlap");

      return false;
    }

    return true;
  }

  generatePlates(checkOverlap: boolean = true): boolean {
    this.uniqueLabelCount = 0;
    const corners = wallStore.internalWallPoints;
    if (corners.length !== 4) return false;

    const tempBasePlates: Baseplate[] = [];
    let hasOverlap = false;

    // Generate corner plates
    this.uniqueLabelCount++;

    const cornerPlates = this.generateCornerPlates(corners);

    // Check for overlaps among corner plates
    if (checkOverlap) {
      for (let i = 0; i < cornerPlates.length; i++) {
        for (let j = i + 1; j < cornerPlates.length; j++) {
          if (
            this.checkOverlap(cornerPlates[i].points, cornerPlates[j].points)
          ) {
            hasOverlap = true;
            break;
          }
        }
        if (hasOverlap) break;
      }
    }

    // If no overlap in corner plates, add them to temp list
    if (!hasOverlap) {
      tempBasePlates.push(...cornerPlates);
      this.uniqueLabelCount++;

      // Generate vertical edge plates
      const verticalEdgePlates = this.generateVerticalEdgePlates(corners);

      // Check for overlaps with existing plates
      if (checkOverlap) {
        for (const plate of verticalEdgePlates) {
          let plateOverlaps = false;

          for (const existingPlate of tempBasePlates) {
            if (this.checkOverlap(plate.points, existingPlate.points)) {
              plateOverlaps = true;
              hasOverlap = true;
              break;
            }
          }

          if (!plateOverlaps) {
            tempBasePlates.push(plate);
          }
        }
      } else {
        tempBasePlates.push(...verticalEdgePlates);
      }
    }

    // If still no overlap, generate horizontal edge plates
    if (!hasOverlap || !checkOverlap) {
      this.uniqueLabelCount++;
      const horizontalEdgePlates = this.generateHorizontalEdgePlates(corners);

      // Check for overlaps with existing plates
      if (checkOverlap) {
        for (const plate of horizontalEdgePlates) {
          let plateOverlaps = false;

          for (const existingPlate of tempBasePlates) {
            if (this.checkOverlap(plate.points, existingPlate.points)) {
              plateOverlaps = true;
              hasOverlap = true;
              break;
            }
          }

          if (!plateOverlaps) {
            tempBasePlates.push(plate);
          }
        }
      } else {
        tempBasePlates.push(...horizontalEdgePlates);
      }
    }

    // Update baseplates only if no overlap or overlap checking is disabled
    if (!hasOverlap || !checkOverlap) {
      runInAction(() => {
        this.basePlates = tempBasePlates;
      });
    }

    return hasOverlap;
  }

  public createBaseplate(
    x: number,
    y: number,
    type: BaseplateType,
    wall: WallType | null,
    points: number[][] | null,
    label: string | ""
  ): Baseplate {
    const cfg = this.config[type];
    return {
      id: `${type}-${uuidv4()}`,
      x,
      y,
      type: type,
      points: points
        ? points
        : getRectanglePoints(cfg.length, cfg.width, [x, y]),
      wall,
      centerLinePoints: null,
      label: label,
      labelPosition: [x, y, 0],
      labelRotation: 0,
    };
  }

  private generateCornerPlates(corners: number[][]): Baseplate[] {
    const [bottomLeft, bottomRight, topRight, topLeft] = corners;
    const { length, width, offsetX = 0, offsetY = 0 } = this.config.corner;
    return [
      // Top left corner
      this.createBaseplate(
        topLeft[0] + length / 2 + offsetX,
        topLeft[1] - width / 2 - offsetY,
        "corner",
        "top-left",
        null,
        `B${this.uniqueLabelCount}`
      ),
      // Top right corner
      this.createBaseplate(
        topRight[0] - length / 2 - offsetX,
        topRight[1] - width / 2 - offsetY,
        "corner",
        "top-right",
        null,
        `B${this.uniqueLabelCount}`
      ),
      // Bottom right corner
      this.createBaseplate(
        bottomRight[0] - length / 2 - offsetX,
        bottomRight[1] + width / 2 + offsetY,
        "corner",
        "bottom-right",
        null,
        `B${this.uniqueLabelCount}`
      ),
      // Bottom left corner
      this.createBaseplate(
        bottomLeft[0] + length / 2 + offsetX,
        bottomLeft[1] + width / 2 + offsetY,
        "corner",
        "bottom-left",
        null,
        `B${this.uniqueLabelCount}`
      ),
    ];
  }

  private generateVerticalEdgePlates(corners: number[][]): Baseplate[] {
    const [bottomLeft, , , topLeft] = corners;
    const horizontalCfg = this.config.horizontal;
    const cornerCfg = this.config.corner;
    const bottomCenterY =
      bottomLeft[1] + cornerCfg.width / 2 + (cornerCfg.offsetY || 0);
    const topCenterY =
      topLeft[1] - cornerCfg.width / 2 - (cornerCfg.offsetY || 0);
    const centerY = (topCenterY + bottomCenterY) / 2;
    const leftBoundary = wallStore.internalWallPoints[0][0];
    const leftX =
      leftBoundary + horizontalCfg.length / 2 + (horizontalCfg.offsetX || 0);
    const plates: Baseplate[] = [];

    // Add center plate on left wall
    plates.push(
      this.createBaseplate(
        leftX,
        centerY,
        "horizontal",
        "left",
        null,
        `B${this.uniqueLabelCount}`
      )
    );

    // Add plates above center on left wall
    let d = this.idealVerticalDistance;
    while (
      centerY + d <=
      topCenterY -
        foundationStore.values.corner.rccLf / 2 -
        foundationStore.values.horizontal.rccLf / 2
    ) {
      plates.push(
        this.createBaseplate(
          leftX,
          centerY + d,
          "horizontal",
          "left",
          null,
          `B${this.uniqueLabelCount}`
        )
      );
      d += this.idealVerticalDistance;
    }

    // Add plates below center on left wall
    d = this.idealVerticalDistance;
    while (
      centerY - d >=
      bottomCenterY +
        foundationStore.values.corner.rccLf / 2 +
        foundationStore.values.horizontal.rccLf / 2
    ) {
      plates.push(
        this.createBaseplate(
          leftX,
          centerY - d,
          "horizontal",
          "left",
          null,
          `B${this.uniqueLabelCount}`
        )
      );
      d += this.idealVerticalDistance;
    }

    const rightBoundary = wallStore.internalWallPoints[1][0];
    const rightX =
      rightBoundary - horizontalCfg.length / 2 - (horizontalCfg.offsetX || 0);
    const rightPlates: Baseplate[] = [];

    // Add center plate on right wall
    rightPlates.push(
      this.createBaseplate(
        rightX,
        centerY,
        "horizontal",
        "right",
        null,
        `B${this.uniqueLabelCount}`
      )
    );

    // Add plates above center on right wall
    d = this.idealVerticalDistance;
    while (
      centerY + d <=
      topCenterY -
        foundationStore.values.corner.rccLf / 2 -
        foundationStore.values.horizontal.rccLf / 2
    ) {
      rightPlates.push(
        this.createBaseplate(
          rightX,
          centerY + d,
          "horizontal",
          "right",
          null,
          `B${this.uniqueLabelCount}`
        )
      );
      d += this.idealVerticalDistance;
    }

    // Add plates below center on right wall
    d = this.idealVerticalDistance;
    while (
      centerY - d >=
      bottomCenterY +
        foundationStore.values.corner.rccLf / 2 +
        foundationStore.values.horizontal.rccLf / 2
    ) {
      rightPlates.push(
        this.createBaseplate(
          rightX,
          centerY - d,
          "horizontal",
          "right",
          null,
          `B${this.uniqueLabelCount}`
        )
      );
      d += this.idealVerticalDistance;
    }

    return [...plates, ...rightPlates];
  }

  private generateHorizontalEdgePlates(corners: number[][]): Baseplate[] {
    const verticalCfg = this.config.vertical;
    const [, , topRight, topLeft] = corners;
    const cornerCfg = this.config.corner;
    const leftCenterX =
      topLeft[0] + cornerCfg.length / 2 + (cornerCfg.offsetX || 0);
    const rightCenterX =
      topRight[0] - cornerCfg.length / 2 - (cornerCfg.offsetX || 0);
    const centerX = (leftCenterX + rightCenterX) / 2;
    const topBoundary = wallStore.internalWallPoints[3][1];
    const topY =
      topBoundary - verticalCfg.width / 2 - (verticalCfg.offsetY || 0);
    const bottomBoundary = wallStore.internalWallPoints[0][1];
    const bottomY =
      bottomBoundary + verticalCfg.width / 2 + (verticalCfg.offsetY || 0);

    const plates: Baseplate[] = [];

    // Add center plate on top wall
    plates.push(
      this.createBaseplate(
        centerX,
        topY,
        "vertical",
        "top",
        null,
        `B${this.uniqueLabelCount}`
      )
    );

    // Add plates to left of center on top wall
    let d = this.idealHorizontalDistance;
    while (
      centerX - d >=
      leftCenterX +
        foundationStore.values.corner.RccBf / 2 +
        foundationStore.values.vertical.RccBf / 2
    ) {
      plates.push(
        this.createBaseplate(
          centerX - d,
          topY,
          "vertical",
          "top",
          null,
          `B${this.uniqueLabelCount}`
        )
      );
      d += this.idealHorizontalDistance;
    }

    // Add plates to right of center on top wall
    d = this.idealHorizontalDistance;
    while (
      centerX + d <=
      rightCenterX -
        foundationStore.values.corner.RccBf / 2 -
        foundationStore.values.vertical.RccBf / 2
    ) {
      plates.push(
        this.createBaseplate(
          centerX + d,
          topY,
          "vertical",
          "top",
          null,
          `B${this.uniqueLabelCount}`
        )
      );
      d += this.idealHorizontalDistance;
    }

    const bottomPlates: Baseplate[] = [];

    // Add center plate on bottom wall
    bottomPlates.push(
      this.createBaseplate(
        centerX,
        bottomY,
        "vertical",
        "bottom",
        null,
        `B${this.uniqueLabelCount}`
      )
    );

    // Add plates to left of center on bottom wall
    d = this.idealHorizontalDistance;
    while (
      centerX - d >=
      leftCenterX +
        foundationStore.values.corner.RccBf / 2 +
        foundationStore.values.vertical.RccBf / 2
    ) {
      bottomPlates.push(
        this.createBaseplate(
          centerX - d,
          bottomY,
          "vertical",
          "bottom",
          null,
          `B${this.uniqueLabelCount}`
        )
      );
      d += this.idealHorizontalDistance;
    }

    // Add plates to right of center on bottom wall
    d = this.idealHorizontalDistance;
    while (
      centerX + d <=
      rightCenterX -
        foundationStore.values.corner.RccBf / 2 -
        foundationStore.values.vertical.RccBf / 2
    ) {
      bottomPlates.push(
        this.createBaseplate(
          centerX + d,
          bottomY,
          "vertical",
          "bottom",
          null,
          `B${this.uniqueLabelCount}`
        )
      );
      d += this.idealHorizontalDistance;
    }

    return [...plates, ...bottomPlates];
  }

  public clearBaseplates() {
    this.setBasePlates([]);
  }

  updateCenterLinePoints() {
    const bottomLeft = baseplateStore.basePlates.find(
      (baseplate) => baseplate.wall === "bottom-left"
    );
    const bottomRight = baseplateStore.basePlates.find(
      (baseplate) => baseplate.wall === "bottom-right"
    );
    const topLeft = baseplateStore.basePlates.find(
      (baseplate) => baseplate.wall === "top-left"
    );
    const topRight = baseplateStore.basePlates.find(
      (baseplate) => baseplate.wall === "top-right"
    );

    this.basePlates.forEach((baseplate) => {
      const { x, y, wall } = baseplate;

      const points: {
        horizontal: [number, number][];
        vertical: [number, number][];
      } = { horizontal: [], vertical: [] };

      switch (wall) {
        case "left":
          points.horizontal.push(
            [x + baseplateStore.config.horizontal.length / 2, y],
            [
              x +
                wallStore.innerWidth +
                baseplateStore.config.horizontal.length / 2,
              y,
            ]
          );
          points.vertical.push(
            [x, y - Math.abs(bottomLeft!.y - y)],
            [x, y + Math.abs(topLeft!.y - y)]
          );
          break;

        case "right":
          points.horizontal.push(
            [x - baseplateStore.config.horizontal.length / 2, y],
            [
              x -
                wallStore.innerWidth -
                baseplateStore.config.horizontal.length / 2,
              y,
            ]
          );
          points.vertical.push(
            [x, y - Math.abs(bottomRight!.y - y)],
            [x, y + Math.abs(topRight!.y - y)]
          );
          break;

        case "top":
          points.horizontal.push(
            [x - Math.abs(bottomLeft!.x - x), y],
            [x + Math.abs(topRight!.x - x), y]
          );
          points.vertical.push(
            [x, y + baseplateStore.config.vertical.length / 2],
            [
              x,
              y -
                wallStore.innerHeight -
                baseplateStore.config.vertical.length / 2,
            ]
          );
          break;

        case "bottom":
          points.horizontal.push(
            [x - Math.abs(bottomLeft!.x - x), y],
            [x + Math.abs(bottomRight!.x - x), y]
          );
          points.vertical.push(
            [x, y - baseplateStore.config.vertical.length / 2],
            [
              x,
              y +
                wallStore.innerHeight +
                baseplateStore.config.vertical.length / 2,
            ]
          );
          break;

        case "top-left":
          points.horizontal.push(
            [topLeft!.x - baseplateStore.config.corner.length, topLeft!.y],
            [
              topRight!.x + baseplateStore.config.corner.length || topLeft!.x,
              topLeft!.y,
            ]
          );
          points.vertical.push(
            [topLeft!.x, topLeft!.y + baseplateStore.config.corner.width],
            [
              bottomLeft!.x || topLeft!.x,
              bottomLeft!.y - baseplateStore.config.corner.width || topLeft!.y,
            ]
          );
          break;

        case "top-right":
          points.horizontal.push(
            [
              topLeft!.x - baseplateStore.config.corner.length || topRight!.x,
              topRight!.y,
            ],
            [topRight!.x + baseplateStore.config.corner.length, topRight!.y]
          );
          points.vertical.push(
            [topRight!.x, topRight!.y + baseplateStore.config.corner.width],
            [
              bottomRight!.x || topRight!.x,
              bottomRight!.y - baseplateStore.config.corner.width ||
                topRight!.y,
            ]
          );
          break;

        case "bottom-right":
          points.horizontal.push(
            [
              bottomRight!.x + baseplateStore.config.corner.width,
              bottomRight!.y,
            ],
            [
              bottomLeft!.x - baseplateStore.config.corner.width ||
                bottomRight!.x,
              bottomRight!.y,
            ]
          );
          points.vertical.push(
            [
              bottomRight!.x,
              bottomRight!.y - baseplateStore.config.corner.width,
            ],
            [
              topRight!.x || bottomRight!.x,
              topRight!.y + baseplateStore.config.corner.width ||
                bottomRight!.y,
            ]
          );
          break;

        case "bottom-left":
          points.horizontal.push(
            [
              bottomRight!.x + baseplateStore.config.corner.width ||
                bottomLeft!.x,
              bottomLeft!.y,
            ],
            [bottomLeft!.x - baseplateStore.config.corner.width, bottomLeft!.y]
          );
          points.vertical.push(
            [bottomLeft!.x, bottomLeft!.y - baseplateStore.config.corner.width],
            [
              topLeft!.x || bottomLeft!.x,
              topLeft!.y + baseplateStore.config.corner.width || bottomLeft!.y,
            ]
          );
          break;

        default:
          points.horizontal.push([0, 0]);
          points.vertical.push([0, 0]);
          break;
      }

      baseplate.centerLinePoints = points;
    });
  }

  generateLabels() {
    const temp = [...this.cornerBasePlates, ...this.edgeBasePlates];
    const centerPoints = temp.map((plate) => ({
      x: plate.center.x,
      y: plate.center.y,
    }));
    const sortedPoints = sortPolygon(
      centerPoints.map((p) => ({ x: p.x, y: p.y }))
    );
    this.sortedCenterPoints = sortedPoints;
    const sortedPolygons = sortedPoints.map(
      (p, i) => temp.find((p2) => p2.center.x === p.x && p2.center.y === p.y)!
    );
    sortedPolygons.forEach((plate, index) => {
      plate.label = `B${index + 1}`;
    });

    //rest numbering to middle plates
    this.middleBasePlates.forEach((plate, index) => {
      plate.label = `B${index + temp.length}`;
    });
    this.cornerBasePlates = sortedPolygons.filter((p) => p.type === "corner");
    this.edgeBasePlates = sortedPolygons.filter((p) => p.type === "edge");
    // this.middleBasePlates = sortedPolygons.filter((p) => p.type === "middle");
  }

  processBasePlates(): { x: number; y: number; label: string }[] {
    if (
      this.cornerBasePlates.length === 0 &&
      this.edgeBasePlates.length === 0 &&
      this.middleBasePlates.length === 0
    ) {
      return [];
    }
    console.log(
      this.cornerBasePlates,
      this.edgeBasePlates,
      this.middleBasePlates
    );
    this.groups = [
      { name: "Group 1", type: "corner", basePlates: this.cornerBasePlates },
      { name: "Group 2", type: "edge", basePlates: this.edgeBasePlates },
      { name: "Group 3", type: "middle", basePlates: this.middleBasePlates },
    ];
  }
}

const baseplateStore = new BaseplateStore();
export default baseplateStore;
