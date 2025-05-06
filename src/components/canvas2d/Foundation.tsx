import React, { useState } from "react";
import uiStore from "../../stores/UIStore";
import foundationStore from "../../stores/FoundationStore";
import { Line, Text, Group } from "react-konva";
import { observer } from "mobx-react-lite";
import Dimension from "./Dimentions";

const Foundation = observer(() => {
  const [dragPositions, setDragPositions] = useState({});

  if (!uiStore.visibility.foundation) return null;

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

  return (
    <>
      {foundationStore.polygons.map((foundation, i) => {
        const foundationKey = `foundation-${i}`;
        const outerBbox = calculateBoundingBox(foundation.outerFoundationPoints);
        const innerBbox = calculateBoundingBox(foundation.innerFoundationPoints);

        if (!dragPositions[foundationKey]) {
          setDragPositions((prev) => ({
            ...prev,
            [foundationKey]: {
              lengthY: 0,
              heightX: 0,
              innerLengthY: 0,
              innerHeightX: 0,
            },
          }));
          return null;
        }

        const outerLength = (outerBbox.maxX - outerBbox.minX).toFixed(0);
        const outerHeight = (outerBbox.maxY - outerBbox.minY).toFixed(0);
        const innerLength = (innerBbox.maxX - innerBbox.minX).toFixed(0);
        const innerHeight = (innerBbox.maxY - innerBbox.minY).toFixed(0);

        const outerLengthPoints = [
          { x: outerBbox.minX, y: outerBbox.minY },
          { x: outerBbox.maxX, y: outerBbox.minY },
        ];
        const outerHeightPoints = [
          { x: outerBbox.minX, y: outerBbox.minY },
          { x: outerBbox.minX, y: outerBbox.maxY },
        ];
        const innerLengthPoints = [
          { x: innerBbox.minX, y: innerBbox.minY },
          { x: innerBbox.maxX, y: innerBbox.minY },
        ];
        const innerHeightPoints = [
          { x: innerBbox.minX, y: innerBbox.minY },
          { x: innerBbox.minX, y: innerBbox.maxY },
        ];

        const handleLengthDrag = (e) => {
          const node = e.target;
          node.x(0);
          const newY = node.y();
          setDragPositions((prev) => ({
            ...prev,
            [foundationKey]: { ...prev[foundationKey], lengthY: newY },
          }));
        };

        const handleHeightDrag = (e) => {
          const node = e.target;
          node.y(0);
          const newX = node.x();
          setDragPositions((prev) => ({
            ...prev,
            [foundationKey]: { ...prev[foundationKey], heightX: newX },
          }));
        };

        const handleInnerLengthDrag = (e) => {
          const node = e.target;
          node.x(0);
          const newY = node.y();
          setDragPositions((prev) => ({
            ...prev,
            [foundationKey]: { ...prev[foundationKey], innerLengthY: newY },
          }));
        };

        const handleInnerHeightDrag = (e) => {
          const node = e.target;
          node.y(0);
          const newX = node.x();
          setDragPositions((prev) => ({
            ...prev,
            [foundationKey]: { ...prev[foundationKey], innerHeightX: newX },
          }));
        };

        return (
          <Group key={foundationKey} name={foundationKey}>
            <Line
              points={foundation.innerFoundationPoints.flatMap((p) => [p.x, p.y])}
              stroke="#FF00FF"
              strokeWidth={5}
              fill={uiStore.currentComponent === "foundation" ? "white" : ""}
              opacity={uiStore.currentComponent === "foundation" ? 0.5 : 1}
              closed
            />
            <Line
              points={foundation.outerFoundationPoints.flatMap((p) => [p.x, p.y])}
              stroke="#FF00FF"
              strokeWidth={5}
              fill={uiStore.currentComponent === "foundation" ? "#FF00FF" : ""}
              opacity={uiStore.currentComponent === "foundation" ? 0.5 : 1}
              closed
            />
            {[0, 1, 2, 3].map((j) => (
              <Line
                key={`foundation-line-${i}-${j}`}
                points={[
                  foundation.innerFoundationPoints[j].x,
                  foundation.innerFoundationPoints[j].y,
                  foundation.outerFoundationPoints[j].x,
                  foundation.outerFoundationPoints[j].y,
                ]}
                stroke="#FF00FF"
                strokeWidth={5}
              />
            ))}
            {uiStore.currentComponent === "foundation" && (
              <>
                <Text
                  x={foundation.innerFoundationPoints[0].x - 500}
                  y={foundation.innerFoundationPoints[0].y - 500}
                  text={foundation.label}
                  fontSize={500}
                  fill="#FF00FF"
                  draggable
                />

                {/* Outer Dimensions */}
                <Dimension
                  p1={outerLengthPoints[0]}
                  p2={outerLengthPoints[1]}
                  offset={1500}
                  label={outerLength}
                  isVertical={false}
                  dragPosition={dragPositions[foundationKey].lengthY}
                  onDragMove={handleLengthDrag}
                  rotation={0}
                  color="#FF00FF"
                />
                <Dimension
                  p1={outerHeightPoints[0]}
                  p2={outerHeightPoints[1]}
                  offset={-1500}
                  label={outerHeight}
                  isVertical={true}
                  dragPosition={dragPositions[foundationKey].heightX}
                  onDragMove={handleHeightDrag}
                  rotation={270}
                  color="#FF00FF"
                />

                {/* Inner Dimensions */}
                <Dimension
                  p1={innerLengthPoints[0]}
                  p2={innerLengthPoints[1]}
                  offset={1000}
                  label={innerLength}
                  isVertical={false}
                  dragPosition={dragPositions[foundationKey].innerLengthY}
                  onDragMove={handleInnerLengthDrag}
                  rotation={0}
                  color="#FF00FF"
                />
                <Dimension
                  p1={innerHeightPoints[0]}
                  p2={innerHeightPoints[1]}
                  offset={-1000}
                  label={innerHeight}
                  isVertical={true}
                  dragPosition={dragPositions[foundationKey].innerHeightX}
                  onDragMove={handleInnerHeightDrag}
                  rotation={270}
                  color="#FF00FF"
                />
              </>
            )}
          </Group>
        );
      })}
    </>
  );
});

export default Foundation;
