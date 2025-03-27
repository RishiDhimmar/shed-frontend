// import { makeAutoObservable, observable, action, runInAction } from "mobx";
// import wallStore from "./WallStore";
// import { getRectanglePoints } from "../utils/geometryUtils";
// import { v4 as uuidv4 } from "uuid";

// export type BaseplateType = "corner" | "horizontal" | "vertical";

// interface Baseplate {
//   id: string;
//   x: number;
//   y: number;
//   type: BaseplateType;
//   points: number[][]; // Shape points
// }

// interface BaseplateConfig {
//   width: number;
//   length: number;
//   offsetX?: number;
//   offsetY?: number;
// }

// class BaseplateStore {
//   config: Record<BaseplateType, BaseplateConfig> = observable({
//     corner: { width: 0.3, length: 0.55, offsetX: 0.01, offsetY: 0.05 },
//     horizontal: { width: 0.3, length: 0.55, offsetX: 0.01, offsetY: 0 },
//     vertical: { width: 0.25, length: 0.3, offsetX: 0, offsetY: 0.01 },
//   });

//   idealHorizontalDistance = 6;
//   idealVerticalDistance = 7.275;
//   basePlates: Baseplate[] = observable([]);

//   constructor() {
//     makeAutoObservable(this, {
//       setLength: action,
//       setWidth: action,
//       setOffsetX: action,
//       setOffsetY: action,
//       generatePlates: action,
//     });
//   }

//   setIdealHorizontalDistance(newVal: number) {
//     this.idealHorizontalDistance = newVal;
//     this.generatePlates();
//   }

//   setIdealVerticalDistance(newVal: number) {
//     this.idealVerticalDistance = newVal;
//     this.generatePlates();
//   }

//   setLength(type: BaseplateType, newLength: number) {
//     runInAction(() => {
//       this.config[type].length = newLength;
//       this.generatePlates();
//     });
//   }

//   setWidth(type: BaseplateType, newWidth: number) {
//     runInAction(() => {
//       this.config[type].width = newWidth;
//       this.generatePlates();
//     });
//   }

//   setOffsetX(type: BaseplateType, newOffsetX: number) {
//     runInAction(() => {
//       if (this.config[type].offsetX !== undefined) {
//         this.config[type].offsetX = newOffsetX;
//         this.generatePlates();
//       }
//     });
//   }

//   setOffsetY(type: BaseplateType, newOffsetY: number) {
//     runInAction(() => {
//       if (this.config[type].offsetY !== undefined) {
//         this.config[type].offsetY = newOffsetY;
//         this.generatePlates();
//       }
//     });
//   }

//   /**
//    * Generates all baseplates (corner and vertical plates).
//    */
//   generatePlates() {
//     const corners = wallStore.internalWallPoints;
//     if (corners.length !== 4) return;

//     runInAction(() => {
//       this.basePlates = [
//         ...this.generateCornerPlates(corners),
//         ...this.generateVerticalPlates(),
//       ];
//     });
//   }

//   /**
//    * Generates corner baseplates.
//    */
//   private generateCornerPlates(corners: number[][]): Baseplate[] {
//     const [bottomLeft, bottomRight, topRight, topLeft] = corners;
//     const { length, width, offsetX = 0, offsetY = 0 } = this.config.corner;

//     return [
//       { id: "corner-top-left", x: topLeft[0] + length / 2 + offsetX, y: topLeft[1] - width / 2 - offsetY },
//       { id: "corner-top-right", x: topRight[0] - length / 2 - offsetX, y: topRight[1] - width / 2 - offsetY },
//       { id: "corner-bottom-right", x: bottomRight[0] - length / 2 - offsetX, y: bottomRight[1] + width / 2 + offsetY },
//       { id: "corner-bottom-left", x: bottomLeft[0] + length / 2 + offsetX, y: bottomLeft[1] + width / 2 + offsetY },
//     ].map((plate) => this.createBaseplate(plate.x, plate.y, "corner"));
//   }

//   /**
//    * Generates vertical baseplates along the left and right edges.
//    */
//   private generateVerticalPlates(): Baseplate[] {
//     const { width, length, offsetX = 0 } = this.config.horizontal;
//     const leftX = -wallStore.width / 2 + wallStore.wallThickness + length / 2 + offsetX;
//     const rightX = wallStore.width / 2 - wallStore.wallThickness - length / 2 - offsetX;

//     return [
//       ...this.generatePlatesAlongAxis(leftX),
//       ...this.generatePlatesAlongAxis(rightX),
//     ];
//   }

//   /**
//    * Generates plates along the vertical axis with ideal spacing.
//    */
//   private generatePlatesAlongAxis(x: number): Baseplate[] {
//     const corners = wallStore.internalWallPoints;
//     const [bottomLeft, , , topLeft] = corners;
//     const { width, offsetY = 0 } = this.config.corner;
//     const topY = topLeft[1] - width / 2 - offsetY;
//     const bottomY = bottomLeft[1] + width / 2 + offsetY;

//     const plates: Baseplate[] = [];
//     let y = (topY + bottomY) / 2;

//     plates.push(this.createBaseplate(x, y, "horizontal"));

//     let d = this.idealVerticalDistance;
//     while (y + d <= topY) {
//       plates.push(this.createBaseplate(x, y + d, "horizontal"));
//       d += this.idealVerticalDistance;
//     }

//     d = this.idealVerticalDistance;
//     while (y - d >= bottomY) {
//       plates.push(this.createBaseplate(x, y - d, "horizontal"));
//       d += this.idealVerticalDistance;
//     }

//     return plates;
//   }

//   /**
//    * Creates a baseplate with calculated points.
//    */
//   private createBaseplate(x: number, y: number, type: BaseplateType): Baseplate {
//     const config = this.config[type];
//     return {
//       id: `${type}-${uuidv4()}`,
//       x,
//       y,
//       type,
//       points: getRectanglePoints(config.length, config.width, [x, y]),
//     };
//   }
// }

// const baseplateStore = new BaseplateStore();
// export default baseplateStore;

import { makeAutoObservable, observable, action, runInAction } from "mobx";
import wallStore from "./WallStore";
import { getRectanglePoints } from "../utils/geometryUtils";
import { v4 as uuidv4 } from "uuid";

export type BaseplateType = "corner" | "horizontal" | "vertical";

export interface Baseplate {
  id: string;
  x: number;
  y: number;
  type: BaseplateType;
  points: number[][];
}

export interface BaseplateConfig {
  width: number;
  length: number;
  offsetX?: number;
  offsetY?: number;
}

class BaseplateStore {
  config: Record<BaseplateType, BaseplateConfig> = observable({
    corner: { width: 0.3, length: 0.55, offsetX: 0.01, offsetY: 0.05 },
    horizontal: { width: 0.3, length: 0.55, offsetX: 0.01, offsetY: 0 },
    vertical: { width: 0.25, length: 0.3, offsetX: 0, offsetY: 0.01 },
  });

  idealHorizontalDistance = 6;
  idealVerticalDistance = 7.275;
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
    type: BaseplateType
  ): Baseplate {
    const cfg = this.config[type];
    return {
      id: `${type}-${uuidv4()}`,
      x,
      y,
      type,
      points: getRectanglePoints(cfg.length, cfg.width, [x, y]),
    };
  }

  private generateCornerPlates(corners: number[][]): Baseplate[] {
    const [bottomLeft, bottomRight, topRight, topLeft] = corners;
    const { length, width, offsetX = 0, offsetY = 0 } = this.config.corner;
    return [
      this.createBaseplate(
        topLeft[0] + length / 2 + offsetX,
        topLeft[1] - width / 2 - offsetY,
        "corner"
      ),
      this.createBaseplate(
        topRight[0] - length / 2 - offsetX,
        topRight[1] - width / 2 - offsetY,
        "corner"
      ),
      this.createBaseplate(
        bottomRight[0] - length / 2 - offsetX,
        bottomRight[1] + width / 2 + offsetY,
        "corner"
      ),
      this.createBaseplate(
        bottomLeft[0] + length / 2 + offsetX,
        bottomLeft[1] + width / 2 + offsetY,
        "corner"
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

    plates.push(this.createBaseplate(leftX, centerY, "horizontal"));

    let d = this.idealVerticalDistance;
    while (centerY + d <= topCenterY) {
      plates.push(this.createBaseplate(leftX, centerY + d, "horizontal"));
      d += this.idealVerticalDistance;
    }

    d = this.idealVerticalDistance;
    while (centerY - d >= bottomCenterY) {
      plates.push(this.createBaseplate(leftX, centerY - d, "horizontal"));
      d += this.idealVerticalDistance;
    }

    const rightBoundary = wallStore.internalWallPoints[1][0];
    const rightX =
      rightBoundary - horizontalCfg.length / 2 - (horizontalCfg.offsetX || 0);
    const rightPlates: Baseplate[] = [];

    rightPlates.push(this.createBaseplate(rightX, centerY, "horizontal"));
    d = this.idealVerticalDistance;
    while (centerY + d <= topCenterY) {
      rightPlates.push(this.createBaseplate(rightX, centerY + d, "horizontal"));
      d += this.idealVerticalDistance;
    }
    d = this.idealVerticalDistance;
    while (centerY - d >= bottomCenterY) {
      rightPlates.push(this.createBaseplate(rightX, centerY - d, "horizontal"));
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
      topBoundary - verticalCfg.length / 2 - (verticalCfg.offsetY || 0);
    const bottomBoundary = wallStore.internalWallPoints[0][1];
    const bottomY =
      bottomBoundary + verticalCfg.length / 2 + (verticalCfg.offsetY || 0);

    const plates: Baseplate[] = [];
    plates.push(this.createBaseplate(centerX, topY, "vertical"));

    let d = this.idealHorizontalDistance;
    while (centerX - d >= leftCenterX) {
      plates.push(this.createBaseplate(centerX - d, topY, "vertical"));
      d += this.idealHorizontalDistance;
    }
    d = this.idealHorizontalDistance;
    while (centerX + d <= rightCenterX) {
      plates.push(this.createBaseplate(centerX + d, topY, "vertical"));
      d += this.idealHorizontalDistance;
    }

    const bottomPlates: Baseplate[] = [];
    bottomPlates.push(this.createBaseplate(centerX, bottomY, "vertical"));
    d = this.idealHorizontalDistance;
    while (centerX - d >= leftCenterX) {
      bottomPlates.push(this.createBaseplate(centerX - d, bottomY, "vertical"));
      d += this.idealHorizontalDistance;
    }
    d = this.idealHorizontalDistance;
    while (centerX + d <= rightCenterX) {
      bottomPlates.push(this.createBaseplate(centerX + d, bottomY, "vertical"));
      d += this.idealHorizontalDistance;
    }

    return [...plates, ...bottomPlates];
  }
}

const baseplateStore = new BaseplateStore();
export default baseplateStore;
