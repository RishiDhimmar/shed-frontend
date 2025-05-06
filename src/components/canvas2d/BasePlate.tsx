import React, { useState } from "react";
import uiStore from "../../stores/UIStore";
import baseplateStore from "../../stores/BasePlateStore";
import { Line, Text, Group } from "react-konva";
import { observer } from "mobx-react-lite";
import Dimension from "./Dimentions";

const BasePlate = observer(() => {
  const [dragPositions, setDragPositions] = useState({});

  if (!uiStore.visibility.baseplate) return null;

  const calculateBoundingBox = (points) => {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  };

  const renderBaseplates = (baseplates, prefix) =>
    baseplates.map((baseplate, i) => {
      const baseplateKey = `${prefix}-${i}`;
      const bbox = calculateBoundingBox(baseplate.points);

      // Initialize drag positions
      if (!dragPositions[baseplateKey]) {
        setDragPositions((prev) => ({
          ...prev,
          [baseplateKey]: { lengthY: 0, heightX: 0 },
        }));
      }

      // Calculate dimensions using hits or bounding box
      let length = (bbox.maxX - bbox.minX).toFixed(0);
      let height = (bbox.maxY - bbox.minY).toFixed(0);
      let lengthPoints = [
        { x: bbox.minX, y: bbox.minY },
        { x: bbox.maxX, y: bbox.minY },
      ];
      let heightPoints = [
        { x: bbox.minX, y: bbox.minY },
        { x: bbox.minX, y: bbox.maxY },
      ];

      if (baseplate.hits?.length) {
        const hits = {
          top: baseplate.hits.find((hit) => hit.hitDirection === "top"),
          bottom: baseplate.hits.find((hit) => hit.hitDirection === "bottom"),
          left: baseplate.hits.find((hit) => hit.hitDirection === "left"),
          right: baseplate.hits.find((hit) => hit.hitDirection === "right"),
        };

        // Length: Prefer left-right or top-right hits
        if (hits.left && hits.right) {
          length = Math.sqrt(
            (hits.right.hitPoint.x - hits.left.hitPoint.x) ** 2 +
              (hits.right.hitPoint.y - hits.left.hitPoint.y) ** 2
          ).toFixed(0);
          lengthPoints = [hits.left.hitPoint, hits.right.hitPoint];
        } else if (hits.top && hits.right) {
          length = Math.sqrt(
            (hits.right.hitPoint.x - hits.top.hitPoint.x) ** 2 +
              (hits.right.hitPoint.y - hits.top.hitPoint.y) ** 2
          ).toFixed(0);
          lengthPoints = [hits.top.hitPoint, hits.right.hitPoint];
        }

        // Height: Prefer top-bottom or left-bottom hits
        if (hits.top && hits.bottom) {
          height = Math.sqrt(
            (hits.bottom.hitPoint.x - hits.top.hitPoint.x) ** 2 +
              (hits.bottom.hitPoint.y - hits.top.hitPoint.y) ** 2
          ).toFixed(0);
          heightPoints = [hits.top.hitPoint, hits.bottom.hitPoint];
        } else if (hits.left && hits.bottom) {
          height = Math.sqrt(
            (hits.bottom.hitPoint.x - hits.left.hitPoint.x) ** 2 +
              (hits.bottom.hitPoint.y - hits.left.hitPoint.y) ** 2
          ).toFixed(0);
          heightPoints = [hits.left.hitPoint, hits.bottom.hitPoint];
        }
      }

      // Drag handlers
      const handleLengthDrag = (e) => {
        const node = e.target;
        node.x(0); // Restrict to vertical movement
        const newY = node.y();
        setDragPositions((prev) => ({
          ...prev,
          [baseplateKey]: { ...prev[baseplateKey], lengthY: newY },
        }));
      };

      const handleHeightDrag = (e) => {
        const node = e.target;
        node.y(0); // Restrict to horizontal movement
        const newX = node.x();
        setDragPositions((prev) => ({
          ...prev,
          [baseplateKey]: { ...prev[baseplateKey], heightX: newX },
        }));
      };

      if (!dragPositions[baseplateKey]) return null;

      // Offsets based on hit direction
      const lengthOffset = baseplate.hits?.find(
        (hit) => hit.hitDirection === "top"
      )
        ? -1500
        : 1500;
      const heightOffset = baseplate.hits?.find(
        (hit) => hit.hitDirection === "left"
      )
        ? -1500
        : 1500;

      return (
        <Group key={baseplateKey}>
          <Line
            points={baseplate.points.flatMap((p) => [p.x, p.y])}
            stroke="#00FF00"
            strokeWidth={5}
            fill={uiStore.currentComponent === "baseplate" ? "#00FF00" : ""}
            opacity={uiStore.currentComponent === "baseplate" ? 0.5 : 1}
            closed
          />
          {uiStore.currentComponent === "baseplate" && (
            <>
              <Text
                x={bbox.minX - 600}
                y={bbox.minY - 600}
                text={baseplate.label}
                rotation={baseplate.labelRotation}
                fontSize={100}
                draggable
                fill="#00FF00"
              />
              <Dimension
                p1={lengthPoints[0]}
                p2={lengthPoints[1]}
                offset={lengthOffset}
                label={length}
                isVertical={false}
                dragPosition={dragPositions[baseplateKey].lengthY}
                onDragMove={handleLengthDrag}
                rotation={0}
                color={"#00FF00"}
              />
              <Dimension
                p1={heightPoints[0]}
                p2={heightPoints[1]}
                offset={heightOffset}
                label={height}
                isVertical={true}
                dragPosition={dragPositions[baseplateKey].heightX}
                onDragMove={handleHeightDrag}
                rotation={270}
                color={"#00FF00"}
              />
            </>
          )}
        </Group>
      );
    });

  return (
    <>
      {renderBaseplates(baseplateStore.cornerBasePlates, "corner")}
      {renderBaseplates(baseplateStore.edgeBasePlates, "edge")}
      {renderBaseplates(baseplateStore.middleBasePlates, "middle")}
    </>
  );
});

export default BasePlate;
