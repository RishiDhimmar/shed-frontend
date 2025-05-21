import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
import * as THREE from "three";
import { toJS } from "mobx";
import dxfStore from "../../stores/DxfStore";
import { convertToPointObjects } from "../../utils/PolygonUtils";
import { Shed3DConfig } from "../../Constants";

const PlinthRenderer = observer(({ centerOffset = [0, 0], scale = 1 }) => {
  const externalWallPoints = useMemo(() => {
    return convertToPointObjects(toJS(dxfStore.externalWallPolygon)) || [];
  }, [dxfStore.externalWallPolygon]);

  const shape = useMemo(() => {
    if (externalWallPoints.length < 3) return null;

    const shape = new THREE.Shape();

    externalWallPoints.forEach((pt, index) => {
      const x = -(pt.x / 1000 - centerOffset[0]) * scale;
      const y = (pt.y / 1000 - centerOffset[2]) * scale;

      if (index === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    });

    shape.closePath();
    return shape;
  }, [externalWallPoints, centerOffset, scale]);

  if (!shape) return null;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]} // Make it flat on the ground
      position={[0, Shed3DConfig.heights.PLINTH - 0.075, 0]} // Adjust Y based on config
    >
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial
        color="gray"
        transparent
        opacity={1}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
});

export default PlinthRenderer;
