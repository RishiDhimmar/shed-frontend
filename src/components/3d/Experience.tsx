import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  PerspectiveCamera,
  OrthographicCamera,
  CameraControls,
  Grid,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

import foundationStore from "../../stores/FoundationStore";
import uiStore from "../../stores/UIStore";
import { toJS } from "mobx";
import { getFoundationCenter } from "../../utils/PolygonUtils";

import FrustumMesh from "./FrustumMesh";
import FoundationsRenderer from "./FoundationsRenderer";
import ColumnRenderer from "./ColumnRenderer";
import GroundBeamRenderer from "./GroundBeamRenderer";
import { useGridControls } from "./grid/GridControls";
import PlinthRenderer from "./PlinthRenderer";
import BaseplateRenderer from "./BaseplateRenderer";
import MullionColumnRenderer from "./MullionColumnRenderer";
import ShedWallRenderer from "./ShedWallRenderer";

const Experience = observer(() => {
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const [useOrtho, setUseOrtho] = useState(false); // 👈 Camera toggle state

  // Recenter camera when foundations change
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
      {/* Toggle UI 
      <Html>
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 10,
          }}
        >
          <button
            style={{
              padding: "8px 12px",
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => setUseOrtho((prev) => !prev)}
          >
            Toggle Camera ({useOrtho ? "Ortho" : "Perspective"})
          </button>
        </div>
      </Html>
      */}

      {/* Cameras */}
      {useOrtho ? (
        <OrthographicCamera
          ref={cameraRef}
          makeDefault
          position={[5, 5, 5]}
          zoom={10}
          near={0.00000001}
          far={1000000}
        />
      ) : (
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          position={[5, 5, 5]}
          fov={80}
          near={0.00001}
          far={100000}
        />
      )}

      {/* Controls */}
      <CameraControls
        ref={controlsRef}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={0}
        dollySpeed={0.5}
        truckSpeed={0.5}
        smoothTime={0.8}
        dampingFactor={0.05}
      />

      {/* Lights */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 20, 0]} intensity={1} />

      {/* Optional Grid */}
      {/*
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
      */}

      {/* Scene Renderers */}
      {uiStore.visibility.foundation && (
        <FoundationsRenderer centerOffset={centerOffset} scale={0.1} />
      )}
      {uiStore.visibility.column && (
        <ColumnRenderer centerOffset={centerOffset} scale={0.1} />
      )}
      {uiStore.visibility.groundBeam && (
        <GroundBeamRenderer centerOffset={centerOffset} scale={0.1} />
      )}

      {uiStore.visibility.baseplate && (
        <BaseplateRenderer centerOffset={centerOffset} scale={1} />
      )}
      {uiStore.visibility.plinth && (
        <PlinthRenderer centerOffset={centerOffset} scale={1} />
      )}
      <MullionColumnRenderer centerOffset={centerOffset} scale={1} />
      <ShedWallRenderer centerOffset={centerOffset} scale={1} />
    </>
  );
});

export default Experience;
//  <PlinthRenderer centerOffset={centerOffset} scale={0.1} />
