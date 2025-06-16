// import React, { useMemo } from "react";
// import mullionColumnStore from "../../stores/MullianColumnStore";
// import { toJS } from "mobx";
// import wallStore from "../../stores/WallStore";
// import BoxRenderer from "./Box";
// import configStore from "../../stores/ConfigStore";
// import { observer } from "mobx-react-lite";

// const MullionColumnRenderer = observer (({ centerOffset, scale }) =>  {
//   const instances = useMemo(() => {
//     return mullionColumnStore.polygons
//       .map((mc) => {
//         let rawPoints = mc.points || [];
//         const cleanedPoints = rawPoints;

//         const points = cleanedPoints.map((p) => ({
//           x: -(p.x / 1000 - centerOffset[0]) * scale,
//           z: -(p.y / 1000 - centerOffset[2]) * scale,
//         }));

//         if (points.length !== 4) {
//           console.warn("Invalid baseplate points", toJS(baseplate));
//           return null;
//         }

//         const xs = points.map((p) => p.x);
//         const zs = points.map((p) => p.z);

//         const minX = Math.min(...xs);
//         const maxX = Math.max(...xs);
//         const minZ = Math.min(...zs);
//         const maxZ = Math.max(...zs);

//         const width = maxX - minX;
//         const length = maxZ - minZ;
//         const centerX = (minX + maxX) / 2;
//         const centerZ = (minZ + maxZ) / 2;

//         return {
//           width,
//           length,
//           height: configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
//           position: [
//             centerX,
//             configStore.shed3D.heights.COLUMNS + configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT / 2,
//             centerZ,
//           ],
//           color: "red",
//         };
//       })
//       .filter(Boolean);
//   }, [mullionColumnStore.polygons, centerOffset, configStore.shed3D.heights.COLUMNS, configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT]);

//   return (
//     <>
//       <BoxRenderer instances={instances} opacity={0.5} />
//     </>
//   );
// })

// export default MullionColumnRenderer;

import React, { useMemo } from "react";
import mullionColumnStore from "../../stores/MullianColumnStore";
import { toJS } from "mobx";
import configStore from "../../stores/ConfigStore";
import { observer } from "mobx-react-lite";
import { CylinderGeometry, MeshBasicMaterial, Mesh } from "three";
import BoxRenderer from "./Box";
import RingRenderer from "./RingRenderer";

const MullionColumnRenderer = observer(({ centerOffset, scale }) => {
  const { columnInstances, cylinderInstances } = useMemo(() => {
    const columnInstances = [];
    const cylinderInstances = [];

    mullionColumnStore.polygons.forEach((mc) => {
      let rawPoints = mc.points || [];
      const cleanedPoints = rawPoints;

      const points = cleanedPoints.map((p) => ({
        x: -(p.x / 1000 - centerOffset[0]) * scale,
        z: -(p.y / 1000 - centerOffset[2]) * scale,
      }));

      if (points.length !== 4) {
        console.warn("Invalid mullion column points", toJS(mc));
        return;
      }

      const xs = points.map((p) => p.x);
      const zs = points.map((p) => p.z);

      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minZ = Math.min(...zs);
      const maxZ = Math.max(...zs);

      const width = maxX - minX;
      const length = maxZ - minZ;
      const centerX = (minX + maxX) / 2;
      const centerZ = (minZ + maxZ) / 2;
      const height = configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT;

      // Column instance for BoxRenderer
      columnInstances.push({
        width,
        length,
        height,
        position: [
          centerX,
          configStore.shed3D.heights.COLUMNS + height / 2,
          centerZ,
        ],
        color: "red",
      });

      // Calculate 4 corner points with 0.05 offset
      const offset = 0.04;
      const halfWidth = width / 2;
      const halfLength = length / 2;

      const corners = [
        { x: centerX + halfWidth - offset, z: centerZ + halfLength - offset },
        { x: centerX + halfWidth - offset, z: centerZ - halfLength + offset },
        { x: centerX - halfWidth + offset, z: centerZ + halfLength - offset },
        { x: centerX - halfWidth + offset, z: centerZ - halfLength + offset },
      ];

      // Cylinder instances
      corners.forEach((corner) => {
        cylinderInstances.push({
          position: [
            corner.x,
            configStore.shed3D.heights.COLUMNS + height / 2,
            corner.z,
          ],
          height,
          radius: 0.08, // 0.08 mm diameter = 0.04 mm radius
        });
      });
    });

    return { columnInstances, cylinderInstances };
  }, [
    mullionColumnStore.polygons,
    centerOffset,
    scale,
    configStore.shed3D.heights.COLUMNS,
    configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT,
  ]);

  const cylinderGeometry = useMemo(
    () => new CylinderGeometry(0.008, 0.008, 1, 16),
    []
  );
  const cylinderMaterial = useMemo(
    () =>
      new MeshBasicMaterial({ color: "red", transparent: true, opacity: 0.5 }),
    []
  );

  return (
    <>
      <BoxRenderer instances={columnInstances} opacity={0.5} />
      <RingRenderer
        columns={mullionColumnStore.polygons}
        centerOffset={centerOffset}
        cornerOffset={0.03}
        rodDiameter={0.008}
        yInterval={0.15}
        color="red"
        floorY={configStore.shed3D.heights.COLUMNS}
        height={configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT}
        opacity={1}
      />
      {cylinderInstances.map((cylinder, index) => (
        <mesh
          key={index}
          position={cylinder.position}
          geometry={cylinderGeometry}
          material={cylinderMaterial}
          scale={[1, cylinder.height, 1]}
        />
      ))}
    </>
  );
});

export default MullionColumnRenderer;
