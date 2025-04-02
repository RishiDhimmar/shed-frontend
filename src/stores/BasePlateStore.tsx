import { makeAutoObservable, observable, action, runInAction } from "mobx";
import wallStore from "./WallStore";
import { getRectanglePoints } from "../utils/GeometryUtils";
import { v4 as uuidv4 } from "uuid";

export type BaseplateType = "corner" | "horizontal" | "vertical";

export type WallType = "left" | "right" | "top" | "bottom";

export interface Baseplate {
  id: string;
  x: number;
  y: number;
  type: BaseplateType;
  points: number[][];
  wall: WallType | null;
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

  idealHorizontalDistance = 7;
  idealVerticalDistance = 6;
  basePlates: Baseplate[] = observable([]);

  constructor() {
    makeAutoObservable(this, {
      setLength: action,
      setWidth: action,
      setOffsetX: action,
      setOffsetY: action,
      generatePlates: action,
    });
  }

  setIdealHorizontalDistance(newVal: number) {
    this.idealHorizontalDistance = newVal;
    this.generatePlates();
  }

  setIdealVerticalDistance(newVal: number) {
    this.idealVerticalDistance = newVal;
    this.generatePlates();
  }

  setLength(type: BaseplateType, newLength: number) {
    runInAction(() => {
      this.config[type].length = newLength;
      this.generatePlates();
    });
  }

  setWidth(type: BaseplateType, newWidth: number) {
    runInAction(() => {
      this.config[type].width = newWidth;
      this.generatePlates();
    });
  }

  setOffsetX(type: BaseplateType, newOffsetX: number) {
    runInAction(() => {
      if (this.config[type].offsetX !== undefined) {
        this.config[type].offsetX = newOffsetX;
        this.generatePlates();
      }
    });
  }

  setOffsetY(type: BaseplateType, newOffsetY: number) {
    runInAction(() => {
      if (this.config[type].offsetY !== undefined) {
        this.config[type].offsetY = newOffsetY;
        this.generatePlates();
      }
    });
  }
  
  setBasePlates(newBasePlates: Baseplate[]) {
    runInAction(() => {
      this.basePlates = newBasePlates;
    });
  }

  setBasePlateConfig(newConfig: Record<BaseplateType, BaseplateConfig>) {
    runInAction(() => {
      this.config = newConfig;
    });
  }


  generatePlates() {
    const corners = wallStore.internalWallPoints;
    if (corners.length !== 4) return;

    runInAction(() => {
      this.basePlates = [];
    });

    const cornerPlates = this.generateCornerPlates(corners);
    const verticalEdgePlates = this.generateVerticalEdgePlates(corners);
    const horizontalEdgePlates = this.generateHorizontalEdgePlates(corners);

    runInAction(() => {
      this.basePlates = [
        ...cornerPlates,
        ...verticalEdgePlates,
        ...horizontalEdgePlates,
      ];
    });
  }

  private createBaseplate(
    x: number,
    y: number,
    type: BaseplateType,
    wall: WallType | null
  ): Baseplate {
    const cfg = this.config[type];
    return {
      id: `${type}-${uuidv4()}`,
      x,
      y,
      type,
      points: getRectanglePoints(cfg.length, cfg.width, [x, y]),
      wall,
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
        null
      ),
      // Top right corner
      this.createBaseplate(
        topRight[0] - length / 2 - offsetX,
        topRight[1] - width / 2 - offsetY,
        "corner",
        null
      ),
      // Bottom right corner
      this.createBaseplate(
        bottomRight[0] - length / 2 - offsetX,
        bottomRight[1] + width / 2 + offsetY,
        "corner",
        null
      ),
      // Bottom left corner
      this.createBaseplate(
        bottomLeft[0] + length / 2 + offsetX,
        bottomLeft[1] + width / 2 + offsetY,
        "corner",
        null
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
    plates.push(this.createBaseplate(leftX, centerY, "horizontal", "left"));

    // Add plates above center on left wall
    let d = this.idealVerticalDistance;
    while (centerY + d <= topCenterY) {
      plates.push(
        this.createBaseplate(leftX, centerY + d, "horizontal", "left")
      );
      d += this.idealVerticalDistance;
    }

    // Add plates below center on left wall
    d = this.idealVerticalDistance;
    while (centerY - d >= bottomCenterY) {
      plates.push(
        this.createBaseplate(leftX, centerY - d, "horizontal", "left")
      );
      d += this.idealVerticalDistance;
    }

    const rightBoundary = wallStore.internalWallPoints[1][0];
    const rightX =
      rightBoundary - horizontalCfg.length / 2 - (horizontalCfg.offsetX || 0);
    const rightPlates: Baseplate[] = [];

    // Add center plate on right wall
    rightPlates.push(
      this.createBaseplate(rightX, centerY, "horizontal", "right")
    );

    // Add plates above center on right wall
    d = this.idealVerticalDistance;
    while (centerY + d <= topCenterY) {
      rightPlates.push(
        this.createBaseplate(rightX, centerY + d, "horizontal", "right")
      );
      d += this.idealVerticalDistance;
    }

    // Add plates below center on right wall
    d = this.idealVerticalDistance;
    while (centerY - d >= bottomCenterY) {
      rightPlates.push(
        this.createBaseplate(rightX, centerY - d, "horizontal", "right")
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
    plates.push(this.createBaseplate(centerX, topY, "vertical", "top"));

    // Add plates to left of center on top wall
    let d = this.idealHorizontalDistance;
    while (centerX - d >= leftCenterX) {
      plates.push(this.createBaseplate(centerX - d, topY, "vertical", "top"));
      d += this.idealHorizontalDistance;
    }

    // Add plates to right of center on top wall
    d = this.idealHorizontalDistance;
    while (centerX + d <= rightCenterX) {
      plates.push(this.createBaseplate(centerX + d, topY, "vertical", "top"));
      d += this.idealHorizontalDistance;
    }

    const bottomPlates: Baseplate[] = [];

    // Add center plate on bottom wall
    bottomPlates.push(
      this.createBaseplate(centerX, bottomY, "vertical", "bottom")
    );

    // Add plates to left of center on bottom wall
    d = this.idealHorizontalDistance;
    while (centerX - d >= leftCenterX) {
      bottomPlates.push(
        this.createBaseplate(centerX - d, bottomY, "vertical", "bottom")
      );
      d += this.idealHorizontalDistance;
    }

    // Add plates to right of center on bottom wall
    d = this.idealHorizontalDistance;
    while (centerX + d <= rightCenterX) {
      bottomPlates.push(
        this.createBaseplate(centerX + d, bottomY, "vertical", "bottom")
      );
      d += this.idealHorizontalDistance;
    }

    return [...plates, ...bottomPlates];
  }
}

const baseplateStore = new BaseplateStore();
export default baseplateStore;

