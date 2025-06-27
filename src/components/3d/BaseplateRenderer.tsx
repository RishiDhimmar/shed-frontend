import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import * as THREE from "three";
import { toJS } from "mobx";
import baseplateStore from "../../stores/BasePlateStore";
import configStore from "../../stores/ConfigStore";
import { removeDuplicatePoints } from "../../utils/PolygonUtils";

// Constants
const BASEPLATE_HEIGHT = 0.0075;
const VERTICAL_BOX_HEIGHT = 6.0;
const VERTICAL_BOX_WIDTH = 0.45;
const VERTICAL_BOX_DEPTH = 0.15;
const LEG_ANGLE = (-170 * Math.PI) / 180;
const LEG_BASE_LENGTH = 0.5;

// Utility function to create baseplate geometry
const createBaseplateGeometry = (points, centerOffset, scale, shedHeight) => {
  const shape = new THREE.Shape();
  points.forEach((p, i) => {
    const x = -(p.x / 1000 - centerOffset[0]) * scale;
    const z = (p.y / 1000 - centerOffset[2]) * scale;
    if (i === 0) shape.moveTo(x, z);
    else shape.lineTo(x, z);
  });
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: BASEPLATE_HEIGHT,
    bevelEnabled: false,
  });

  geometry.rotateX(-Math.PI / 2);
  geometry.translate(
    0,
    configStore.shed3D.heights.COLUMNS + BASEPLATE_HEIGHT + 0.075 + 0.001,
    0
  );
  return geometry;
};

// Component for rendering individual baseplate
const BaseplateMesh = ({ points, centerOffset, scale, shedHeight, index }) => {
  const geometry = useMemo(
    () => createBaseplateGeometry(points, centerOffset, scale, shedHeight),
    [points, centerOffset, scale, shedHeight]
  );

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "green",
        depthTest: false,
        depthWrite: false,
        transparent: true,
      }),
    []
  );

  return <mesh key={`bp-${index}`} geometry={geometry} material={material} />;
};

// Component for rendering vertical box and its outline
const VerticalBox = ({ center, index }) => {
  const boxGeometry = useMemo(
    () =>
      new THREE.BoxGeometry(
        VERTICAL_BOX_WIDTH,
        VERTICAL_BOX_HEIGHT,
        VERTICAL_BOX_DEPTH
      ),
    []
  );

  const boxMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "gray",
        depthTest: false,
        depthWrite: false,
        transparent: true,
      }),
    []
  );

  const outlineGeometry = useMemo(
    () => new THREE.EdgesGeometry(boxGeometry),
    [boxGeometry]
  );

  const outlineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "black",
        linewidth: 2,
      }),
    []
  );

  const position = useMemo(
    () =>
      new THREE.Vector3(
        center.x,
        center.y + VERTICAL_BOX_HEIGHT / 2,
        -center.z
      ),
    [center]
  );

  return (
    <>
      <mesh
        key={`vertical-${index}`}
        geometry={boxGeometry}
        material={boxMaterial}
        position={position}
      />
      <lineSegments
        key={`vertical-outline-${index}`}
        geometry={outlineGeometry}
        material={outlineMaterial}
        position={position}
        renderOrder={1000}
      />
    </>
  );
};

// Component for rendering V-leg connector and its outline
const VLegConnector = ({ fromPos, toPos, fromId, toId }) => {
  const halfAngle = (Math.PI - LEG_ANGLE) / 2;
  const heightOffset = LEG_BASE_LENGTH * Math.cos(halfAngle);
  const lateralOffset = LEG_BASE_LENGTH * Math.sin(halfAngle);

  const direction = useMemo(
    () => new THREE.Vector3().subVectors(toPos, fromPos).normalize(),
    [fromPos, toPos]
  );

  const midPoint = useMemo(
    () => new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5),
    [fromPos, toPos]
  );

  const raisedMid = useMemo(
    () => midPoint.clone().add(new THREE.Vector3(0, VERTICAL_BOX_HEIGHT, 0)),
    [midPoint]
  );

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "gray",
        depthTest: false,
        depthWrite: false,
        transparent: true,
        opacity: 1,
      }),
    // new THREE.MeshStandardMaterial({
    //   color: "red",
    //   metalness: 1,
    //   roughness: 0,
    //   transparent: false, // <-- not needed if opacity is 1
    //   opacity: 1,
    // }),
    []
  );

  const outlineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "black",
        linewidth: 2,
      }),
    []
  );

  // Leg 1
  const leg1Start = useMemo(
    () => fromPos.clone().add(new THREE.Vector3(0, VERTICAL_BOX_HEIGHT, 0)),
    [fromPos]
  );
  const leg1End = useMemo(
    () =>
      raisedMid
        .clone()
        .sub(direction.clone().multiplyScalar(lateralOffset))
        .sub(new THREE.Vector3(0, heightOffset, 0)),
    [raisedMid, direction, lateralOffset, heightOffset]
  );
  const leg1Vec = useMemo(
    () => new THREE.Vector3().subVectors(leg1End, leg1Start),
    [leg1End, leg1Start]
  );
  const leg1Length = useMemo(() => leg1Vec.length(), [leg1Vec]);
  const leg1Mid = useMemo(
    () =>
      new THREE.Vector3().addVectors(leg1Start, leg1End).multiplyScalar(0.5),
    [leg1Start, leg1End]
  );
  const leg1Quat = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        leg1Vec.clone().normalize()
      ),
    [leg1Vec]
  );

  const leg1Geometry = useMemo(
    () =>
      new THREE.BoxGeometry(
        VERTICAL_BOX_WIDTH,
        leg1Length + 0.3,
        VERTICAL_BOX_DEPTH
      ),
    [leg1Length]
  );

  // Leg 2
  const leg2Start = useMemo(
    () => toPos.clone().add(new THREE.Vector3(0, VERTICAL_BOX_HEIGHT, 0)),
    [toPos]
  );
  const leg2End = useMemo(
    () =>
      raisedMid
        .clone()
        .add(direction.clone().multiplyScalar(lateralOffset))
        .sub(new THREE.Vector3(0, heightOffset, 0)),
    [raisedMid, direction, lateralOffset, heightOffset]
  );
  const leg2Vec = useMemo(
    () => new THREE.Vector3().subVectors(leg2End, leg2Start),
    [leg2End, leg2Start]
  );
  const leg2Length = useMemo(() => leg2Vec.length(), [leg2Vec]);
  const leg2Mid = useMemo(
    () =>
      new THREE.Vector3().addVectors(leg2Start, leg2End).multiplyScalar(0.5),
    [leg2Start, leg2End]
  );
  const leg2Quat = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        leg2Vec.clone().normalize()
      ),
    [leg2Vec]
  );

  const leg2Geometry = useMemo(
    () =>
      new THREE.BoxGeometry(
        VERTICAL_BOX_WIDTH,
        leg2Length + 0.3,
        VERTICAL_BOX_DEPTH
      ),
    [leg2Length]
  );

  return (
    <>
      <mesh
        key={`vleg-from-${fromId}-${toId}`}
        geometry={leg1Geometry}
        material={material}
        position={[leg1Mid.x, leg1Mid.y - 0.19, -leg1Mid.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        quaternion={leg1Quat}
        renderOrder={1000}
      />
      <lineSegments
        key={`vleg-from-outline-${fromId}-${toId}`}
        geometry={new THREE.EdgesGeometry(leg1Geometry)}
        material={outlineMaterial}
        position={[leg1Mid.x, leg1Mid.y - 0.19, -leg1Mid.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        quaternion={leg1Quat}
        renderOrder={1001}
      />
      <mesh
        key={`vleg-to-${fromId}-${toId}`}
        geometry={leg2Geometry}
        material={material}
        position={[leg2Mid.x, leg2Mid.y - 0.19, -leg2Mid.z]}
        rotation={[Math.PI, 0, 0]}
        quaternion={leg2Quat}
        renderOrder={10}
      />
      <lineSegments
        key={`vleg-to-outline-${fromId}-${toId}`}
        geometry={new THREE.EdgesGeometry(leg2Geometry)}
        material={outlineMaterial}
        position={[leg2Mid.x, leg2Mid.y - 0.19, -leg2Mid.z]}
        rotation={[Math.PI, 0, 0]}
        quaternion={leg2Quat}
        renderOrder={1001}
      />
    </>
  );
};

const BaseplateRenderer = observer(
  ({ centerOffset = [0, 0, 0], scale = 1 }) => {
    const boundaryBaseplates = useMemo(() => {
      return baseplateStore.cornerBasePlates.concat(
        baseplateStore.edgeBasePlates.filter(
          (p) => p.hits[0].direction !== "+y" && p.hits[0].direction !== "-y"
        )
      );
    }, [baseplateStore.cornerBasePlates, baseplateStore.edgeBasePlates]);

    const baseplates = useMemo(() => {
      return baseplateStore.basePlates;
    }, [baseplateStore.basePlates]);

    const { baseplateMeshes, verticalBoxes, topCenters } = useMemo(() => {
      const baseplateMeshes = [];
      const verticalBoxes = [];
      const topCenters = [];

      baseplates.forEach((bp, idx) => {
        const raw = bp.points || [];
        const points = removeDuplicatePoints(raw);
        if (points.length < 3) return;

        baseplateMeshes.push(
          <BaseplateMesh
            key={`bp-${idx}`}
            points={points}
            centerOffset={centerOffset}
            scale={scale}
            shedHeight={configStore.shed3D.heights.COLUMNS}
            index={idx}
          />
        );

        // const geometry = createBaseplateGeometry(
        //   points,
        //   centerOffset,
        //   scale,
        //   configStore.shed3D.heights.COLUMNS
        // );
      });

      boundaryBaseplates.forEach((bp, idx) => {
        const geometry = createBaseplateGeometry(
          bp.points,
          centerOffset,
          scale,
          configStore.shed3D.heights.COLUMNS
        );
        const bbox = new THREE.Box3().setFromObject(new THREE.Mesh(geometry));
        const center = bbox.getCenter(new THREE.Vector3());
        const topCenter = new THREE.Vector3(center.x, bbox.max.y, -center.z);
        topCenters.push({ id: bp.id, pos: topCenter });

        verticalBoxes.push(
          <VerticalBox key={`vertical-${idx}`} center={topCenter} index={idx} />
        );
      });

      return { baseplateMeshes, verticalBoxes, topCenters };
    }, [
      boundaryBaseplates,
      centerOffset,
      scale,
      configStore.shed3D.heights.COLUMNS,
    ]);

    const connectors = useMemo(() => {
      const connectorMeshes = [];
      for (let i = 0; i < topCenters.length; i++) {
        const from = topCenters[i];
        const ray = new THREE.Ray(from.pos, new THREE.Vector3(1, 0, 0));

        let closest = null;
        let minDistance = Infinity;

        for (let j = 0; j < topCenters.length; j++) {
          if (i === j) continue;
          const to = topCenters[j];
          const delta = new THREE.Vector3().subVectors(to.pos, from.pos);
          const projected = delta.dot(ray.direction);

          if (
            projected > 0 &&
            projected < minDistance &&
            Math.abs(delta.z) < 0.01
          ) {
            minDistance = projected;
            closest = to;
          }
        }

        if (closest) {
          connectorMeshes.push(
            <VLegConnector
              key={`vleg-${from.id}-${closest.id}`}
              fromPos={from.pos}
              toPos={closest.pos}
              fromId={from.id}
              toId={closest.id}
            />
          );
        }
      }
      return connectorMeshes;
    }, [topCenters]);

    return (
      <>
        <group>{baseplateMeshes}</group>
        <group>{verticalBoxes}</group>
        <group>{connectors}</group>
      </>
    );
  }
);

export default BaseplateRenderer;
