import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { PerspectiveCamera, CameraControls, Grid } from "@react-three/drei";
import * as THREE from "three";

import foundationStore from "../../stores/FoundationStore";
import uiStore from "../../stores/UIStore";
import { toJS } from "mobx";
import { getFoundationCenter } from "../../utils/PolygonUtils";

import FrustumMesh from "./FrustumMesh";
import FoundationsRenderer from "./FoundationsRenderer";
import ColumnRenderer from "./ColumnRenderer";
import { useGridControls } from "./grid/GridControls";
import GroundBeamRenderer from "./GroundBeamRenderer";

const Experience = observer(() => {
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  const {
    gridSize,
    cellSize,
    cellThickness,
    cellColor,
    sectionSize,
    sectionThickness,
    sectionColor,
    fadeDistance,
    fadeStrength,
    followCamera,
    infiniteGrid,
    opacity,
  } = useGridControls(); // 👈 use it

  // Center camera when foundations change
  useEffect(() => {
    const foundations = toJS(foundationStore.foundations);
    const centerOffset = getFoundationCenter(foundations);
    const camHeight = 5;

    if (controlsRef.current) {
      controlsRef.current.setLookAt(
        [centerOffset[0], camHeight, centerOffset[1]],
        [centerOffset[0], 0, centerOffset[1]],
        true
      );
    }
  }, [foundationStore.foundations.length]);

  const centerOffset = getFoundationCenter(toJS(foundationStore.foundations));

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[5, 5, 5]}
        near={0.01}
        far={1000}
        fov={25}
      />
      <CameraControls
        ref={controlsRef}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={0}
        dollySpeed={0.5}
        truckSpeed={0.5}
        smoothTime={0.8}
        dampingFactor={0.05}
      />
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 20, 0]} intensity={1} />

      {/* Grid */}
      <Grid
        args={[gridSize[0], 128]}
        cellSize={cellSize}
        cellThickness={cellThickness}
        cellColor={cellColor}
        sectionSize={sectionSize}
        sectionThickness={sectionThickness}
        sectionColor={sectionColor}
        fadeDistance={fadeDistance}
        fadeStrength={fadeStrength}
        followCamera={followCamera}
        infiniteGrid={infiniteGrid}
        transparent
        opacity={opacity}
        position={[0, -0.01, 0]}
      />

      {uiStore.visibility.foundation && (
        <FoundationsRenderer centerOffset={centerOffset} scale={0.1} />
      )}
      {uiStore.visibility.column && (
        <ColumnRenderer centerOffset={centerOffset} scale={0.1} />
      )}
      
    </>
  );
});

export default Experience;
