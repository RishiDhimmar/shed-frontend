
// import { runInAction, toJS } from "mobx";


// import { pointArrayToArrayLowerCase } from "./ConversionUtils";
// import columnStore from "../stores/ColumnStore";
// import baseplateStore, { BaseplateType } from "../stores/BasePlateStore";
// import wallStore from "../stores/WallStore";
// interface Baseplate {
//   x: number;
//   y: number;
//   type: string;
//   subtype: string;
// }
// export const processBaseplates = (
//   jsonData: string,
// ) => {
//   if (!jsonData || !baseplateStore || !wallStore) return;

//   let data;
//   try {
//     data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
//   } catch (error) {
//     console.error("Invalid JSON data:", error);
//     return;
//   }

//   if (!data.entities || !Array.isArray(data.entities)) return;

//   const baseplateEntities = data.entities.filter(
//     (e: any) =>
//       e?.type === "LWPOLYLINE" &&
//       Array.isArray(e.vertices) &&
//       e.vertices.every((v: any) => typeof v.x === "number" && typeof v.y === "number")
//   );

//   const getCenter = (vertices: { x: number; y: number }[]) => {
//     const xs = vertices.map((v) => v.x);
//     const ys = vertices.map((v) => v.y);
//     return [
//       (Math.min(...xs) + Math.max(...xs)) / 2,
//       (Math.min(...ys) + Math.max(...ys)) / 2,
//     ];
//   };

//   const usedEntities = new Set();

//   console.log("Processing entities:", baseplateEntities.length);

//   const addBaseplateIfNotExists = (
//     entity: any,
//     type: string,
//     subtype: string
//   ) => {
//     if (!entity?.vertices || usedEntities.has(entity)) return;

//     const [x, y] = getCenter(entity.vertices);
//     const exists = baseplateStore.basePlates.some(
//       (bp: Baseplate) =>
//         Math.abs(bp.x - x) < 0.01 &&
//         Math.abs(bp.y - y) < 0.01 &&
//         bp.type === type &&
//         bp.subtype === subtype
//     );

//     if (!exists) {
//       const baseplate = baseplateStore.createBaseplate(
//         x,
//         y,
//         type as BaseplateType,
//         subtype,
//         pointArrayToArrayLowerCase(entity.vertices)
//       );

//       runInAction(() => {
//         baseplateStore.basePlates.push(baseplate);
//       });

//       usedEntities.add(entity);
//       entity._isUsed = true;
//       if (type === "corner") {
//         entity._isCorner = true;
//       }
//     }
//   };

//   // --- Identify corner plates using center points
//   let topLeft: any, topRight: any, bottomLeft: any, bottomRight: any;
//   let topLeftVal = { x: Infinity, y: Infinity };
//   let topRightVal = { x: -Infinity, y: Infinity };
//   let bottomLeftVal = { x: Infinity, y: -Infinity };
//   let bottomRightVal = { x: -Infinity, y: -Infinity };

//   baseplateEntities.forEach((entity: any) => {
//     const [x, y] = getCenter(entity.vertices);
//     if (isNaN(x) || isNaN(y)) return;

//     if (y < topLeftVal.y || (Math.abs(y - topLeftVal.y) < 0.5 && x < topLeftVal.x)) {
//       topLeftVal = { x, y };
//       topLeft = entity;
//       entity.tempType = "corner";
//     }
//     if (y < topRightVal.y || (Math.abs(y - topRightVal.y) < 0.5 && x > topRightVal.x)) {
//       topRightVal = { x, y };
//       topRight = entity;
//       entity.tempType = "corner";
//     }
//     if (y > bottomLeftVal.y || (Math.abs(y - bottomLeftVal.y) < 0.5 && x < bottomLeftVal.x)) {
//       bottomLeftVal = { x, y };
//       bottomLeft = entity;
//       entity.tempType = "corner";
//     }
//     if (y > bottomRightVal.y || (Math.abs(y - bottomRightVal.y) < 0.5 && x > bottomRightVal.x)) {
//       bottomRightVal = { x, y };
//       bottomRight = entity;
//       entity.tempType = "corner";
//     }
//   });

//   console.log("Corner detection:");
//   console.log("- Top left:", topLeftVal);
//   console.log("- Top right:", topRightVal);
//   console.log("- Bottom left:", bottomLeftVal);
//   console.log("- Bottom right:", bottomRightVal);

//   if (topLeft) addBaseplateIfNotExists(topLeft, "corner", "top-left");
//   if (topRight) addBaseplateIfNotExists(topRight, "corner", "top-right");
//   if (bottomLeft) addBaseplateIfNotExists(bottomLeft, "corner", "bottom-left");
//   if (bottomRight) addBaseplateIfNotExists(bottomRight, "corner", "bottom-right");

//   const createWallPlates = (
//     startEntity: any,
//     endEntity: any, 
//     type: string,
//     subtype: string,
//     tolerance = 0.5
//   ) => {
//     if (!startEntity?.vertices || !endEntity?.vertices ) return;

//     const [startX, startY] = getCenter(startEntity.vertices);
//     const [endX, endY] = getCenter(endEntity.vertices);
    
//     // Determine if we're looking for alignment on X or Y axis
//     const isVertical = subtype === "left" || subtype === "right";
//     const axisValue = isVertical ? startX : startY;
//     const axis = isVertical ? "x" : "y";
    
//     console.log(`Looking for ${type} plates along ${axis} axis with value ~${axisValue}`);
    
//     let wallPlatesFound = 0;
    
//     baseplateEntities.forEach((entity: any) => {
//       // if entity is corner return
//       console.log(entity.tempType)
//       if (usedEntities.has(entity) || entity._isCorner || !entity?.vertices || entity.tempType === 'corner' ) return;

      
//       const [entityX, entityY] = getCenter(entity.vertices);
      
//       // Check if entity is aligned on the correct axis
//       const isAligned = isVertical 
//         ? Math.abs(entityX - axisValue) < tolerance
//         : Math.abs(entityY - axisValue) < tolerance;
        
//       // Check if entity is between the start and end entities
//       const isBetween = isVertical
//         ? (entityY > Math.min(startY, endY) && entityY < Math.max(startY, endY))
//         : (entityX > Math.min(startX, endX) && entityX < Math.max(startX, endX));
      
//       if (isAligned && isBetween) {
//         addBaseplateIfNotExists(entity, type, subtype);
//         wallPlatesFound++;
//       }
//     });
    
//     console.log(`Found ${wallPlatesFound} ${type} plates for ${subtype} wall`);
//   };

//   // Process vertical wall plates (left and right sides)
//   if (topLeft && bottomLeft) {
//     console.log("Processing left vertical wall");
//     createWallPlates(topLeft, bottomLeft, "vertical", "left");
//   }
  
//   if (topRight && bottomRight) {
//     console.log("Processing right vertical wall");
//     createWallPlates(topRight, bottomRight, "vertical", "right");
//   }
  
//   // Process horizontal wall plates (top and bottom sides)
//   if (topLeft && topRight) {
//     console.log("Processing top horizontal wall");
//     createWallPlates(topLeft, topRight, "horizontal", "top");
//   }
  
//   if (bottomLeft && bottomRight) {
//     console.log("Processing bottom horizontal wall");
//     createWallPlates(bottomLeft, bottomRight, "horizontal", "bottom");
//   }

//   const getLengthWidth = (bp: any) => {
//     if (!bp?.points || bp.points.length === 0) return { length: 0, width: 0 };

//     const xs = bp.points.map((p: number[]) => p[0]);
//     const ys = bp.points.map((p: number[]) => p[1]);

//     return {
//       length: Math.max(...xs) - Math.min(...xs),
//       width: Math.max(...ys) - Math.min(...ys),
//     };
//   };

//   const oneHorizontal = baseplateStore.basePlates.find((bp: any) => bp.type === "horizontal");
//   const oneVertical = baseplateStore.basePlates.find((bp: any) => bp.type === "vertical");
//   const oneCorner = baseplateStore.basePlates.find((bp: any) => bp.type === "corner");

//   const horizontal = oneHorizontal ? getLengthWidth(oneHorizontal) : { width: 0, length: 0 };
//   const vertical = oneVertical ? getLengthWidth(oneVertical) : { width: 0, length: 0 };
//   const corner = oneCorner ? getLengthWidth(oneCorner) : { width: 0, length: 0 };

//   const config = {
//     horizontal: { ...horizontal, offsetX: 0 },
//     vertical: { ...vertical, offsetY: 0 },
//     corner: { ...corner, offsetX: 0, offsetY: 0 },
//   };

//   baseplateStore.setConfig(config);
//   wallStore.generateWallPointsFromBaseplates();
//   console.log("first")
  

//   const getCenterFromPoints = (points: number[][]) => {
//     if (!points || points.length === 0) return [0, 0];

//     const xs = points.map((p) => p[0]);
//     const ys = points.map((p) => p[1]);

//     return [
//       (Math.min(...xs) + Math.max(...xs)) / 2,
//       (Math.min(...ys) + Math.max(...ys)) / 2,
//     ];
//   };

//   const horizontalPlates = baseplateStore.basePlates.filter((bp: any) => bp.type === "horizontal");
//   const verticalPlates = baseplateStore.basePlates.filter((bp: any) => bp.type === "vertical");

//   console.log(`Found ${horizontalPlates.length} horizontal plates and ${verticalPlates.length} vertical plates`);

//   if (horizontalPlates.length >= 2) {
//     const [a, b] = [horizontalPlates[0], horizontalPlates[1]];
//     const [x1, y1] = getCenterFromPoints(a.points);
//     const [x2, y2] = getCenterFromPoints(b.points);
  
//     const distance = Math.abs(x1 - x2);  // Bug is here
//     console.log("Distance between 2 horizontal baseplates:", distance, horizontalPlates);
//     baseplateStore.setIdealVerticalDistance(distance);
//   }
  
//   if (verticalPlates.length >= 2) {
//     const [a, b] = [verticalPlates[0], verticalPlates[1]];
//     const [,y1] = getCenterFromPoints(a.points);
//     const [,y2] = getCenterFromPoints(b.points);
  
//     const distance = Math.abs(y1 - y2);  // Bug is here
//     console.log("Distance between 2 vertical baseplates:", distance, verticalPlates);
//     baseplateStore.setIdealHorizontalDistance(distance);
//   }

//   console.log("Baseplates processed:", toJS(baseplateStore.basePlates));
//   console.log("Baseplates processed:", toJS(wallStore));
//   console.log("Baseplates processed:", toJS(columnStore));
//   // console.log("Baseplates processed:", toJS(baseplateStore));
//   console.log("Vertical plates:", verticalPlates.length);
//   console.log("Horizontal plates:", horizontalPlates.length);

  
// };

// export default processBaseplates;

// utils/processBaseplates.ts
import { runInAction, toJS } from "mobx";
import { pointArrayToArrayLowerCase } from "./ConversionUtils";
import baseplateStore, { BaseplateType, WallType } from "../stores/BasePlateStore";
import wallStore from "../stores/WallStore";

// interface Baseplate {
//   x: number;
//   y: number;
//   type: string;
//   subtype: string;
// }

export const processBaseplates = (jsonData: string) => {
  if (!jsonData || !baseplateStore || !wallStore) return;

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
      e.vertices.every((v: any) => typeof v.x === "number" && typeof v.y === "number")
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

  console.log("Processing entities:", baseplateEntities.length);

  const addBaseplateIfNotExists = (
    entity: any,
    type: string,
    subtype: string
  ) => {
    if (!entity?.vertices || usedEntities.has(entity)) return;
    const [x, y] = getCenter(entity.vertices);
    const exists = baseplateStore.basePlates.some((bp: any) => {
      return (
        Math.abs(bp.x - x) < 0.01 &&
        Math.abs(bp.y - y) < 0.01 &&
        bp.type === type &&
        (bp as any).subtype === subtype
      );
    });
    if (!exists) {
      const baseplate = baseplateStore.createBaseplate(
        x,
        y,
        type as BaseplateType,
        subtype as WallType,
        pointArrayToArrayLowerCase(entity.vertices)
      );
      runInAction(() => {
        baseplateStore.basePlates.push(baseplate);
      });
      usedEntities.add(entity);
      entity._isUsed = true;
      if (type === "corner") {
        entity._isCorner = true;
      }
    }
  };

  // --- Identify corner plates using center points.
  // For corners we base the decision on the center of each entity.
  let topLeft: any, topRight: any, bottomLeft: any, bottomRight: any;
  let topLeftVal = { x: Infinity, y: Infinity };
  let topRightVal = { x: -Infinity, y: Infinity };
  let bottomLeftVal = { x: Infinity, y: -Infinity };
  let bottomRightVal = { x: -Infinity, y: -Infinity };

  baseplateEntities.forEach((entity: any) => {
    const [x, y] = getCenter(entity.vertices);
    if (isNaN(x) || isNaN(y)) return;
    // For "top" baseplates, lower center Y means higher on the drawing
    if (y < topLeftVal.y || (Math.abs(y - topLeftVal.y) < 0.5 && x < topLeftVal.x)) {
      topLeftVal = { x, y };
      topLeft = entity;
    }
    if (y < topRightVal.y || (Math.abs(y - topRightVal.y) < 0.5 && x > topRightVal.x)) {
      topRightVal = { x, y };
      topRight = entity;
    }
    // For "bottom" baseplates, higher center Y means lower on the drawing
    if (y > bottomLeftVal.y || (Math.abs(y - bottomLeftVal.y) < 0.5 && x < bottomLeftVal.x)) {
      bottomLeftVal = { x, y };
      bottomLeft = entity;
    }
    if (y > bottomRightVal.y || (Math.abs(y - bottomRightVal.y) < 0.5 && x > bottomRightVal.x)) {
      bottomRightVal = { x, y };
      bottomRight = entity;
    }
  });

  console.log("Corner detection:");
  console.log("- Top left:", topLeftVal);
  console.log("- Top right:", topRightVal);
  console.log("- Bottom left:", bottomLeftVal);
  console.log("- Bottom right:", bottomRightVal);

  if (topLeft) addBaseplateIfNotExists(topLeft, "corner", "top-left");
  if (topRight) addBaseplateIfNotExists(topRight, "corner", "top-right");
  if (bottomLeft) addBaseplateIfNotExists(bottomLeft, "corner", "bottom-left");
  if (bottomRight) addBaseplateIfNotExists(bottomRight, "corner", "bottom-right");

  // --- Create wall plates
  const createWallPlates = (
    startEntity: any,
    endEntity: any, 
    type: string,
    subtype: string,
    tolerance = 2.0
  ) => {
    if (!startEntity?.vertices || !endEntity?.vertices) return;
    const [startX, startY] = getCenter(startEntity.vertices);
    const [endX, endY] = getCenter(endEntity.vertices);
    // Determine if we're matching along X or Y axis:
    const isVertical = subtype === "left" || subtype === "right";
    const axisValue = isVertical ? startX : startY;
    const axis = isVertical ? "x" : "y";
    console.log(`Looking for ${type} plates along ${axis} axis with value ~${axisValue}`);
    let wallPlatesFound = 0;
    baseplateEntities.forEach((entity: any) => {
      if (usedEntities.has(entity) || entity._isCorner || !entity?.vertices) return;
      const [entityX, entityY] = getCenter(entity.vertices);
      // For vertical plates, use stricter tolerance so corners aren't re-added.
      const isAligned =
        isVertical
          ? Math.abs(entityX - axisValue) < 0.1
          : Math.abs(entityY - axisValue) < tolerance;
      const isBetween = isVertical
        ? entityY > Math.min(startY, endY) && entityY < Math.max(startY, endY)
        : entityX > Math.min(startX, endX) && entityX < Math.max(startX, endX);
      if (isAligned && isBetween) {
        addBaseplateIfNotExists(entity, type, subtype);
        wallPlatesFound++;
      }
    });
    console.log(`Found ${wallPlatesFound} ${type} plates for ${subtype} wall`);
  };

  // Process wall plates:
  if (topLeft && bottomLeft)
    createWallPlates(topLeft, bottomLeft, "horizontal", "left");
  if (topRight && bottomRight)
    createWallPlates(topRight, bottomRight, "horizontal", "right");
  if (topLeft && topRight)
    createWallPlates(topLeft, topRight, "vertical", "top", 0.1);
  if (bottomLeft && bottomRight)
    createWallPlates(bottomLeft, "y", "vertical", "bottom", 0.1); // Adjust call so we use bottomLeft as reference

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

  const oneHorizontal = baseplateStore.basePlates.find((bp: any) => bp.type === "horizontal");
  const oneVertical = baseplateStore.basePlates.find((bp: any) => bp.type === "vertical");
  const oneCorner = baseplateStore.basePlates.find((bp: any) => bp.type === "corner");

  const horizontal = oneHorizontal ? getLengthWidth(oneHorizontal) : { width: 0, length: 0 };
  const vertical = oneVertical ? getLengthWidth(oneVertical) : { width: 0, length: 0 };
  const corner = oneCorner ? getLengthWidth(oneCorner) : { width: 0, length: 0 };

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
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    return [
      (Math.min(...xs) + Math.max(...xs)) / 2,
      (Math.min(...ys) + Math.max(...ys)) / 2,
    ];
  };

  const horizontalPlates = baseplateStore.basePlates.filter((bp: any) => bp.type === "horizontal");
  const verticalPlates = baseplateStore.basePlates.filter((bp: any) => bp.type === "vertical");

  console.log(`Found ${horizontalPlates.length} horizontal plates and ${verticalPlates.length} vertical plates`);

  if (horizontalPlates.length >= 2) {
    const [a, b] = [horizontalPlates[0], horizontalPlates[1]];
    const [, y1] = getCenterFromPoints(a.points);
    const [, y2] = getCenterFromPoints(b.points);
    const distance = Math.abs(y1 - y2);
    console.log("Distance between 2 horizontal baseplates:", distance, horizontalPlates);
    baseplateStore.setIdealVerticalDistance(distance);
  }
  
  if (verticalPlates.length >= 2) {
    const [a, b] = [verticalPlates[0], verticalPlates[1]];
    const [x1] = getCenterFromPoints(a.points);
    const [x2] = getCenterFromPoints(b.points);
    const distance = Math.abs(x1 - x2);
    console.log("Distance between 2 vertical baseplates:", distance, verticalPlates);
    baseplateStore.setIdealHorizontalDistance(distance);
  }

  console.log("Processed Baseplates:", toJS(baseplateStore.basePlates));
  console.log("Processed WallStore:", toJS(wallStore));
};

export default processBaseplates;
