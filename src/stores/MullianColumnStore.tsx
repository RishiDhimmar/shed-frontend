import { makeAutoObservable } from "mobx";

class MullionColumnStore {
  mullionLength: number = 0;
  mullionWidth: number = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setMullionLength(value: number) {
    this.mullionLength = value;
  }

  setMullionWidth(value: number) {
    this.mullionWidth = value;
  }
}

const mullionColumnStore = new MullionColumnStore();
export default mullionColumnStore;
