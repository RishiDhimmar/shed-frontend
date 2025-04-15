import { makeAutoObservable, reaction, runInAction } from "mobx";
import { v4 as uuidv4 } from "uuid";
import columnStore from "./ColumnStore";
import uiStore from "./UIStore";

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
      pccWidth: 3.8,
      pccLength: 3.4,
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
      pccWidth: 3.8,
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
      pccWidth: 1.6,
      pccLength: 3.4,
      depthD: 0.45,
      depthd: 0.25,
      shortBarCount: 3,
      shortBarSpacing: 18,
      longBarCount: 5,
      longBarSpacing: 12,
    },
  };

  foundations: Foundation[] = [];

  // Store previous valid parameter values to revert in case of overlap
  previousValues: Record<FoundationType, Record<string, number>> = {
    corner: {},
    horizontal: {},
    vertical: {},
  };

  constructor() {
    makeAutoObservable(this);

    // Initialize previousValues with current values
    Object.keys(this.values).forEach((type) => {
      const foundationType = type as FoundationType;
      Object.keys(this.values[foundationType]).forEach((key) => {
        this.previousValues[foundationType][key] =
          this.values[foundationType][
            key as keyof (typeof this.values)[FoundationType]
          ];
      });
    });

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
    // Store the previous value before making changes
    this.previousValues[type][key] = this.values[type][key];

    runInAction(() => {
      this.values = {
        ...this.values,
        [type]: {
          ...this.values[type],
          [key]: value,
        },
      };
      uiStore.setModified(true);
    });

    // Generate foundations with new parameters and check for overlaps
    const hasOverlap = this.generateFoundations();

    // If overlap detected, revert to previous value
    if (hasOverlap) {
      runInAction(() => {
        this.values = {
          ...this.values,
          [type]: {
            ...this.values[type],
            [key]: this.previousValues[type][key],
          },
        };
      });

      // Regenerate foundations with reverted parameters
      this.generateFoundations();

      // Show warning to user
      console.warn(`Parameter change reverted due to foundation overlap`);
      alert("Cannot increase size: This would cause foundations to overlap");

      return false;
    }

    return true;
  }

  // Check if two foundations overlap
  checkOverlap(rect1: number[][], rect2: number[][]): boolean {
    // Get bounding boxes for quick overlap check
    const rect1BBox = this.getBoundingBox(rect1);
    const rect2BBox = this.getBoundingBox(rect2);

    // Check if bounding boxes overlap
    if (
      rect1BBox.maxX < rect2BBox.minX ||
      rect1BBox.minX > rect2BBox.maxX ||
      rect1BBox.maxY < rect2BBox.minY ||
      rect1BBox.minY > rect2BBox.maxY
    ) {
      return false; // No overlap
    }

    // If bounding boxes overlap, we have an overlap
    return true;
  }

  // Helper to get bounding box of a polygon
  getBoundingBox(points: number[][]) {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);

    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }

  generateFoundations(): boolean {
    const newFoundations: Foundation[] = [];
    let hasOverlap = false;

    columnStore.columns.forEach((column) => {
      // Calculate points for the column
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

      const type = column.type;
      if (!type) return;
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

      // --- Second Rectangle: Use the exact RccBf and rccLf values directly ---
      const rect2Width = params.pccWidth;
      const rect2Height = params.pccLength;

      const foundationPoints2 = [
        [center[0] - rect2Width / 2, center[1] - rect2Height / 2, center[2]],
        [center[0] + rect2Width / 2, center[1] - rect2Height / 2, center[2]],
        [center[0] + rect2Width / 2, center[1] + rect2Height / 2, center[2]],
        [center[0] - rect2Width / 2, center[1] + rect2Height / 2, center[2]],
        [center[0] - rect2Width / 2, center[1] - rect2Height / 2, center[2]], // Close the loop
      ];

      // Check for overlap with existing foundations
      for (const foundation of newFoundations) {
        if (
          this.checkOverlap(foundationPoints1, foundation.points) ||
          this.checkOverlap(foundationPoints2, foundation.points)
        ) {
          hasOverlap = true;
          break;
        }
      }

      // Only add new foundations if there's no overlap
      if (!hasOverlap) {
        newFoundations.push({ id: uuidv4(), points: foundationPoints1 });
        newFoundations.push({ id: uuidv4(), points: foundationPoints2 });
      }
    });

    // Update store only if there's no overlap
    if (!hasOverlap) {
      runInAction(() => {
        this.foundations = newFoundations;
      });
    }

    return hasOverlap;
  }
}

const foundationStore = new FoundationStore();
export default foundationStore;
