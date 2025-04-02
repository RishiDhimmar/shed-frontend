import { makeAutoObservable, reaction, runInAction } from "mobx";
import { v4 as uuidv4 } from "uuid";
import columnStore from "./ColumnStore";

export type FoundationType = "corner" | "horizontal" | "vertical";

export interface Foundation {
  id: string;
  points: number[][]; // Foundation polygon points
}

class FoundationStore {
  // Stores all foundation parameters per type
  values: Record<
    FoundationType,
    {
      RccBf: number;
      rccLf: number;
      pccWidth: number;
      pccLength: number;
      depthD: number;
      depthd: number;
      shortBarCount: number;
      shortBarSpacing: number;
      longBarCount: number;
      longBarSpacing: number;
    }
  > = {
    corner: {
      RccBf: 3.0,
      rccLf: 2.5,
      pccWidth: 1.5,
      pccLength: 1.5,
      depthD: 0.5,
      depthd: 0.3,
      shortBarCount: 4,
      shortBarSpacing: 20,
      longBarCount: 6,
      longBarSpacing: 15,
    },
    horizontal: {
      RccBf: 3.5,
      rccLf: 2.8,
      pccWidth: 1.6,
      pccLength: 1.6,
      depthD: 0.6,
      depthd: 0.35,
      shortBarCount: 5,
      shortBarSpacing: 22,
      longBarCount: 7,
      longBarSpacing: 18,
    },
    vertical: {
      RccBf: 2.8,
      rccLf: 2.3,
      pccWidth: 1.4,
      pccLength: 1.4,
      depthD: 0.45,
      depthd: 0.25,
      shortBarCount: 3,
      shortBarSpacing: 18,
      longBarCount: 5,
      longBarSpacing: 12,
    },
  };

  foundations: Foundation[] = [];

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => [columnStore.columns.slice(), this.values],
      () => this.generateFoundations()
    );
  }

  setParameter(
    type: FoundationType,
    key: keyof (typeof this.values)["corner"],
    value: number
  ) {
    runInAction(() => {
      this.values = {
        ...this.values,
        [type]: {
          ...this.values[type],
          [key]: value,
        },
      };
    });
  
    this.generateFoundations();
  }
  

  generateFoundations() {
    const newFoundations: Foundation[] = [];

    columnStore.columns.forEach((column) => {
      if (!column.points || column.points.length < 4) return;

      // Compute the bounding box and center of the column
      const xs = column.points.map((p) => p[0]);
      const ys = column.points.map((p) => p[1]);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const center = [
        (minX + maxX) / 2,
        (minY + maxY) / 2,
        column.points[0][2] || 0,
      ];

      const type = column.wall;
      const params = this.values[type];

      // --- First Rectangle: Slightly bigger than the column rectangle ---
      const margin = 0.3;
      const rect1Width = maxX - minX + margin;
      const rect1Height = maxY - minY + margin;

      const foundationPoints1 = [
        [center[0] - rect1Width / 2, center[1] - rect1Height / 2, center[2]],
        [center[0] + rect1Width / 2, center[1] - rect1Height / 2, center[2]],
        [center[0] + rect1Width / 2, center[1] + rect1Height / 2, center[2]],
        [center[0] - rect1Width / 2, center[1] + rect1Height / 2, center[2]],
        [center[0] - rect1Width / 2, center[1] - rect1Height / 2, center[2]], // Close the loop
      ];

      // --- Second Rectangle: Based on RCC values from the corresponding type ---
      let rect2Width = params.RccBf;
      let rect2Height = params.rccLf;
      if (rect2Width <= rect1Width) rect2Width = rect1Width + 0.3;
      if (rect2Height <= rect1Height) rect2Height = rect1Height + 0.3;

      const foundationPoints2 = [
        [center[0] - rect2Width / 2, center[1] - rect2Height / 2, center[2]],
        [center[0] + rect2Width / 2, center[1] - rect2Height / 2, center[2]],
        [center[0] + rect2Width / 2, center[1] + rect2Height / 2, center[2]],
        [center[0] - rect2Width / 2, center[1] + rect2Height / 2, center[2]],
        [center[0] - rect2Width / 2, center[1] - rect2Height / 2, center[2]], // Close the loop
      ];

      newFoundations.push({ id: uuidv4(), points: foundationPoints1 });
      newFoundations.push({ id: uuidv4(), points: foundationPoints2 });
    });

    runInAction(() => {
      this.foundations = newFoundations;
    });
  }
}

const foundationStore = new FoundationStore();
export default foundationStore;
