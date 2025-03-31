import React from "react";
import wallStore from "../../../stores/WallStore";
import { getClosedPoints } from "../../../utils/GeometryUtils";
import { Line } from "@react-three/drei";

function GroundBeamVisualizer() {
  return (
    <>
      {wallStore.externalWallPoints.length > 0 &&
        wallStore.internalWallPoints.length > 0 && (
          <>
            <Line
              points={
                getClosedPoints(wallStore.externalWallPoints) as [
                  x: number,
                  y: number,
                  z: number
                ][]
              }
              color="#00ff00"
            />
            <Line
              points={
                getClosedPoints(wallStore.internalWallPoints) as [
                  x: number,
                  y: number,
                  z: number
                ][]
              }
              color="#00ff00"
            />
          </>
        )}
    </>
  );
}

export default GroundBeamVisualizer;
