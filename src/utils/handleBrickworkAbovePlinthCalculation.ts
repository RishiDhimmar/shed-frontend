// import { toJS } from "mobx";
// import { convertToPointObjects } from "./PolygonUtils";
// import { items } from "./sheetItems";
// import dxfStore from "../stores/DxfStore";
// import wallStore from "../stores/WallStore";
// import configStore from "../stores/ConfigStore";
// import baseplateStore from "../stores/BasePlateStore";
// import mullionColumnStore from "../stores/MullianColumnStore";

// const handleBrickworkAbovePlinthCalculation = () => {
//   const DEPTH = wallStore.wallThickness / 1000;
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

//   const lengthVolume = parseFloat(
//     (
//       (externalWallResult.length * 0.6 * wallStore.wallThickness) /
//       1000
//     ).toFixed(3)
//   );
//   const widthVolume = parseFloat(
//     (
//       (externalWallResult.breadth * 0.6 * wallStore.wallThickness) /
//       1000
//     ).toFixed(3)
//   );

//   totalVolume = parseFloat((lengthVolume + widthVolume).toFixed(3));

//   measurements.push(
//     {
//       id: "brickwork-length",
//       description: "Brickwork above plinth",
//       nos: 2,
//       length: Number(Number(externalWallResult.length).toFixed(3)),
//       breadth: wallStore.wallThickness / 1000,
//       depth: configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
//       area: Number(
//         (Number(externalWallResult.length * wallStore.wallThickness) / 1000) *
//           2 *
//           configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT
//       ).toFixed(3),
//     },
//     {
//       id: "brickwork-width",
//       description: "Brickwork above plinth",
//       nos: 2,
//       length: Number(Number(externalWallResult.breadth).toFixed(3)),
//       breadth: wallStore.wallThickness / 1000,
//       depth: configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
//       area: Number(
//         (Number(externalWallResult.breadth * wallStore.wallThickness) / 1000) *
//           2 *
//           configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT
//       ).toFixed(3),
//     },
//     {
//       id: "empty",
//       description: "deductions",
//       nos: 0,
//       length: 0,
//       breadth: 0,
//       depth: 0,
//       area: 0,
//     }
//   );

//   //deductions

//   const totalMC =
//     baseplateStore.cornerBasePlates.length +
//     baseplateStore.edgeBasePlates.length;

//   measurements.push({
//     id: "deductions",
//     description: "deductions for mullion columns",
//     nos: totalMC,
//     length: wallStore.wallThickness / 1000,
//     breadth: wallStore.wallThickness / 1000,
//     depth: configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
//     area:
//       totalMC *
//       (wallStore.wallThickness / 1000) *
//       (wallStore.wallThickness / 1000) *
//       configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
//   });

//   //windows and shutters
//   measurements.push({
//     id: "deductions",
//     description: "deductions for windows ",
//     nos: mullionColumnStore.windows,
//     length: 1.524,
//     breadth: 1.524,
//     depth: wallStore.wallThickness / 1000,
//     area:
//       (mullionColumnStore.windows * 1.524 * 1.524 * wallStore.wallThickness) /
//       1000,
//   });

//   measurements.push({
//     id: "deductions",
//     description: "deductions for shutters ",
//     nos: mullionColumnStore.shutters,
//     length: 3,
//     breadth: 3,
//     depth: wallStore.wallThickness / 1000,
//     area:
//       (mullionColumnStore.shutters * 3 * 3 * wallStore.wallThickness) / 1000,
//   });

//   // ✅ Final total from measurement areas
//   const deductionItem = measurements.find((m) => m.id === "deductions");
//   const deductionArea = deductionItem ? Number(deductionItem.area) : 0;

//   const computedTotal =
//     measurements
//       .filter((m) => m.id !== "empty" && m.id !== "deductions")
//       .reduce((sum, m) => sum + Number(m.area), 0) - deductionArea;

//   items.brickwork_above_plinth.measurements = measurements;
//   items.brickwork_above_plinth.total = parseFloat(computedTotal.toFixed(3));

//   return {
//     totalVolume,
//     measurements,
//   };
// };

// export default handleBrickworkAbovePlinthCalculation;

import { toJS } from "mobx";
import { convertToPointObjects } from "./PolygonUtils";
import { items } from "./sheetItems";
import dxfStore from "../stores/DxfStore";
import wallStore from "../stores/WallStore";
import configStore from "../stores/ConfigStore";
import baseplateStore from "../stores/BasePlateStore";
import mullionColumnStore from "../stores/MullianColumnStore";

const handleBrickworkAbovePlinthCalculation = () => {
  const DEPTH = wallStore.wallThickness / 1000;
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
    (
      (externalWallResult.length * 0.6 * wallStore.wallThickness) /
      1000
    ).toFixed(3)
  );
  const widthVolume = parseFloat(
    (
      (externalWallResult.breadth * 0.6 * wallStore.wallThickness) /
      1000
    ).toFixed(3)
  );

  totalVolume = parseFloat((lengthVolume + widthVolume).toFixed(3));

  measurements.push(
    {
      id: "brickwork-length",
      description: "Brickwork above plinth",
      nos: 2,
      length: Number(Number(externalWallResult.length).toFixed(3)),
      breadth: Number((wallStore.wallThickness / 1000).toFixed(3)),
      depth: configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
      area: Number(
        (
          (Number(externalWallResult.length * wallStore.wallThickness) / 1000) *
          2 *
          configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT
        ).toFixed(3)
      ),
    },
    {
      id: "brickwork-width",
      description: "Brickwork above plinth",
      nos: 2,
      length: Number(Number(externalWallResult.breadth).toFixed(3)),
      breadth: Number((wallStore.wallThickness / 1000).toFixed(3)),
      depth: configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
      area: Number(
        (
          (Number(externalWallResult.breadth * wallStore.wallThickness) /
            1000) *
          2 *
          configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT
        ).toFixed(3)
      ),
    },
    {
      id: "empty",
      description: "deductions",
      nos: 0,
      length: 0,
      breadth: 0,
      depth: 0,
      area: 0,
    }
  );

  // 🔻 Deductions - use unique IDs
  const totalMC =
    baseplateStore.cornerBasePlates.length +
    baseplateStore.edgeBasePlates.length;

  measurements.push({
    id: "deduction-mullions",
    description: "Deductions for mullion columns",
    nos: totalMC,
    length: Number((wallStore.wallThickness / 1000).toFixed(3)),
    breadth: Number((wallStore.wallThickness / 1000).toFixed(3)),
    depth: configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
    area: Number(
      (
        totalMC *
        (wallStore.wallThickness / 1000) *
        (wallStore.wallThickness / 1000) *
        configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT
      ).toFixed(3)
    ),
  });

  measurements.push({
    id: "deduction-windows",
    description: "Deductions for windows",
    nos: mullionColumnStore.windows,
    length: 1.524,
    breadth: 1.524,
    depth: Number((wallStore.wallThickness / 1000).toFixed(3)),
    area: Number(
      (
        (mullionColumnStore.windows * 1.524 * 1.524 * wallStore.wallThickness) /
        1000
      ).toFixed(3)
    ),
  });

  measurements.push({
    id: "deduction-shutters",
    description: "Deductions for shutters",
    nos: mullionColumnStore.shutters,
    length: 3,
    breadth: 3,
    depth: Number((wallStore.wallThickness / 1000).toFixed(3)),
    area: Number(
      (
        (mullionColumnStore.shutters * 3 * 3 * wallStore.wallThickness) /
        1000
      ).toFixed(3)
    ),
  });

  // ✅ Compute total deduction area
  const totalDeductionArea = measurements
    .filter((m) => m.id.startsWith("deduction"))
    .reduce((sum, m) => sum + Number(m.area), 0);

  const computedTotal =
    measurements
      .filter((m) => !m.id.startsWith("deduction") && m.id !== "empty")
      .reduce((sum, m) => sum + Number(m.area), 0) - totalDeductionArea;

  items.brickwork_above_plinth.measurements = measurements;
  items.brickwork_above_plinth.total = parseFloat(computedTotal.toFixed(3));

  return {
    totalVolume,
    measurements,
  };
};

export default handleBrickworkAbovePlinthCalculation;
