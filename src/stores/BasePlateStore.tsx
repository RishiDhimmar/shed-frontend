import { makeAutoObservable } from "mobx";
type BaseplateType = "corner" | "horizontal" | "vertical";

class BaseplateStore {
  type: BaseplateType = "corner";
  length: number = 0;
  width: number = 0;
  offsetX: number = 0;
  offsetY: number = 0;
  idealDistance: number = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setType(type: BaseplateType) {
    this.type = type;
  }

  setLength(length: number) {
    this.length = length;
  }

  setWidth(width: number) {
    this.width = width;
  }

  setOffsetX(offsetX: number) {
    this.offsetX = offsetX;
  }

  setOffsetY(offsetY: number) {
    this.offsetY = offsetY;
  }

  setIdealDistance(idealDistance: number) {
    this.idealDistance = idealDistance;
  }
}

const baseplateStore = new BaseplateStore();
export default baseplateStore;
