import { makeAutoObservable, reaction, runInAction } from "mobx";
import { v4 as uuidv4 } from "uuid";
import columnStore from "./ColumnStore";

export interface Foundation {
  id: string;
  points: number[][]; // Foundation polygon points (e.g. a rectangle)
}

export class FoundationStore {
  // Foundation parameters (RCC values)
  RccBf: number = 3.0;  // Target width for the second rectangle
  rccLf: number = 2.5;  // Target length for the second rectangle

  // Other parameters (removed pcc logic)
  depthD: number = 0;
  depthd: number = 0;
  shortBarCount: number = 0;
  shortBarSpacing: number = 0;
  longBarCount: number = 0;
  longBarSpacing: number = 0;
  pccWidth: number = 0;
  pccLength: number = 0;

  foundations: Foundation[] = [];

  constructor() {
    makeAutoObservable(this);

    // Regenerate foundations when columns or RCC values change.
    reaction(
      () => [columnStore.columns.slice(), this.RccBf, this.rccLf],
      ([, RccBf, rccLf]) => {
        if (RccBf as number > 0 && rccLf as number > 0) {
          this.generateFoundations();
        }
      }
    );
  }

  // Setters for RCC parameters
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

  // Other setters...
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

  // Generate two foundation rectangles per column:
  //  - Rect1: Slightly bigger than the column rectangle.
  //  - Rect2: Based on RCC values (always larger than Rect1).
  generateFoundations() {
    const newFoundations: Foundation[] = [];

    columnStore.columns.forEach((column) => {
      // Ensure the column has at least 4 points.
      if (!column.points || column.points.length < 4) {
        console.warn("Skipping column due to insufficient points:", column.points);
        return;
      }

      // Compute the column's bounding box.
      const xs = column.points.map((p) => p[0]);
      const ys = column.points.map((p) => p[1]);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const colWidth = maxX - minX;
      const colHeight = maxY - minY;
      const center = [(minX + maxX) / 2, (minY + maxY) / 2, column.points[0][2] || 0];

      // --- First Rectangle: Slightly bigger than the column rectangle ---
      const margin = 0.3; // Increase size by a fixed margin
      const rect1Width = colWidth + margin;
      const rect1Height = colHeight + margin;

      const foundationPoints1 = [
        [center[0] - rect1Width / 2, center[1] - rect1Height / 2, center[2]],
        [center[0] + rect1Width / 2, center[1] - rect1Height / 2, center[2]],
        [center[0] + rect1Width / 2, center[1] + rect1Height / 2, center[2]],
        [center[0] - rect1Width / 2, center[1] + rect1Height / 2, center[2]],
        [center[0] - rect1Width / 2, center[1] - rect1Height / 2, center[2]], // Close the loop
      ];

      // --- Second Rectangle: Based on RCC values ---
      // Use RccBf as width and rccLf as height.
      // Ensure this rect is always larger than Rect1.
      let rect2Width = this.RccBf;
      let rect2Height = this.rccLf;
      if (rect2Width <= rect1Width) {
        rect2Width = rect1Width + 0.3;
      }
      if (rect2Height <= rect1Height) {
        rect2Height = rect1Height + 0.3;
      }

      const foundationPoints2 = [
        [center[0] - rect2Width / 2, center[1] - rect2Height / 2, center[2]],
        [center[0] + rect2Width / 2, center[1] - rect2Height / 2, center[2]],
        [center[0] + rect2Width / 2, center[1] + rect2Height / 2, center[2]],
        [center[0] - rect2Width / 2, center[1] + rect2Height / 2, center[2]],
        [center[0] - rect2Width / 2, center[1] - rect2Height / 2, center[2]], // Close the loop
      ];

      // Push both foundations.
      newFoundations.push({
        id: uuidv4(),
        points: foundationPoints1,
      });
      newFoundations.push({
        id: uuidv4(),
        points: foundationPoints2,
      });
    });


    runInAction(() => {
      this.foundations = newFoundations;
    });
  }
}

const foundationStore = new FoundationStore();
export default foundationStore;
