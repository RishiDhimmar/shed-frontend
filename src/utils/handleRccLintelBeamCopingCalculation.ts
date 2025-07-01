// import { toJS } from "mobx";
// import { convertToPointObjects } from "./PolygonUtils";
// import dxfStore from "../stores/DxfStore";
// import { items } from "./sheetItems";

// const handleRccLintelBeamCopingCalculation = () => {
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
//     (externalWallResult.length * 0.15 * 0.23).toFixed(3)
//   );
//   const widthVolume = parseFloat(
//     (externalWallResult.breadth * 0.15 * 0.23).toFixed(3)
//   );

//   totalVolume = parseFloat((lengthVolume * 2 + widthVolume * 2).toFixed(3));

//   measurements.push(
//     {
//       id: "brickwork-length",
//       description: "At Plinth",
//       nos: 2,
//       length: Number(Number(externalWallResult.length).toFixed(3)),
//       breadth: 0.23,
//       depth: 0.15,
//       area: lengthVolume * 2,
//     },
//     {
//       id: "brickwork-width",
//       description: "At Plinth",
//       nos: 2,
//       length: Number(Number(externalWallResult.breadth).toFixed(3)),
//       breadth: 0.23,
//       depth: 0.15,
//       area: widthVolume * 2,
//     },
//     //empty
//     {
//       id: "empty-length",
//       description: "",
//       nos: 0,
//       length: 0,
//       breadth: 0,
//       depth: 0,
//       area: 0,
//     },
//     {
//       id: "brickwork-length",
//       description: "At top of the wall",
//       nos: 2,
//       length: Number(Number(externalWallResult.length).toFixed(3)),
//       breadth: 0.23,
//       depth: 0.23,
//       area: Number((externalWallResult.length * 0.23 * 0.23 * 2).toFixed(3)),
//     },
//     {
//       id: "brickwork-width",
//       description: "At top of the wall",
//       nos: 2,
//       length: Number(Number(externalWallResult.breadth).toFixed(3)),
//       breadth: 0.23,
//       depth: 0.23,
//       area: Number((externalWallResult.breadth * 0.23 * 0.23 * 2).toFixed(3)),
//     }
//   );

//   items.rcc_lintel_beam_coping.total = ;
//   items.rcc_lintel_beam_coping.measurements = measurements;
// };

// export default handleRccLintelBeamCopingCalculation;

import { toJS } from "mobx";
import { convertToPointObjects } from "./PolygonUtils";
import dxfStore from "../stores/DxfStore";
import { items } from "./sheetItems";

const handleRccLintelBeamCopingCalculation = () => {
  const DEPTH = 0.23;
  let totalVolume = 0;
  const measurements = [];

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

  const lengthVolume = parseFloat(
    (externalWallResult.length * 0.15 * 0.23).toFixed(3)
  );
  const widthVolume = parseFloat(
    (externalWallResult.breadth * 0.15 * 0.23).toFixed(3)
  );

  const topLengthVolume = parseFloat(
    (externalWallResult.length * 0.23 * 0.23 * 2).toFixed(3)
  );
  const topWidthVolume = parseFloat(
    (externalWallResult.breadth * 0.23 * 0.23 * 2).toFixed(3)
  );

  totalVolume = parseFloat(
    (
      lengthVolume * 2 +
      widthVolume * 2 +
      topLengthVolume +
      topWidthVolume
    ).toFixed(3)
  );

  measurements.push(
    {
      id: "brickwork-length",
      description: "At Plinth",
      nos: 2,
      length: Number(Number(externalWallResult.length).toFixed(3)),
      breadth: 0.23,
      depth: 0.15,
      area: lengthVolume * 2,
    },
    {
      id: "brickwork-width",
      description: "At Plinth",
      nos: 2,
      length: Number(Number(externalWallResult.breadth).toFixed(3)),
      breadth: 0.23,
      depth: 0.15,
      area: widthVolume * 2,
    },
    {
      id: "empty-length",
      description: "",
      nos: 0,
      length: 0,
      breadth: 0,
      depth: 0,
      area: 0,
    },
    {
      id: "brickwork-length",
      description: "At top of the wall",
      nos: 2,
      length: Number(Number(externalWallResult.length).toFixed(3)),
      breadth: 0.23,
      depth: 0.23,
      area: topLengthVolume,
    },
    {
      id: "brickwork-width",
      description: "At top of the wall",
      nos: 2,
      length: Number(Number(externalWallResult.breadth).toFixed(3)),
      breadth: 0.23,
      depth: 0.23,
      area: topWidthVolume,
    }
  );

  items.rcc_lintel_beam_coping.total = totalVolume;
  items.rcc_lintel_beam_coping.measurements = measurements;
};

export default handleRccLintelBeamCopingCalculation;
