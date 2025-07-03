// import { observer } from "mobx-react-lite";
// import React, { useMemo } from "react";
// import { toJS } from "mobx";
// import dxfStore from "../../stores/DxfStore";
// import { convertToPointObjects } from "../../utils/PolygonUtils";
// import AnyShapeRenderer from "./AnyShapeExtrudeRenderer";
// import { Shed3DConfig } from "../../Constants";
// import configStore from "../../stores/ConfigStore";

// const PlinthRenderer = observer(({ centerOffset = [0, 0, 0], scale = 1 }) => {
//   const externalWallPoints = useMemo(() => {
//     return convertToPointObjects(toJS(dxfStore.externalWallPolygon)) || [];
//   }, [dxfStore.externalWallPolygon]);

//   // Transform points to match the original coordinate system
//   const transformedPoints = useMemo(() => {
//     if (!externalWallPoints || externalWallPoints.length < 3) return [];

//     return externalWallPoints.map((pt) => ({
//       x: -(pt.x / 1000 - centerOffset[0]) * scale, // Convert mm to meters, apply offset and scale
//       y: -(pt.y / 1000 - centerOffset[2]) * scale, // Adjust y (z in 3D) with offset and scale
//     }));
//   }, [externalWallPoints, centerOffset, scale]);

//   if (!transformedPoints || transformedPoints.length < 3) return null;

//   // Use AnyShapeRenderer with a fixed depth of 150 mm (0.15 in meters)
//   return (
//     <AnyShapeRenderer
//       bottomPoints={transformedPoints}
//       height={0.15} // 150 mm depth
//       centerOffset={[0, 0, 0]} // No additional offset needed since points are already transformed
//       y={configStore.shed3D.heights.PLINTH - 0.15} // Position at ground level or adjust as needed
//       color="gray" // Match the original color
//     />
//   );
// });

// export default PlinthRenderer;

import { observer } from "mobx-react-lite";
import React, { useMemo, useRef, useEffect } from "react";
import { toJS } from "mobx";
import * as THREE from "three";
import dxfStore from "../../stores/DxfStore";
import { convertToPointObjects } from "../../utils/PolygonUtils";
import AnyShapeRenderer from "./AnyShapeExtrudeRenderer";
import { Shed3DConfig } from "../../Constants";
import configStore from "../../stores/ConfigStore";
import wallStore from "../../stores/WallStore";

// Point-in-polygon function to check if a point is inside a polygon
const isPointInPolygon = (point, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// Line-polygon intersection function to find intersection points
const linePolygonIntersections = (lineStart, lineEnd, polygon) => {
  const intersections = [];
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const p1 = polygon[i];
    const p2 = polygon[j];
    const denominator =
      (lineEnd.x - lineStart.x) * (p2.y - p1.y) -
      (lineEnd.y - lineStart.y) * (p2.x - p1.x);
    if (Math.abs(denominator) < 1e-10) continue; // Parallel lines
    const t =
      ((p1.x - lineStart.x) * (p2.y - p1.y) -
        (p1.y - lineStart.y) * (p2.x - p1.x)) /
      denominator;
    const u =
      -(
        (lineEnd.x - lineStart.x) * (p1.y - lineStart.y) -
        (lineEnd.y - lineStart.y) * (p1.x - lineStart.x)
      ) / denominator;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      const x = lineStart.x + t * (lineEnd.x - lineStart.x);
      const y = lineStart.y + t * (lineEnd.y - lineStart.y);
      intersections.push({ x, y, t });
    }
  }
  return intersections.sort((a, b) => a.t - b.t);
};

const PlinthRenderer = observer(({ centerOffset = [0, 0, 0], scale = 1 }) => {
  // let externalWallPoints = useMemo(() => {
  //   return convertToPointObjects(toJS(dxfStore.externalWallPolygon)) || [];
  // }, [dxfStore.externalWallPolygon]);

  const externalWallPoints = useMemo(() => {
    return (
      convertToPointObjects(
        toJS(
          dxfStore.internalWallPolygon.filter(
            (_, index) => (index + 1) % 3 !== 0
          )
        )
      ) || []
    );
  }, [dxfStore.internalWallPolygon]);

  console.log("externalWallPoints", externalWallPoints);

  // Transform points to match the original coordinate system
  const transformedPoints = useMemo(() => {
    if (!externalWallPoints || externalWallPoints.length < 3) return [];
    return externalWallPoints.map((pt) => ({
      x: -(pt.x / 1000 - centerOffset[0]) * scale,
      y: -(pt.y / 1000 - centerOffset[2]) * scale,
    }));
  }, [externalWallPoints, centerOffset, scale]);

  // Calculate bounding box
  const bounds = useMemo(() => {
    if (transformedPoints.length < 3) return null;
    const xs = transformedPoints.map((p) => p.x);
    const ys = transformedPoints.map((p) => p.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }, [transformedPoints]);

  // Generate rod data
  const { horizontalRods, verticalRods, rodExtensions } = useMemo(() => {
    if (!bounds)
      return { horizontalRods: [], verticalRods: [], rodExtensions: [] };
    const spacing = 0.25; // 200mm spacing
    const horizontalRods = [];
    const verticalRods = [];
    const rodExtensions = [];

    // Horizontal rods
    for (let y = bounds.minY + spacing / 2; y < bounds.maxY; y += spacing) {
      const centerY = y;
      if (
        !isPointInPolygon(
          { x: (bounds.minX + bounds.maxX) / 2, y: centerY },
          transformedPoints
        )
      )
        continue;
      const intersections = linePolygonIntersections(
        { x: bounds.minX - 0.1, y: centerY },
        { x: bounds.maxX + 0.1, y: centerY },
        transformedPoints
      );
      if (intersections.length >= 2) {
        const start = intersections[0];
        const end = intersections[intersections.length - 1];
        horizontalRods.push({
          start: [start.x, start.y],
          end: [end.x, end.y],
          length: Math.abs(end.x - start.x),
        });
        rodExtensions.push([start.x, start.y], [end.x, end.y]);
      }
    }

    // Vertical rods
    for (let x = bounds.minX + spacing / 2; x < bounds.maxX; x += spacing) {
      const centerX = x;
      if (
        !isPointInPolygon(
          { x: centerX, y: (bounds.minY + bounds.maxY) / 2 },
          transformedPoints
        )
      )
        continue;
      const intersections = linePolygonIntersections(
        { x: centerX, y: bounds.minY - 0.1 },
        { x: centerX, y: bounds.maxY + 0.1 },
        transformedPoints
      );
      if (intersections.length >= 2) {
        const start = intersections[0];
        const end = intersections[intersections.length - 1];
        verticalRods.push({
          start: [start.x, start.y],
          end: [end.x, end.y],
          length: Math.abs(end.y - start.y),
        });
        rodExtensions.push([start.x, start.y], [end.x, end.y]);
      }
    }

    return { horizontalRods, verticalRods, rodExtensions };
  }, [bounds, transformedPoints, scale]);

  // Refs for instanced meshes
  const horizontalRodMeshRef = useRef();
  const verticalRodMeshRef = useRef();
  const extensionMeshRef = useRef();

  // Update instanced meshes
  useEffect(() => {
    const tempMatrix = new THREE.Matrix4();
    const tempQuaternion = new THREE.Quaternion();
    const tempPosition = new THREE.Vector3();
    const tempScale = new THREE.Vector3();
    const py = configStore.shed3D.heights.PLINTH - 0.075;

    // Horizontal rods
    if (horizontalRodMeshRef.current) {
      horizontalRods.forEach((rod, i) => {
        const px = (rod.start[0] + rod.end[0]) / 2;
        const pz = (rod.start[1] + rod.end[1]) / 2;
        tempPosition.set(px, py, pz);
        tempQuaternion.setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
        tempScale.set(1, rod.length, 1);
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        horizontalRodMeshRef.current.setMatrixAt(i, tempMatrix);
      });
      horizontalRodMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Vertical rods
    if (verticalRodMeshRef.current) {
      verticalRods.forEach((rod, i) => {
        const px = (rod.start[0] + rod.end[0]) / 2;
        const pz = (rod.start[1] + rod.end[1]) / 2;
        tempPosition.set(px, py, pz);
        tempQuaternion.setFromEuler(
          new THREE.Euler(0, -Math.PI / 2, Math.PI / 2)
        );
        tempScale.set(1, rod.length, 1);
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        verticalRodMeshRef.current.setMatrixAt(i, tempMatrix);
      });
      verticalRodMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Vertical extensions
    if (extensionMeshRef.current) {
      rodExtensions.forEach(([x, z], i) => {
        tempPosition.set(x, configStore.shed3D.heights.PLINTH - 0.075 / 2, z);
        tempQuaternion.setFromEuler(new THREE.Euler(0, 0, 0));
        tempScale.set(1, 0.075 * scale, 1);
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        extensionMeshRef.current.setMatrixAt(i, tempMatrix);
      });
      extensionMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [horizontalRods, verticalRods, rodExtensions, scale]);

  if (!transformedPoints || transformedPoints.length < 3) return null;

  // Geometries for instanced meshes
  const rodGeometry = new THREE.CylinderGeometry(0.008, 0.008, 1, 8); // Unit length, scaled per instance
  const extensionGeometry = new THREE.CylinderGeometry(0.008, 0.008, 1, 8); // Unit length, scaled per instance
  const material = <meshBasicMaterial color="gray" depthWrite={false} />;

  let totalLength = 0;
  horizontalRods.forEach((rod) => {
    totalLength += rod.length;
  });
  verticalRods.forEach((rod) => {
    totalLength += rod.length;
  });
  rodExtensions.forEach((rod) => {
    totalLength += rod.length;
  });
  console.log(
    "Total length",
    totalLength,
    horizontalRods.length,
    verticalRods.length
  );

  wallStore.setGradeSlabLength(totalLength);

  return (
    <>
      <AnyShapeRenderer
        bottomPoints={transformedPoints}
        height={configStore.shed3D.heights.PLINTH_Z_HEIGHT}
        centerOffset={[0, 0, 0]}
        y={
          configStore.shed3D.heights.PLINTH -
          configStore.shed3D.heights.PLINTH_Z_HEIGHT
        }
        color="gray"
      />
      <AnyShapeRenderer
        bottomPoints={transformedPoints}
        height={0.23}
        centerOffset={[0, 0, 0]}
        y={
          configStore.shed3D.heights.PLINTH -
          configStore.shed3D.heights.PLINTH_Z_HEIGHT -
          0.23
        }
        color="darkgrey"
      />
      {horizontalRods.length && (
        <instancedMesh
          ref={horizontalRodMeshRef}
          args={[rodGeometry, null, horizontalRods.length]}
          castShadow
          receiveShadow
        >
          {material}
        </instancedMesh>
      )}
      {verticalRods.length && (
        <instancedMesh
          ref={verticalRodMeshRef}
          args={[rodGeometry, null, verticalRods.length]}
          castShadow
          receiveShadow
        >
          {material}
        </instancedMesh>
      )}
      {rodExtensions.length && (
        <instancedMesh
          ref={extensionMeshRef}
          args={[extensionGeometry, null, rodExtensions.length]}
          castShadow
          receiveShadow
        >
          {material}
        </instancedMesh>
      )}
      <mesh
        position={[
          0,
          configStore.shed3D.heights.GROUND_BEAM +
            configStore.shed3D.heights.GB_Z_HEIGHT / 2,
          0,
        ]}
        // rotation={[-Math.PI / 2, 0, 0]}
      >
        <AnyShapeRenderer
          bottomPoints={transformedPoints}
          height={0.001} // Unit length
          centerOffset={[0, 0, 0]}
          y={0}
          color="yellow"
          opacity={0.5}
        />
      </mesh>
    </>
  );
});

export default PlinthRenderer;
