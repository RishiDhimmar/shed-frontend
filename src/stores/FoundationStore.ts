import { makeAutoObservable, reaction, runInAction } from "mobx";
import { v4 as uuidv4 } from "uuid";
import columnStore from "./ColumnStore";
import uiStore from "./UIStore";
import { generateCenterFromRectanglePoints } from "../utils/GeometryUtils";
import {
  generateBiggerPolygonAtSomeOffset,
  getBiggerRectangleAtOffset,
} from "../utils/PolygonUtils";
import { baseplateAssumptions } from "../components/assumptions/assumptionsInfo";
import baseplateStore from "./BasePlateStore";

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
      pccWidth: 18.5,
      pccLength: 21,
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
  innerPolygons: number[][][] = [];
  outerPolygons: number[][][] = [];
  polygons: number[][][] = [];
  foundationInputs: Record<string, number[]> = {};

  // Store previous valid parameter values to revert in case of overlap
  previousValues: Record<FoundationType, Record<string, number>> = {
    corner: {},
    horizontal: {},
    vertical: {},
  };

  setFoundationInputs(foundationInputs: Record<string, number[]>) {
    runInAction(() => {
      this.foundationInputs = foundationInputs;
      uiStore.setModified(true);
    });
    this.generateFoundations();
  }

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
  setInnerPolygons(newPolygons: number[][][]) {
    runInAction(() => {
      this.innerPolygons = newPolygons;
      uiStore.setModified(true);
    });
  }

  setOuterPolygons(newPolygons: number[][][]) {
    runInAction(() => {
      this.outerPolygons = newPolygons;
      uiStore.setModified(true);
    });
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

  generateFoundationInputs() {
    baseplateStore.groups.forEach((group) => {
      this.foundationInputs[group.name] = {
        "+x": 500,
        "-x": 500,
        "+y": 500,
        "-y": 500,
      };
    });
  }

  generateFoundations() {
    if (Object.keys(this.foundationInputs).length == 0)
      this.generateFoundationInputs();
    this.polygons = columnStore.polygons.map((group) => {
      return group.map((column) => {
        const innerFoundationPoints = getBiggerRectangleAtOffset(
          column,
          75,
          75,
          75,
          75
        );
        const outerFoundationPoints = getBiggerRectangleAtOffset(
          column,
          this.foundationInputs[column.group]["+x"],
          this.foundationInputs[column.group]["-x"],
          this.foundationInputs[column.group]["+y"],
          this.foundationInputs[column.group]["-y"]
        );

        const ppcPoints = getBiggerRectangleAtOffset(
          column,
          this.foundationInputs[column.group]["+x"] + 150,
          this.foundationInputs[column.group]["-x"] + 150,
          this.foundationInputs[column.group]["+y"] + 150,
          this.foundationInputs[column.group]["-y"] + 150
        );


        return {
          innerFoundationPoints: innerFoundationPoints,
          outerFoundationPoints: outerFoundationPoints,
          ppcPoints: ppcPoints,
          label: `F${column.label.slice(1)}`,
        };
      });
    });

    this.foundations = this.polygons.flat();
  }
}

const foundationStore = new FoundationStore();
export default foundationStore;
