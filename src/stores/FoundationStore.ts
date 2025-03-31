import { makeAutoObservable, runInAction, reaction } from "mobx";
// import { v4 as uuidv4 } from "uuid";
// import wallStore from "./WallStore";

export interface Column {
  id: string;
  cornerWidth: number;
  cornerLength: number;
  horizontalWidth: number;
  horizontalLength: number;
  verticalWidth: number;
  verticalLength: number;
  points: number[][];
}

export class ColumnStore {
  cornerWidth: number;
  cornerLength: number;
  horizontalWidth: number;
  horizontalLength: number;
  verticalWidth: number;
  verticalLength: number;
  columns: Column[] = [];

  constructor(
    cornerWidth: number = 0,
    cornerLength: number = 0,
    horizontalWidth: 0,
    horizontalLength: 0,
    verticalWidth: 0,
    verticalLength: 0
  ) {
    this.cornerLength = cornerLength;
    this.cornerWidth = cornerWidth;
    this.horizontalWidth = horizontalWidth;
    this.horizontalLength = horizontalLength;
    this.verticalWidth = verticalWidth;
    this.verticalLength = verticalLength;
  }

  setCornerWidth(newWidth: number) {
    runInAction(() => {
      this.cornerWidth = newWidth;
    });
  }

  
}

const foundationStore = new FoundationStore();
export default foundationStore;
