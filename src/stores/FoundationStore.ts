// import { makeAutoObservable, reaction, runInAction } from "mobx";
// import { v4 as uuidv4 } from "uuid";
// import columnStore from "./ColumnStore";
// import { generateCenterFromRectanglePoints, Point } from "../utils/GeometryUtils"; // adjust the import path as needed

// export interface Foundation {
//   id: string;
//   points: number[][]; // Foundation polygon points (e.g. a rectangle)
// }

// export class FoundationStore {
//   // Foundation parameters
//   RccBf: number = 0;
//   rccLf: number = 0;
//   pccWidth: number = 0;
//   pccLength: number = 0;
//   depthD: number = 0;
//   depthd: number = 0;
//   shortBarCount: number = 0;
//   shortBarSpacing: number = 0;
//   longBarCount: number = 0;
//   longBarSpacing: number = 0;

//   foundations: Foundation[] = [];

//   constructor() {
//     makeAutoObservable(this);

//     // Whenever the column geometry or the foundation dimensions change,
//     // generate foundations using the column center as the foundation center.
//     reaction(
//       () => [columnStore.columns.slice(), this.pccWidth, this.pccLength],
//       ([columns, pccWidth, pccLength]) => {
//         if (columns.length > 0 && pccWidth > 0 && pccLength > 0) {
//           this.generateFoundations();
//         }
//       }
//     );
//   }

//   // Setters for foundation parameters

//   setRccBF(value: number) {
//     this.RccBf = value;
//   }

//   setRccLf(value: number) {
//     this.rccLf = value;
//   }

//   setPccWidth(value: number = 2.1) {
//     this.pccWidth = value;
//   }

//   setPccLength(value: number = 1.8) {
//     this.pccLength = value;
//   }

//   setDepthD(value: number) {
//     this.depthD = value;
//   }

//   setDepthd(value: number) {
//     this.depthd = value;
//   }

//   setShortBarCount(value: number) {
//     this.shortBarCount = value;
//   }

//   setShortBarSpacing(value: number) {
//     this.shortBarSpacing = value;
//   }

//   setLongBarCount(value: number) {
//     this.longBarCount = value;
//   }

//   setLongBarSpacing(value: number) {
//     this.longBarSpacing = value;
//   }

//   // Generate foundation geometry based on each column's center.
//   // For each column, we compute its center using generateCenterFromRectanglePoints,
//   // then generate a rectangle (foundation) centered at that point with width = pccWidth and length = pccLength.
//   generateFoundations() {
//     const newFoundations: Foundation[] = [];
  
//     columnStore.columns.forEach((column) => {
//       // Check that the column has at least 4 points.
//       if (!column.points || column.points.length < 4) {
//         console.warn("Skipping column because of insufficient points:", column.points);
//         return;
//       }
  
//       // Compute the column center by averaging all points.
//       const center = column.points.reduce(
//         (acc, point) => [acc[0] + point[0], acc[1] + point[1], acc[2] + point[2]],
//         [0, 0, 0]
//       ).map(val => val / column.points.length);
  
//       // Validate that the center does not contain NaN values.
//       if (isNaN(center[0]) || isNaN(center[1]) || isNaN(center[2])) {
//         console.warn("Computed center contains NaN", center, "for column points:", column.points);
//         return;
//       }
  
//       // Ensure pccWidth and pccLength are valid numbers.
//       if (!this.pccWidth || !this.pccLength) {
//         console.warn("Foundation dimensions are invalid:", this.pccWidth, this.pccLength);
//         return;
//       }
  
//       const halfWidth = this.pccWidth / 2;
//       const halfLength = this.pccLength / 2;
  
//       // Create a rectangle centered on 'center'
//       // Order: bottom-left, bottom-right, top-right, top-left.
//       // Optionally, add the first point at the end to "close" the loop.
//       const foundationPoints = [
//         [center[0] - halfLength, center[1] - halfWidth, center[2]],
//         [center[0] + halfLength, center[1] - halfWidth, center[2]],
//         [center[0] + halfLength, center[1] + halfWidth, center[2]],
//         [center[0] - halfLength, center[1] + halfWidth, center[2]],
//         [center[0] - halfLength, center[1] - halfWidth, center[2]], // closes the loop
//       ];
  
//       newFoundations.push({
//         id: uuidv4(),
//         points: foundationPoints,
//       });
//     });
  
//     runInAction(() => {
//       this.foundations = newFoundations;
//     });
  
//     console.log("Generated Foundations:", newFoundations);
//   }
  
// }

// const foundationStore = new FoundationStore();
// export default foundationStore;


import { makeAutoObservable, reaction, runInAction } from "mobx";
import { v4 as uuidv4 } from "uuid";
import columnStore from "./ColumnStore";
import { generateCenterFromRectanglePoints, Point } from "../utils/GeometryUtils"; // adjust the import path as needed

export interface Foundation {
  id: string;
  points: number[][]; // Foundation polygon points (e.g. a rectangle)
}

export class FoundationStore {
  // Foundation parameters with initial values
  RccBf: number = 500;       // Example: foundation width (in mm or units)
  rccLf: number = 300;       // Example: foundation length
  pccWidth: number = 3;     // Concrete pcc width
  pccLength: number = 3;    // Concrete pcc length
  depthD: number = 0.5;       // Foundation depth D
  depthd: number = 0.3;       // Foundation depth d
  shortBarCount: number = 4;
  shortBarSpacing: number = 0.15;
  longBarCount: number = 2;
  longBarSpacing: number = 0.3;

  foundations: Foundation[] = [];

  constructor() {
    makeAutoObservable(this);

    // Whenever the column geometry or the foundation dimensions change,
    // generate foundations using the column center as the foundation center.
    reaction(
      () => [columnStore.columns.slice(), this.pccWidth, this.pccLength],
      ([columns, pccWidth, pccLength]) => {
        if (columns.length > 0 && pccWidth > 0 && pccLength > 0) {
          this.generateFoundations();
        }
      }
    );
  }

  // Setters for foundation parameters
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

  // Generate foundation geometry based on each column's center.
  // For each column, compute its center using the helper function,
  // then create a rectangle (foundation) centered at that point with width = pccWidth and length = pccLength.
  generateFoundations() {
    const newFoundations: Foundation[] = [];
  
    columnStore.columns.forEach((column) => {
      // Check that the column has at least 4 points.
      if (!column.points || column.points.length < 4) {
        console.warn("Skipping column due to insufficient points:", column.points);
        return;
      }
  
      // Compute the column center by averaging all points.
      const center = column.points.reduce(
        (acc, point) => [acc[0] + point[0], acc[1] + point[1], acc[2] + point[2]],
        [0, 0, 0]
      ).map(val => val / column.points.length);
  
      // Validate that the center does not contain NaN values.
      if (isNaN(center[0]) || isNaN(center[1]) || isNaN(center[2])) {
        console.warn("Computed center contains NaN", center, "for column points:", column.points);
        return;
      }
  
      // Ensure foundation dimensions are valid.
      if (!this.pccWidth || !this.pccLength) {
        console.warn("Foundation dimensions are invalid:", this.pccWidth, this.pccLength);
        return;
      }
  
      const halfWidth = this.pccWidth / 2;
      const halfLength = this.pccLength / 2;
  
      // Create a rectangle centered on 'center'
      // Order: bottom-left, bottom-right, top-right, top-left.
      // Optionally, add the first point at the end to "close" the loop.
      const foundationPoints = [
        [center[0] - halfLength, center[1] - halfWidth, center[2]],
        [center[0] + halfLength, center[1] - halfWidth, center[2]],
        [center[0] + halfLength, center[1] + halfWidth, center[2]],
        [center[0] - halfLength, center[1] + halfWidth, center[2]],
        [center[0] - halfLength, center[1] - halfWidth, center[2]], // closes the loop
      ];
  
      newFoundations.push({
        id: uuidv4(),
        points: foundationPoints,
      });
    });
  
    runInAction(() => {
      this.foundations = newFoundations;
    });
  
    console.log("Generated Foundations:", newFoundations);
  }
}

const foundationStore = new FoundationStore();
export default foundationStore;
