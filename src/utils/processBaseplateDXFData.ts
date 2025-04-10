import { pointArrayToArrayLowerCase } from "./ConversionUtils";
import baseplateStore, {
  BaseplateType,
  WallType,
} from "../stores/BasePlateStore";
import wallStore from "../stores/WallStore";

export const processBaseplates = (jsonData: string) => {
  if (!jsonData) return;

  let data;
  try {
    data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
  } catch (error) {
    console.error("Invalid JSON data:", error);
    return;
  }
  if (!data.entities || !Array.isArray(data.entities)) return;

  const baseplateEntities = data.entities.filter(
    (e: any) =>
      e?.type === "LWPOLYLINE" &&
      Array.isArray(e.vertices) &&
      e.vertices.every(
        (v: any) => typeof v.x === "number" && typeof v.y === "number"
      )
  );

  const getCenter = (vertices: { x: number; y: number }[]) => {
    const xs = vertices.map((v) => v.x);
    const ys = vertices.map((v) => v.y);
    return [
      (Math.min(...xs) + Math.max(...xs)) / 2,
      (Math.min(...ys) + Math.max(...ys)) / 2,
    ];
  };

  const usedEntities = new Set();
  baseplateStore.basePlates = [];

  // --- Identify corner plates using center points.
  let topLeft: any, topRight: any, bottomLeft: any, bottomRight: any;

  let lowestXVertex  : number | null= null;
  let lowestYVertex  : number | null= null;
  let highestXVertex : number | null= null;
  let highestYVertex : number | null= null;

  baseplateEntities.forEach((entity: any) => {
    if (entity.vertices.length !== 4) return;

    entity.vertices.forEach((point: any) => {
      if (lowestXVertex === null || point.x <= lowestXVertex) {
        lowestXVertex = point.x;
      }
      if (lowestYVertex === null || point.y < lowestYVertex) {
        lowestYVertex = point.y;
      }
      if (highestXVertex === null || point.x > highestXVertex) {
        highestXVertex = point.x;
      }
      if (highestYVertex === null || point.y > highestYVertex) {
        highestYVertex = point.y;
      }
    });
  });

  baseplateEntities.forEach((entity: any) => {
    if (entity.vertices.length !== 4) return;

    entity.vertices.forEach((point: any) => {
      if (point.x === lowestXVertex && point.y === lowestYVertex) {
        bottomLeft = entity;
        entity.subtype = "bottom-left";
        baseplateStore.basePlates.push(
          baseplateStore.createBaseplate(
            getCenter(entity.vertices)[0],
            getCenter(entity.vertices)[1],
            "corner" as BaseplateType,
            "bottom-left" as WallType,
            pointArrayToArrayLowerCase(entity.vertices)
          )
        );
      } else if (point.x === highestXVertex && point.y === lowestYVertex) {
        bottomRight = entity;
        entity.subtype = "bottom-right";
        baseplateStore.basePlates.push(
          baseplateStore.createBaseplate(
            getCenter(entity.vertices)[0],
            getCenter(entity.vertices)[1],
            "corner" as BaseplateType,
            "bottom-right" as WallType,
            pointArrayToArrayLowerCase(entity.vertices)
          )
        );
      } else if (point.x === lowestXVertex && point.y === highestYVertex) {
        topRight = entity;
        entity.subtype = "top-right";
        baseplateStore.basePlates.push(
          baseplateStore.createBaseplate(
            getCenter(entity.vertices)[0],
            getCenter(entity.vertices)[1],
            "corner" as BaseplateType,
            "top-right" as WallType,
            pointArrayToArrayLowerCase(entity.vertices)
          )
        );
      } else if (point.x === highestXVertex && point.y === highestYVertex) {
        topLeft = entity;
        entity.subtype = "top-left";
        baseplateStore.basePlates.push(
          baseplateStore.createBaseplate(
            getCenter(entity.vertices)[0],
            getCenter(entity.vertices)[1],
            "corner" as BaseplateType,
            "top-left" as WallType,
            pointArrayToArrayLowerCase(entity.vertices)
          )
        );
      }
    });
  });

  const createWallPlates2 = (
    startEntity: any,
    type: string,
    subtype: string,
  ) => {
    baseplateEntities.forEach((entity: any) => {
      if (
        usedEntities.has(entity) ||
        entity._isCorner ||
        !entity?.vertices ||
        entity.subtype
      )
        return;

      if (
        entity.subType === "top-left" ||
        entity.subType === "top-right" ||
        entity.subType === "bottom-left" ||
        entity.subType === "bottom-right"
      ) {
        return;
      }

      if (subtype === "left" || subtype == "right") {
        if (
          Math.abs(entity.vertices[0].x - startEntity.vertices[0].x) < 0.9 && // entity.vertices[0][0] === startEntity.vertices[0][0] &&
          Math.abs(entity.vertices[1].x - startEntity.vertices[1].x) < 0.9 && // entity.vertices[1][0] === startEntity.vertices[1][0] &&
          Math.abs(entity.vertices[2].x - startEntity.vertices[2].x) < 0.9 && // entity.vertices[2][0] === startEntity.vertices[2][0] &&
          Math.abs(entity.vertices[3].x - startEntity.vertices[3].x) < 0.9 // entity.vertices[3][0] === startEntity.vertices[3][0]
        ) {
          baseplateStore.basePlates.push(
            baseplateStore.createBaseplate(
              getCenter(entity.vertices)[0],
              getCenter(entity.vertices)[1],
              type as BaseplateType,
              subtype as WallType,
              pointArrayToArrayLowerCase(entity.vertices)
            )
          );
        }
      } else if (subtype === "top" || subtype === "bottom") {
        if (
          Math.abs(entity.vertices[0].y - startEntity.vertices[0].y) < 0.9 && // entity.vertices[0][0] === startEntity.vertices[0][0] &&
          Math.abs(entity.vertices[1].y - startEntity.vertices[1].y) < 0.9 && // entity.vertices[1][0] === startEntity.vertices[1][0] &&
          Math.abs(entity.vertices[2].y - startEntity.vertices[2].y) < 0.9 && // entity.vertices[2][0] === startEntity.vertices[2][0] &&
          Math.abs(entity.vertices[3].y - startEntity.vertices[3].y) < 0.9 // entity.vertices[3][0] === startEntity.vertices[3][0]
        ) {
          console.log(baseplateStore.idealHorizontalDistance);
          baseplateStore.basePlates.push(
            baseplateStore.createBaseplate(
              getCenter(entity.vertices)[0],
              getCenter(entity.vertices)[1],
              type as BaseplateType,
              subtype as WallType,
              pointArrayToArrayLowerCase(entity.vertices)
            )
          );
        }
      }
    });
  };

  if (topLeft && bottomLeft)
    createWallPlates2(topLeft,"horizontal", "left");
  if (topRight && bottomRight)
    createWallPlates2(topRight,  "horizontal", "right");
  if (topLeft && topRight)
    createWallPlates2(topLeft,  "vertical", "top");
  if (bottomLeft && bottomRight)
    createWallPlates2(bottomLeft, "vertical", "bottom");

  // --- Calculate dimensions for one horizontal, one vertical, and one corner baseplate
  const getLengthWidth = (bp: any) => {
    if (!bp?.points || bp.points.length === 0) return { length: 0, width: 0 };
    const xs = bp.points.map((p: number[]) => p[0]);
    const ys = bp.points.map((p: number[]) => p[1]);
    return {
      length: Math.max(...xs) - Math.min(...xs),
      width: Math.max(...ys) - Math.min(...ys),
    };
  };

  const oneHorizontal = baseplateStore.basePlates.find(
    (bp: any) => bp.type === "horizontal"
  );
  const oneVertical = baseplateStore.basePlates.find(
    (bp: any) => bp.type === "vertical"
  );
  const oneCorner = baseplateStore.basePlates.find(
    (bp: any) => bp.type === "corner"
  );

  const horizontal = oneHorizontal
    ? getLengthWidth(oneHorizontal)
    : { width: 0, length: 0 };

  console.log(oneHorizontal);
  const vertical = oneVertical
    ? getLengthWidth(oneVertical)
    : { width: 0, length: 0 };
  const corner = oneCorner
    ? getLengthWidth(oneCorner)
    : { width: 0, length: 0 };

  const config = {
    horizontal: { ...horizontal, offsetX: 0 },
    vertical: { ...vertical, offsetY: 0 },
    corner: { ...corner, offsetX: 0, offsetY: 0 },
  };

  baseplateStore.setConfig(config);
  wallStore.generateWallPointsFromBaseplates();

  // --- Calculate one distance between horizontal plates and one between vertical plates
  const getCenterFromPoints = (points: number[][]) => {
    if (!points || points.length === 0) return [0, 0];
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    return [
      (Math.min(...xs) + Math.max(...xs)) / 2,
      (Math.min(...ys) + Math.max(...ys)) / 2,
    ];
  };

  const horizontalPlates = baseplateStore.basePlates.filter(
    (bp: any) => bp.wall === "left"
  );
  const verticalPlates = baseplateStore.basePlates.filter(
    (bp: any) => bp.wall === "top"
  );

  // console.log(
  //   `Found ${horizontalPlates.length} horizontal plates and ${verticalPlates.length} vertical plates`
  // );

  if (horizontalPlates.length >= 2) {
    const [a, b] = [horizontalPlates[0], horizontalPlates[1]];
    const [, y1] = getCenterFromPoints(a.points);
    const [, y2] = getCenterFromPoints(b.points);
    const distance = Math.abs(y1 - y2);
    // console.log(
    //   "Distance between 2 horizontal baseplates:",
    //   distance,
    //   horizontalPlates
    // );
    baseplateStore.setIdealVerticalDistance(distance);
  } else {
    // fallback to vertical distance between top-left and bottom-left
    const topLeft = baseplateStore.basePlates.find(
      (p) => p.wall === "top-left"
    );
    const bottomLeft = baseplateStore.basePlates.find(
      (p) => p.wall === "bottom-left"
    );

    if (topLeft && bottomLeft) {
      const [, y1] = getCenterFromPoints(topLeft.points);
      const [, y2] = getCenterFromPoints(bottomLeft.points);
      const distance = Math.abs(y1 - y2);
      // console.log("Fallback vertical distance (corner plates):", distance / 2);
      baseplateStore.setIdealVerticalDistance(distance / 2);
    }
  }

  if (verticalPlates.length >= 2) {
    const [a, b] = [verticalPlates[0], verticalPlates[1]];
    const [x1] = getCenterFromPoints(a.points);
    const [x2] = getCenterFromPoints(b.points);
    const distance = Math.abs(x1 - x2);
    // console.log(
    //   "Distance between 2 vertical baseplates:",
    //   distance,
    //   verticalPlates
    // );
    baseplateStore.setIdealHorizontalDistance(distance);
  } else {
    // fallback to horizontal distance between bottom-left and bottom-right
    const bottomLeft = baseplateStore.basePlates.find(
      (p) => p.wall === "bottom-left"
    );
    const bottomRight = baseplateStore.basePlates.find(
      (p) => p.wall === "bottom-right"
    );

    if (bottomLeft && bottomRight) {
      const [x1] = getCenterFromPoints(bottomLeft.points);
      const [x2] = getCenterFromPoints(bottomRight.points);
      const distance = Math.abs(x1 - x2);
      // console.log(
      //   "Fallback horizontal distance (corner plates):",
      //   distance / 2
      // );
      baseplateStore.setIdealHorizontalDistance(distance / 2);
    }
  }


};

export default processBaseplates;
