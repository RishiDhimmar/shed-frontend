import { makeAutoObservable, runInAction } from "mobx";

type BaseplateType = "corner" | "horizontal" | "vertical";

interface Baseplate {
  id: string;
  type: BaseplateType;
  width: number;
  length: number;
  offsetX: number;
  offsetY: number;
}

class BaseplateStore {
  config = {
    idealHorizontalDistance: 300,
    idealVerticalDistance: 300,
    baseplateDimensions: {
      corner: { width: 500, length: 500, offsetX: 0, offsetY: 0 },
      horizontal: { width: 1000, length: 200, offsetX: 0 },
      vertical: { width: 200, length: 1000, offsetY: 0 },
    },
  };

  basePlates: Baseplate[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setLength(type: BaseplateType, newLength: number) {
    runInAction(() => {
      this.config.baseplateDimensions[type].length = newLength;
    });
  }

  setWidth(type: BaseplateType, newWidth: number) {
    runInAction(() => {
      this.config.baseplateDimensions[type].width = newWidth;
    });
  }

  setOffsetX(type: BaseplateType, newOffsetX: number) {
    runInAction(() => {
      this.config.baseplateDimensions[type].offsetX = newOffsetX;
    });
  }

  setOffsetY(type: BaseplateType, newOffsetY: number) {
    runInAction(() => {
      this.config.baseplateDimensions[type].offsetY = newOffsetY;
    });
  }

  setIdealHorizontalDistance(newDistance: number) {
    this.config.idealHorizontalDistance = newDistance;
  }

  setIdealVerticalDistance(newDistance: number) {
    this.config.idealVerticalDistance = newDistance;
  }
}

const baseplateStore = new BaseplateStore();
export default baseplateStore;
