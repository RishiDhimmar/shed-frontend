import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
import { toJS } from "mobx";
import dxfStore from "../../stores/DxfStore";
import { convertToPointObjects } from "../../utils/PolygonUtils";
import AnyShapeRenderer from "./AnyShapeExtrudeRenderer";
import { Shed3DConfig } from "../../Constants";
import configStore from "../../stores/ConfigStore";

const PlinthRenderer = observer(({ centerOffset = [0, 0, 0], scale = 1 }) => {
  const externalWallPoints = useMemo(() => {
    return convertToPointObjects(toJS(dxfStore.externalWallPolygon)) || [];
  }, [dxfStore.externalWallPolygon]);

  // Transform points to match the original coordinate system
  const transformedPoints = useMemo(() => {
    if (!externalWallPoints || externalWallPoints.length < 3) return [];

    return externalWallPoints.map((pt) => ({
      x: -(pt.x / 1000 - centerOffset[0]) * scale, // Convert mm to meters, apply offset and scale
      y: -(pt.y / 1000 - centerOffset[2]) * scale, // Adjust y (z in 3D) with offset and scale
    }));
  }, [externalWallPoints, centerOffset, scale]);

  if (!transformedPoints || transformedPoints.length < 3) return null;

  // Use AnyShapeRenderer with a fixed depth of 150 mm (0.15 in meters)
  return (
    <AnyShapeRenderer
      bottomPoints={transformedPoints}
      height={0.15} // 150 mm depth
      centerOffset={[0, 0, 0]} // No additional offset needed since points are already transformed
      y={configStore.shed3D.heights.PLINTH - 0.15} // Position at ground level or adjust as needed
      color="gray" // Match the original color
    />
  );
});

export default PlinthRenderer;