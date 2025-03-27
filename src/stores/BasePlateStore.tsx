import { makeAutoObservable } from "mobx";

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
    console.log(type, newLength);
    this.config = {
      ...this.config,
      baseplateDimensions: {
        ...this.config.baseplateDimensions,
        [type]: { ...this.config.baseplateDimensions[type], length: newLength },
      },
    };
  }

  setWidth(type: BaseplateType, newWidth: number) {
    this.config = {
      ...this.config,
      baseplateDimensions: {
        ...this.config.baseplateDimensions,
        [type]: { ...this.config.baseplateDimensions[type], width: newWidth },
      },
    };
  }

  setOffsetX(type: BaseplateType, newOffsetX: number) {
    this.config = {
      ...this.config,
      baseplateDimensions: {
        ...this.config.baseplateDimensions,
        [type]: {
          ...this.config.baseplateDimensions[type],
          offsetX: newOffsetX,
        },
      },
    };
  }

  setOffsetY(type: BaseplateType, newOffsetY: number) {
    this.config = {
      ...this.config,
      baseplateDimensions: {
        ...this.config.baseplateDimensions,
        [type]: {
          ...this.config.baseplateDimensions[type],
          offsetY: newOffsetY,
        },
      },
    };
  }

  setIdealHorizontalDistance(newLength: number) {
    this.config = { ...this.config, idealHorizontalDistance: newLength };
  }

  setIdealVerticalDistance(newLength: number) {
    this.config = { ...this.config, idealVerticalDistance: newLength };
  }
}

const baseplateStore = new BaseplateStore();
export default baseplateStore;
