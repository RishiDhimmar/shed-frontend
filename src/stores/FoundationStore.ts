import { makeAutoObservable } from "mobx";

class FoundationStore {
  RccBf: number = 0;
  rccLf: number = 0;

  pccWidth: number = 0;
  pccLength: number = 0;

  depthD: number = 0;
  depthd: number = 0;

  shortBarCount: number = 0;
  shortBarSpacing: number = 0;

  longBarCount: number = 0;
  longBarSpacing: number = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setRccBF(value: number) {
    this.RccBf = value;
  }

  setRccLf(value: number) {
    this.rccLf = value;
  }

  setPccWidth(value: number) {
    this.pccWidth = value;
  }

  setPccLength(value: number) {
    this.pccLength = value;
  }

  setDepthD(value: number) {
    this.depthD = value;
  }

  setDepthd(value: number) {
    this.depthd = value;
  }

  setShortBarCount(value: number) {
    this.shortBarCount = value;
  }

  setShortBarSpacing(value: number) {
    this.shortBarSpacing = value;
  }

  setLongBarCount(value: number) {
    this.longBarCount = value;
  }

  setLongBarSpacing(value: number) {
    this.longBarSpacing = value;
  }
}

const foundationStore = new FoundationStore();
export default foundationStore;
