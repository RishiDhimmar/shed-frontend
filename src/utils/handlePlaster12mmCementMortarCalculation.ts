// import { toJS } from "mobx";
// import { convertToPointObjects } from "./PolygonUtils";
// import dxfStore from "../stores/DxfStore";
// import { items } from "./sheetItems";

// const handlePlaster12mmCementMortarCalculation = () => {
//   const DEPTH = 0.23;
//   let totalVolume = 0;
//   const measurements = [];

//   const calculateLengthBreadthArea = (points) => {
//     if (!points || points.length < 3) {
//       return {
//         length: 0,
//         breadth: 0,
//         area: 0,
//         error: "Invalid polygon: At least 3 points required",
//       };
//     }

//     const scaledPoints = points.map((p) => ({
//       x: p.x * 0.001,
//       y: p.y * 0.001,
//     }));

//     const xs = scaledPoints.map((p) => p.x);
//     const ys = scaledPoints.map((p) => p.y);
//     const length = Math.max(...xs) - Math.min(...xs);
//     const breadth = Math.max(...ys) - Math.min(...ys);

//     // Shoelace formula for area
//     let area = 0;
//     const n = scaledPoints.length;
//     for (let i = 0; i < n; i++) {
//       const j = (i + 1) % n;
//       area += scaledPoints[i].x * scaledPoints[j].y;
//       area -= scaledPoints[j].x * scaledPoints[i].y;
//     }
//     area = Math.abs(area) / 2;

//     return {
//       length: parseFloat(length.toFixed(4)),
//       breadth: parseFloat(breadth.toFixed(4)),
//       area: parseFloat((area * DEPTH).toFixed(4)),
//     };
//   };

//   const externalWallResult = calculateLengthBreadthArea(
//     convertToPointObjects(toJS(dxfStore.externalWallPolygon))
//   );

//   // Add brickwork volume using length and breadth of external wall with fixed depth 0.23
//   const lengthVolume = parseFloat(
//     (externalWallResult.length * 1 * 3).toFixed(3)
//   );
//   const widthVolume = parseFloat(
//     (externalWallResult.breadth * 1 * 3).toFixed(3)
//   );

//   totalVolume = parseFloat((lengthVolume * 2 + widthVolume * 2).toFixed(3));

//   measurements.push(
//     {
//       id: "brickwork-length",
//       description: "Inner wall Plaster",
//       nos: 2,
//       length: Number(Number(externalWallResult.length).toFixed(3)),
//       breadth: 1,
//       depth: 3,
//       area: lengthVolume * 2,
//     },
//     {
//       id: "brickwork-width",
//       description: "Inner wall Plaster",
//       nos: 2,
//       length: Number(Number(externalWallResult.breadth).toFixed(3)),
//       breadth: 1,
//       depth: 3,
//       area: widthVolume * 2,
//     }
//     //empty
//   );

//   items.plaster_12mm_cement_mortar.total = totalVolume;
//   items.plaster_12mm_cement_mortar.measurements = measurements;

//   const measurements2 = [];
//   const lengthVolume2 = parseFloat(
//     (externalWallResult.length * 1 * 3.6).toFixed(3)
//   );
//   const widthVolume2 = parseFloat(
//     (externalWallResult.breadth * 1 * 3.6).toFixed(3)
//   );

//   measurements2.push(
//     {
//       id: "brickwork-length",
//       description: "Outer wall Plaster",
//       nos: 2,
//       length: Number(Number(externalWallResult.length).toFixed(3)),
//       breadth: 1,
//       depth: 3.6,
//       area: lengthVolume2 * 2,
//     },
//     {
//       id: "brickwork-width",
//       description: "Outer wall Plaster",
//       nos: 2,
//       length: Number(Number(externalWallResult.breadth).toFixed(3)),
//       breadth: 1,
//       depth: 3.6,
//       area: widthVolume2 * 2,
//     }
//   );
//   items.plaster_18mm_two_coat.measurements = measurements2;
//   items.plaster_18mm_two_coat.total = lengthVolume2 * 2 + widthVolume2 * 2;
// };

// export default handlePlaster12mmCementMortarCalculation;

import { toJS } from "mobx";
import { convertToPointObjects } from "./PolygonUtils";
import dxfStore from "../stores/DxfStore";
import { items } from "./sheetItems";
import mullionColumnStore from "../stores/MullianColumnStore";
import wallStore from "../stores/WallStore";

const handlePlaster12mmCementMortarCalculation = () => {
  const DEPTH = 0.23;
  const heightInner = 3;
  const heightOuter = 3.6;
  const windowLength = 1.524;
  const windowBreadth = 1.524;
  const shutterLength = 3;
  const shutterBreadth = 3;

  const calculateLengthBreadthArea = (points) => {
    if (!points || points.length < 3) {
      return {
        length: 0,
        breadth: 0,
        area: 0,
        error: "Invalid polygon: At least 3 points required",
      };
    }

    const scaledPoints = points.map((p) => ({
      x: p.x * 0.001,
      y: p.y * 0.001,
    }));

    const xs = scaledPoints.map((p) => p.x);
    const ys = scaledPoints.map((p) => p.y);
    const length = Math.max(...xs) - Math.min(...xs);
    const breadth = Math.max(...ys) - Math.min(...ys);

    // Shoelace formula for area
    let area = 0;
    const n = scaledPoints.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += scaledPoints[i].x * scaledPoints[j].y;
      area -= scaledPoints[j].x * scaledPoints[i].y;
    }
    area = Math.abs(area) / 2;

    return {
      length: parseFloat(length.toFixed(4)),
      breadth: parseFloat(breadth.toFixed(4)),
      area: parseFloat((area * DEPTH).toFixed(4)),
    };
  };

  const externalWallResult = calculateLengthBreadthArea(
    convertToPointObjects(toJS(dxfStore.externalWallPolygon))
  );

  // Inner Plaster
  const lengthVolumeInner = externalWallResult.length * 1 * heightInner;
  const widthVolumeInner = externalWallResult.breadth * 1 * heightInner;
  const grossInnerVolume = (lengthVolumeInner + widthVolumeInner) * 2;

  const measurementsInner = [
    {
      id: "plaster-inner-length",
      description: "Inner wall Plaster",
      nos: 2,
      length: Number(externalWallResult.length.toFixed(3)),
      breadth: 1,
      depth: heightInner,
      area: parseFloat((lengthVolumeInner * 2).toFixed(3)),
    },
    {
      id: "plaster-inner-width",
      description: "Inner wall Plaster",
      nos: 2,
      length: Number(externalWallResult.breadth.toFixed(3)),
      breadth: 1,
      depth: heightInner,
      area: parseFloat((widthVolumeInner * 2).toFixed(3)),
    },
  ];

  // Deductions for inner plaster
  const windowAreaInner =
    (mullionColumnStore.windows *
      windowLength *
      windowBreadth *
      wallStore.wallThickness) /
    1000;
  const shutterAreaInner =
    (mullionColumnStore.shutters *
      shutterLength *
      shutterBreadth *
      wallStore.wallThickness) /
    1000;

  measurementsInner.push(
    {
      id: "deduction-inner-window",
      description: "Deduction for windows (inner plaster)",
      nos: mullionColumnStore.windows,
      length: windowLength,
      breadth: windowBreadth,
      depth: Number((wallStore.wallThickness / 1000).toFixed(3)),
      area: parseFloat(windowAreaInner.toFixed(3)),
    },
    {
      id: "deduction-inner-shutter",
      description: "Deduction for shutters (inner plaster)",
      nos: mullionColumnStore.shutters,
      length: shutterLength,
      breadth: shutterBreadth,
      depth: Number((wallStore.wallThickness / 1000).toFixed(3)),
      area: parseFloat(shutterAreaInner.toFixed(3)),
    }
  );

  const totalInnerDeductions = windowAreaInner + shutterAreaInner;
  const netInnerVolume = parseFloat(
    (grossInnerVolume - totalInnerDeductions).toFixed(3)
  );

  items.plaster_12mm_cement_mortar.measurements = measurementsInner;
  items.plaster_12mm_cement_mortar.total = netInnerVolume;

  // Outer Plaster
  const lengthVolumeOuter = externalWallResult.length * 1 * heightOuter;
  const widthVolumeOuter = externalWallResult.breadth * 1 * heightOuter;
  const grossOuterVolume = (lengthVolumeOuter + widthVolumeOuter) * 2;

  const measurementsOuter = [
    {
      id: "plaster-outer-length",
      description: "Outer wall Plaster",
      nos: 2,
      length: Number(externalWallResult.length.toFixed(3)),
      breadth: 1,
      depth: heightOuter,
      area: parseFloat((lengthVolumeOuter * 2).toFixed(3)),
    },
    {
      id: "plaster-outer-width",
      description: "Outer wall Plaster",
      nos: 2,
      length: Number(externalWallResult.breadth.toFixed(3)),
      breadth: 1,
      depth: heightOuter,
      area: parseFloat((widthVolumeOuter * 2).toFixed(3)),
    },
  ];

  // Deductions for outer plaster
  const windowAreaOuter = windowAreaInner; // same windows
  const shutterAreaOuter = shutterAreaInner; // same shutters

  measurementsOuter.push(
    {
      id: "deduction-outer-window",
      description: "Deduction for windows (outer plaster)",
      nos: mullionColumnStore.windows,
      length: windowLength,
      breadth: windowBreadth,
      depth: Number((wallStore.wallThickness / 1000).toFixed(3)),
      area: parseFloat(windowAreaOuter.toFixed(3)),
    },
    {
      id: "deduction-outer-shutter",
      description: "Deduction for shutters (outer plaster)",
      nos: mullionColumnStore.shutters,
      length: shutterLength,
      breadth: shutterBreadth,
      depth: Number((wallStore.wallThickness / 1000).toFixed(3)),
      area: parseFloat(shutterAreaOuter.toFixed(3)),
    }
  );

  const totalOuterDeductions = windowAreaOuter + shutterAreaOuter;
  const netOuterVolume = parseFloat(
    (grossOuterVolume - totalOuterDeductions).toFixed(3)
  );

  items.plaster_18mm_two_coat.measurements = measurementsOuter;
  items.plaster_18mm_two_coat.total = netOuterVolume;
};

export default handlePlaster12mmCementMortarCalculation;
