import { pointArrayToArrayLowerCase, PointSmall } from "./ConversionUtils";
import wallStore from "../stores/WallStore";
import { toJS } from "mobx";
import baseplateStore,{Baseplate, BaseplateType, WallType}  from "../stores/BasePlateStore";
interface RawBaseplateData {
  x: number;
  y: number;
  baseplateType: BaseplateType;
  wallType: WallType | null;
  vertices: PointSmall[];
  points: number[][] | null;
}

/**
 * Process JSON data to identify and classify baseplates.
 */
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

  // Filter valid baseplate entities
  const baseplateEntities = data.entities.filter(
    (e: any) =>
      e?.type === "LWPOLYLINE" &&
      e?.layer === "BasePlates" &&
      Array.isArray(e.vertices) &&
      e.vertices.length >= 4 &&
      e.vertices.every(
        (v: any) => typeof v.x === "number" && typeof v.y === "number"
      )
  );

  if (baseplateEntities.length === 0) return;

  // Reset baseplate store
  baseplateStore.basePlates = [];
  const newBaseplates: Baseplate[] = [];

  // First, find the overall bounding box of all vertices
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  baseplateEntities.forEach((entity: any) => {
    entity.vertices.forEach((vertex: any) => {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
    });
  });

  console.log(`Bounding box: (${minX}, ${minY}) to (${maxX}, ${maxY})`);

  // Calculate a more appropriate threshold based on the dimensions
  const width = maxX - minX;
  const height = maxY - minY;
  const threshold = Math.min(width, height) * 0.05; // 5% of smaller dimension

  console.log(`Using threshold: ${threshold}`);

  // Helper function to determine if a point is on an edge
  const isOnEdge = (x: number, y: number) => {
    const isLeftEdge = Math.abs(x - minX) < threshold;
    const isRightEdge = Math.abs(x - maxX) < threshold;
    const isTopEdge = Math.abs(y - maxY) < threshold;
    const isBottomEdge = Math.abs(y - minY) < threshold;
    return { isLeftEdge, isRightEdge, isTopEdge, isBottomEdge };
  };

  // Helper function to get baseplate center
  const getCenter = (vertices: { x: number; y: number }[]) => {
    const xs = vertices.map((v) => v.x);
    const ys = vertices.map((v) => v.y);
    return [
      (Math.min(...xs) + Math.max(...xs)) / 2,
      (Math.min(...ys) + Math.max(...ys)) / 2,
    ];
  };

  // Helper function to calculate bounding box for a baseplate
  const getBaseplateBox = (vertices: { x: number; y: number }[]) => {
    const xs = vertices.map((v) => v.x);
    const ys = vertices.map((v) => v.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  };

  // Analyze each baseplate entity
  const processedBaseplates = baseplateEntities
    .map((entity: any) => {
      const [centerX, centerY] = getCenter(entity.vertices);
      const box = getBaseplateBox(entity.vertices);

      // Count vertices on each edge to determine baseplate type
      let leftCount = 0,
        rightCount = 0,
        topCount = 0,
        bottomCount = 0;

      entity.vertices.forEach((vertex: any) => {
        const { isLeftEdge, isRightEdge, isTopEdge, isBottomEdge } = isOnEdge(
          vertex.x,
          vertex.y
        );
        if (isLeftEdge) leftCount++;
        if (isRightEdge) rightCount++;
        if (isTopEdge) topCount++;
        if (isBottomEdge) bottomCount++;
      });

      // Determine wall type based on which edges the baseplate touches
      type WallType = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "left" | "right" | "top" | "bottom" | null;
      let wallType: WallType = null;
      type BaseplateType = "corner" | "horizontal" | "vertical" | null;
      let baseplateType: BaseplateType;

      // Corner detection - must have vertices on two perpendicular edges
      if (
        leftCount > 0 &&
        topCount > 0 &&
        rightCount === 0 &&
        bottomCount === 0
      ) {
        wallType = "top-left";
        baseplateType = "corner";
      } else if (
        rightCount > 0 &&
        topCount > 0 &&
        leftCount === 0 &&
        bottomCount === 0
      ) {
        wallType = "top-right";
        baseplateType = "corner";
      } else if (
        leftCount > 0 &&
        bottomCount > 0 &&
        rightCount === 0 &&
        topCount === 0
      ) {
        wallType = "bottom-left";
        baseplateType = "corner";
      } else if (
        rightCount > 0 &&
        bottomCount > 0 &&
        leftCount === 0 &&
        topCount === 0
      ) {
        wallType = "bottom-right";
        baseplateType = "corner";
      }
      // Wall detection - must have vertices predominantly on one edge
      else if (leftCount > 0 && rightCount === 0) {
        wallType = "left";
        baseplateType = "horizontal";
      } else if (rightCount > 0 && leftCount === 0) {
        wallType = "right";
        baseplateType = "horizontal";
      } else if (topCount > 0 && bottomCount === 0) {
        wallType = "top";
        baseplateType = "vertical";
      } else if (bottomCount > 0 && topCount === 0) {
        wallType = "bottom";
        baseplateType = "vertical";
      } else {
        // If unable to clearly determine, use center point as fallback
        const { isLeftEdge, isRightEdge, isTopEdge, isBottomEdge } = isOnEdge(
          centerX,
          centerY
        );

        if (isLeftEdge && isTopEdge) {
          wallType = "top-left";
          baseplateType = "corner";
        } else if (isRightEdge && isTopEdge) {
          wallType = "top-right";
          baseplateType = "corner";
        } else if (isLeftEdge && isBottomEdge) {
          wallType = "bottom-left";
          baseplateType = "corner";
        } else if (isRightEdge && isBottomEdge) {
          wallType = "bottom-right";
          baseplateType = "corner";
        } else if (isLeftEdge) {
          wallType = "left";
          baseplateType = "horizontal";
        } else if (isRightEdge) {
          wallType = "right";
          baseplateType = "horizontal";
        } else if (isTopEdge) {
          wallType = "top";
          baseplateType = "vertical";
        } else if (isBottomEdge) {
          wallType = "bottom";
          baseplateType = "vertical";
        } else {
          // If still unable to classify, return null to skip this baseplate
          console.warn("Unclassifiable baseplate:", entity);
          return null;
        }
      }

      // No scaling applied here - will be done later
      const scaledVertices = entity.vertices.map(({ x, y }: { x: number; y: number }) => ({
        x: x,
        y: y,
      }));

      console.log(`Classified baseplate as ${baseplateType} - ${wallType}`);

      return {
        centerX,
        centerY,
        baseplateType,
        wallType,
        vertices: scaledVertices,
        box,
        originalEntity: entity,
      };
    })
    .filter((bp : Baseplate) => bp !== null);

  // Calculate offsets for different types of baseplates
  calculateOffsets(processedBaseplates);

  // Create baseplates with the calculated offsets
  // processedBaseplates.forEach((bp: Baseplate) => {
  //   newBaseplates.push(
  //     baseplateStore.createBaseplate(
  //       bp.centerX,
  //       bp.centerY,
  //       bp.baseplateType,
  //       bp.wallType,
  //       pointArrayToArrayLowerCase(bp.vertices),

  //     )
  //   );
  // });

  (processedBaseplates as RawBaseplateData[]).forEach((bp) => {
  if (bp.vertices !== null) {
    newBaseplates.push(
      baseplateStore.createBaseplate(
        bp.x,
        bp.y,
        bp.baseplateType as BaseplateType,
        bp.wallType,
        pointArrayToArrayLowerCase(bp.vertices),
        
      )
    );
  } else {
    console.error("Baseplate vertices are null");
  }
});

  // Calculate dimensions and configure spacing
  calculateDimensions(newBaseplates);
  calculateIdealDistances(newBaseplates as any);

  // Scale down everything
  newBaseplates.forEach((basePlate: Baseplate) => {
    // Scale down x and y coordinates
    basePlate.x = basePlate.x / 1000;
    basePlate.y = basePlate.y / 1000;

    // Scale down points
    if (basePlate.points && Array.isArray(basePlate.points)) {
      basePlate.points.forEach((point) => {
        if (Array.isArray(point) && point.length >= 2) {
          point[0] = point[0] / 1000;
          point[1] = point[1] / 1000;
        }
      });
    }

    // Scale down centerLinePoints if they exist
    if (basePlate.centerLinePoints) {
      if (
        basePlate.centerLinePoints.horizontal &&
        Array.isArray(basePlate.centerLinePoints.horizontal)
      ) {
        basePlate.centerLinePoints.horizontal.forEach((point) => {
          if (Array.isArray(point) && point.length >= 2) {
            point[0] = point[0] / 1000;
            point[1] = point[1] / 1000;
          }
        });
      }

      if (
        basePlate.centerLinePoints.vertical &&
        Array.isArray(basePlate.centerLinePoints.vertical)
      ) {
        basePlate.centerLinePoints.vertical.forEach((point) => {
          if (Array.isArray(point) && point.length >= 2) {
            point[0] = point[0] / 1000;
            point[1] = point[1] / 1000;
          }
        });
      }
    }
  });

  // Scale down config values
  if (baseplateStore.config) {
    // Scale corner dimensions
    if (baseplateStore.config.corner) {
      baseplateStore.config.corner.length = baseplateStore.config.corner.length / 1000;
      baseplateStore.config.corner.width = baseplateStore.config.corner.width / 1000;
      // Offsets will be scaled in calculateOffsets
    }
    
    // Scale horizontal dimensions
    if (baseplateStore.config.horizontal) {
      baseplateStore.config.horizontal.length = baseplateStore.config.horizontal.length / 1000;
      baseplateStore.config.horizontal.width = baseplateStore.config.horizontal.width / 1000;
    }
    
    // Scale vertical dimensions
    if (baseplateStore.config.vertical) {
      baseplateStore.config.vertical.length = baseplateStore.config.vertical.length / 1000;
      baseplateStore.config.vertical.width = baseplateStore.config.vertical.width / 1000;
    }
  }

  // Set the scaled baseplates in the store
  baseplateStore.setBasePlates(newBaseplates);

  // Scale the ideal distances if they were calculated
  if (baseplateStore.idealHorizontalDistance) {
    baseplateStore.setIdealHorizontalDistance(baseplateStore.idealHorizontalDistance / 1000);
  }
  
  if (baseplateStore.idealVerticalDistance) {
    baseplateStore.setIdealVerticalDistance(baseplateStore.idealVerticalDistance / 1000);
  }

  console.log("Baseplate processing complete:", toJS(baseplateStore));
};

/**
 * Calculate offsets for different types of baseplates
 */
const calculateOffsets = (baseplates : RawBaseplateData[]) => {
  // Find baseplate types
  const horizontalBaseplate = baseplates.find(
    (bp) => bp.baseplateType === "horizontal" && bp.wallType === "left"
  );
  const verticalBaseplate = baseplates.find(
    (bp) => bp.baseplateType === "vertical" && bp.wallType === "top"
  );
  const cornerBaseplate = baseplates.find(
    (bp) => bp.baseplateType === "corner" && bp.wallType === "top-left"
  );
  
  // Get the top-left wall point (assumed to be the reference point)
  const wallTopLeftPoint = wallStore.internalWallPoints.reduce((topLeft, point) : any=> {
    // Looking for the point with smallest X (most negative) and largest Y (most positive)
    if (!topLeft || (point[0] <= topLeft[0] && point[1] >= topLeft[1])) {
      return point;
    }
    return topLeft;
  }, null);
  
  console.log("Reference wall point (top-left):", wallTopLeftPoint);
  
  const config = baseplateStore.getConfig();
  
  // Calculate horizontal offset
  if (horizontalBaseplate) {
    const minX = Math.min(...horizontalBaseplate.vertices.map(point => point.x));
    // Adjust scale and calculate offset relative to wall point
    // const horizontalOffsetX = Math.abs(minX - wallTopLeftPoint?.[0] * 1000) / 1000;
    const horizontalOffsetX = wallTopLeftPoint ? Math.abs(minX - wallTopLeftPoint[0] * 1000) / 1000 : 0;
    
    if (config && config.horizontal) {
      config.horizontal.offsetX = horizontalOffsetX;
      console.log(`Set horizontal offset X: ${horizontalOffsetX}`);
    }
  }
  
  // Calculate vertical offset
  if (verticalBaseplate) {
    const maxY = Math.max(...verticalBaseplate.vertices.map(point => point.y));
    // Adjust scale and calculate offset relative to wall point
    const verticalOffsetY = wallTopLeftPoint ? Math.abs(maxY - wallTopLeftPoint[1] * 1000) / 1000 : 0;
    
    if (config && config.vertical) {
      config.vertical.offsetY = verticalOffsetY;
      console.log(`Set vertical offset Y: ${verticalOffsetY}`);
    }
  }
  
  // Calculate corner offsets
  if (cornerBaseplate) {
    const minX = Math.min(...cornerBaseplate.vertices.map(point => point.x));
    const maxY = Math.max(...cornerBaseplate.vertices.map(point => point.y));
    
    // Calculate offsets relative to the wall point
    const cornerOffsetX = wallTopLeftPoint ? Math.abs(minX - wallTopLeftPoint[0] * 1000) / 1000 : 0;
    const cornerOffsetY = wallTopLeftPoint ? Math.abs(maxY - wallTopLeftPoint[1] * 1000) / 1000 : 0;
    
    if (config && config.corner) {
      config.corner.offsetX = cornerOffsetX;
      config.corner.offsetY = cornerOffsetY;
      console.log(`Set corner offsets - X: ${cornerOffsetX}, Y: ${cornerOffsetY}`);
    }
  }
  
  // Update the config
  baseplateStore.setConfig(config);
};

/**
 * Calculate dimensions for different baseplate types
 */
const calculateDimensions = (newBaseplates: any) => {
  const getLengthWidth = (bp: any) => {
    if (!bp?.points || bp.points.length === 0) return { length: 0, width: 0 };
    const xs = bp.points.map((p: number[]) => p[0]);
    const ys = bp.points.map((p: number[]) => p[1]);
    return {
      length: Math.max(...xs) - Math.min(...xs),
      width: Math.max(...ys) - Math.min(...ys),
    };
  };

  const oneHorizontal = newBaseplates.find(
    (bp: any) => bp.type === "horizontal"
  );
  const oneVertical = newBaseplates.find((bp: any) => bp.type === "vertical");
  const oneCorner = newBaseplates.find((bp: any) => bp.type === "corner");

  const horizontal = oneHorizontal
    ? getLengthWidth(oneHorizontal)
    : { width: 0, length: 0 };
  const vertical = oneVertical
    ? getLengthWidth(oneVertical)
    : { width: 0, length: 0 };
  const corner = oneCorner
    ? getLengthWidth(oneCorner)
    : { width: 0, length: 0 };

  // Get existing config to preserve offsets
  const existingConfig = baseplateStore.getConfig();

  const config = {
    horizontal: {
      ...horizontal,
      offsetX: existingConfig?.horizontal?.offsetX || 0,
    },
    vertical: {
      ...vertical,
      offsetY: existingConfig?.vertical?.offsetY || 0,
    },
    corner: {
      ...corner,
      offsetX: existingConfig?.corner?.offsetX || 0,
      offsetY: existingConfig?.corner?.offsetY || 0,
    },
  };

  baseplateStore.setConfig(config);
};

/**
 * Calculate ideal distances between baseplates
 */
const calculateIdealDistances = (newBaseplates : RawBaseplateData[]) => {
  const getCenterFromPoints = (points: number[][]) => {
    if (!points || points.length === 0) return [0, 0];
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    return [
      (Math.min(...xs) + Math.max(...xs)) / 2,
      (Math.min(...ys) + Math.max(...ys)) / 2,
    ];
  };

  // For vertical distance, use left wall plates if available
  const leftWallPlates = newBaseplates
    .filter((bp: any) => bp.wall === "left")
    .sort((a: any, b: any) => {
      const [, ya] = getCenterFromPoints(a.points);
      const [, yb] = getCenterFromPoints(b.points);
      return ya - yb;
    });
    
  console.log("Left wall plates:", leftWallPlates.length);

  if (leftWallPlates.length >= 2) {
    // Find the smallest distance between any two adjacent plates
    let minDistance = Infinity;
    for (let i = 1; i < leftWallPlates.length; i++) {
      const [, y1] = getCenterFromPoints(leftWallPlates[i - 1].points ?? []);
      const [, y2] = getCenterFromPoints(leftWallPlates[i].points ?? []);
      const distance = Math.abs(y2 - y1);
      if (distance < minDistance && distance > 0) {
        minDistance = distance;
      }
    }
    baseplateStore.setIdealVerticalDistance(minDistance);
    console.log(`Set ideal vertical distance: ${minDistance}`);
  } else {
    // Fallback to corner plates
    const topLeft = newBaseplates.find(
      (p: any) => p.wall === "top-left"
    );
    const bottomLeft = newBaseplates.find(
      (p: any) => p.wall === "bottom-left"
    );

    if (topLeft && bottomLeft) {
      if(!topLeft.points || !bottomLeft.points) return;
      const [, y1] = getCenterFromPoints(topLeft.points);
      const [, y2] = getCenterFromPoints(bottomLeft.points);
      const distance = Math.abs(y1 - y2);
      // Adjust factor based on expected number of plates
      baseplateStore.setIdealVerticalDistance(distance / 2);
      console.log(`Set ideal vertical distance (fallback): ${distance / 2}`);
    }
  }

  // For horizontal distance, use top wall plates if available
  const topWallPlates = newBaseplates
    .filter((bp: any) => bp.wall === "top")
    .sort((a: any, b: any) => {
      const [xa] = getCenterFromPoints(a.points);
      const [xb] = getCenterFromPoints(b.points);
      return xa - xb;
    });

  if (topWallPlates.length >= 2) {
    // Find the smallest distance between any two adjacent plates
    let minDistance = Infinity;
    for (let i = 1; i < topWallPlates.length; i++) {
      // if(!topWallPlates[i - 1].points || !topWallPlates[i].points) return;
      const [x1] = getCenterFromPoints(topWallPlates[i - 1].points ?? []);
      const [x2] = getCenterFromPoints(topWallPlates[i].points ?? []);
      const distance = Math.abs(x2 - x1);
      if (distance < minDistance && distance > 0) {
        minDistance = distance;
      }
    }
    baseplateStore.setIdealHorizontalDistance(minDistance);
    console.log(`Set ideal horizontal distance: ${minDistance}`);
  } else {
    // Fallback to corner plates
    const bottomLeft = newBaseplates.find(
      (p: any) => p.wall === "bottom-left"
    );
    const bottomRight = newBaseplates.find(
      (p: any) => p.wall === "bottom-right"
    );

    if (bottomLeft && bottomRight) {
      if(!bottomLeft.points || !bottomRight.points) return;
      const [x1] = getCenterFromPoints(bottomLeft.points);
      const [x2] = getCenterFromPoints(bottomRight.points);
      const distance = Math.abs(x1 - x2);
      // Adjust factor based on expected number of plates
      baseplateStore.setIdealHorizontalDistance(distance / 2);
      console.log(`Set ideal horizontal distance (fallback): ${distance / 2}`);
    }
  }
};

export default processBaseplates;