import React, { useState, useEffect } from "react";
import uiStore from "../../stores/UIStore";
import foundationStore from "../../stores/FoundationStore";
import { Line, Text, Group } from "react-konva";
import { observer } from "mobx-react-lite";
import Dimension from "./Dimentions";

const Foundation = observer(() => {
  const [dragPositions, setDragPositions] = useState({});

  useEffect(() => {
    const newPositions = {};

    foundationStore.groups.forEach((group, i) => {
      group.foundations.forEach((foundation, j) => {
        const foundationKey = `foundation-${i}-${j}`;
        if (!dragPositions[foundationKey]) {
          newPositions[foundationKey] = {
            lengthY: 0,
            heightX: 0,
            innerLengthY: 0,
            innerHeightX: 0,
          };
        }
      });
    });

    if (Object.keys(newPositions).length > 0) {
      setDragPositions((prev) => ({ ...prev, ...newPositions }));
    }
  }, [foundationStore.groups]);

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
      {foundationStore.groups.map((group, i) =>
        group.foundations.map((foundation, j) => {
          const foundationKey = `foundation-${i}-${j}`;
          const dragPos = dragPositions[foundationKey];

          if (!dragPos) return null;

          const outerBbox = calculateBoundingBox(foundation.outerFoundationPoints);
          const innerBbox = calculateBoundingBox(foundation.innerFoundationPoints);

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

          const handleDrag = (type, value) => {
            setDragPositions((prev) => ({
              ...prev,
              [foundationKey]: { ...prev[foundationKey], [type]: value },
            }));
          };

          return (
            <Group key={foundationKey} name={foundationKey}>
              <Line
                points={foundation.innerFoundationPoints.flatMap((p) => [p.x, p.y])}
                stroke={uiStore.currentComponent === "foundation" ? "black" : "#FF00FF"}
                strokeWidth={5}
                fill={uiStore.currentComponent === "foundation" ? "white" : ""}
                opacity={uiStore.currentComponent === "foundation" ? 0.5 : 1}
                closed
              />
              <Line
                points={foundation.outerFoundationPoints.flatMap((p) => [p.x, p.y])}
                stroke={uiStore.currentComponent === "foundation" ? "black" : "#FF00FF"}
                strokeWidth={5}
                fill={uiStore.currentComponent === "foundation" ? "#FF00FF" : ""}
                opacity={uiStore.currentComponent === "foundation" ? 0.5 : 1}
                closed
              />
              <Line
                points={foundation.ppcPoints.flatMap((p) => [p.x, p.y])}
                stroke="#FF00FF"
                strokeWidth={5}
                opacity={uiStore.currentComponent === "foundation" ? 0.5 : 1}
                closed
              />
              {[0, 1, 2, 3].map((k) => (
                <Line
                  key={`foundation-line-${i}-${j}-${k}`}
                  points={[
                    foundation.innerFoundationPoints[k].x,
                    foundation.innerFoundationPoints[k].y,
                    foundation.outerFoundationPoints[k].x,
                    foundation.outerFoundationPoints[k].y,
                  ]}
                  stroke={uiStore.currentComponent === "foundation" ? "black" : "#FF00FF"}
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
                    stroke="black"
                    strokeWidth={5}
                  />

                  <Dimension
                    p1={outerLengthPoints[0]}
                    p2={outerLengthPoints[1]}
                    offset={1500}
                    label={outerLength}
                    isVertical={false}
                    dragPosition={dragPos.lengthY}
                    onDragMove={(e) => handleDrag("lengthY", e.target.y())}
                    rotation={0}
                    color="#FF00FF"
                  />
                  <Dimension
                    p1={outerHeightPoints[0]}
                    p2={outerHeightPoints[1]}
                    offset={-1500}
                    label={outerHeight}
                    isVertical={true}
                    dragPosition={dragPos.heightX}
                    onDragMove={(e) => handleDrag("heightX", e.target.x())}
                    rotation={270}
                    color="#FF00FF"
                  />
                  <Dimension
                    p1={innerLengthPoints[0]}
                    p2={innerLengthPoints[1]}
                    offset={1000}
                    label={innerLength}
                    isVertical={false}
                    dragPosition={dragPos.innerLengthY}
                    onDragMove={(e) => handleDrag("innerLengthY", e.target.y())}
                    rotation={0}
                    color="#FF00FF"
                  />
                  <Dimension
                    p1={innerHeightPoints[0]}
                    p2={innerHeightPoints[1]}
                    offset={-1000}
                    label={innerHeight}
                    isVertical={true}
                    dragPosition={dragPos.innerHeightX}
                    onDragMove={(e) => handleDrag("innerHeightX", e.target.x())}
                    rotation={270}
                    color="#FF00FF"
                  />
                </>
              )}
            </Group>
          );
        })
      )}
    </>
  );
});

export default Foundation;
