import { makeAutoObservable } from "mobx";

interface BasePlotStore {
  width: number;
  height: number;
  points: number[];
}

class PlotStore implements BasePlotStore {
  width = 0;
  height = 0;
  points: number[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setWidth(width: number) {
    this.width = width;
    console.log(this.width);
  }

  setHeight(height: number) {
    this.height = height;
    console.log(this.height);
  }
}

const plotStore = new PlotStore();
export default plotStore;
