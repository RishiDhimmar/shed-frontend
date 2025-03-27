import { makeAutoObservable, observable, action, runInAction } from "mobx";
import wallStore from "./WallStore";
import { getRectanglePoints } from "../utils/geometryUtils";

export type BaseplateType = "corner" | "horizontal" | "vertical";

interface Baseplate {
  id: string;
  x: number;
  y: number;
  type: BaseplateType;
  points: number[][]; // Shape points
}

interface BaseplateConfig {
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

  basePlates: Baseplate[] = [];

  constructor() {
    makeAutoObservable(this, {
      setLength: action,
      setWidth: action,
      setOffsetX: action,
      setOffsetY: action,
      generateCornerPlateCenters: action,
      generateCornerPlatePoints: action,
    });
  }

  setLength(type: BaseplateType, newLength: number) {
    runInAction(() => {
      this.config[type].length = newLength;
      this.generateCornerPlatePoints();
    });
  }

  setWidth(type: BaseplateType, newWidth: number) {
    runInAction(() => {
      this.config[type].width = newWidth;
      this.generateCornerPlatePoints();
    });
  }

  setOffsetX(type: BaseplateType, newOffsetX: number) {
    runInAction(() => {
      if (this.config[type].offsetX !== undefined) {
        this.config[type].offsetX = newOffsetX;
        this.generateCornerPlatePoints();
      }
    });
  }

  setOffsetY(type: BaseplateType, newOffsetY: number) {
    runInAction(() => {
      if (this.config[type].offsetY !== undefined) {
        this.config[type].offsetY = newOffsetY;
        this.generateCornerPlatePoints();
      }
    });
  }

  generateCornerPlateCenters() {
    const corners = wallStore.internalWallPoints;
    if (corners.length !== 4) return;

    const [bottomLeft, bottomRight, topRight, topLeft] = corners;
    const cornerConfig = this.config.corner;

    runInAction(() => {
      this.basePlates = [
        {
          id: "corner-top-left",
          type: "corner",
          x: topLeft[0] + cornerConfig.length / 2 + (cornerConfig.offsetX || 0),
          y: topLeft[1] - cornerConfig.width / 2 - (cornerConfig.offsetY || 0),
          points: [],
        },
        {
          id: "corner-top-right",
          type: "corner",
          x: topRight[0] - cornerConfig.length / 2 - (cornerConfig.offsetX || 0),
          y: topRight[1] - cornerConfig.width / 2 - (cornerConfig.offsetY || 0),
          points: [],
        },
        {
          id: "corner-bottom-right",
          type: "corner",
          x: bottomRight[0] - cornerConfig.length / 2 - (cornerConfig.offsetX || 0),
          y: bottomRight[1] + cornerConfig.width / 2 + (cornerConfig.offsetY || 0),
          points: [],
        },
        {
          id: "corner-bottom-left",
          type: "corner",
          x: bottomLeft[0] + cornerConfig.length / 2 + (cornerConfig.offsetX || 0),
          y: bottomLeft[1] + cornerConfig.width / 2 + (cornerConfig.offsetY || 0),
          points: [],
        },
      ];
    });
  }

  generateCornerPlatePoints() {
    this.generateCornerPlateCenters();
    runInAction(() => {
      this.basePlates = this.basePlates.map((plate) => {
        const config = this.config[plate.type];
        const points = getRectanglePoints(config.length, config.width, [
          plate.x,
          plate.y,
        ]);
        return { ...plate, points };
      });
    });
  }
}

const baseplateStore = new BaseplateStore();
export default baseplateStore;
