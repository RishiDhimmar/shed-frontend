import React, { useState } from "react";
import uiStore from "../../stores/UIStore";
import { Line, Text } from "react-konva";
import mullionColumnStore from "../../stores/MullianColumnStore";
import { observer } from "mobx-react-lite";
import Dimension from "./Dimentions"; // shared dimension component

const MullionColumn = observer(() => {
  const [dragPositions, setDragPositions] = useState({});

  if (!uiStore.visibility.mullionColumn) return null;

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

  const handleDrag = (e, key, type, axis) => {
    const val = axis === "x" ? e.target.x() : e.target.y();
    setDragPositions((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [type]: val,
      },
    }));
  };

  return (
    <>
      {mullionColumnStore.polygons.map((polygon, i) => {
        const key = `mullion-column-${i}`;
        const box = calculateBoundingBox(polygon.points);

        // Initialize drag positions if not already set
        if (!dragPositions[key]) {
          setDragPositions((prev) => ({
            ...prev,
            [key]: {
              lengthY: -1500,
              heightX: -1500,
            },
          }));
        }

        return (
          <React.Fragment key={key}>
            {/* Draw polygon */}
            <Line
              points={polygon.points.flatMap((p) => [p.x, p.y])}
              stroke={
                uiStore.currentComponent === "mullionColumn" ? "black" : "red"
              }
              strokeWidth={5}
              fill={uiStore.currentComponent === "mullionColumn" ? "red" : ""}
              opacity={uiStore.currentComponent === "mullionColumn" ? 0.5 : 1}
              closed
            />

            {/* Label */}
            {uiStore.currentComponent === "mullionColumn" && (
              <Text
                x={polygon.points[0].x - 500}
                y={polygon.points[0].y + 500}
                text={polygon.label}
                fontSize={300}
                fill="red"
                draggable
              />
            )}

            {/* Dimensions */}
            {uiStore.currentComponent === "mullionColumn" && (
              <>
                {/* Horizontal length */}
                <Dimension
                  p1={{ x: box.minX, y: box.minY }}
                  p2={{ x: box.maxX, y: box.minY }}
                  offset={dragPositions[key].lengthY}
                  label={(box.maxX - box.minX).toFixed(0)}
                  isVertical={false}
                  dragPosition={dragPositions[key].lengthY}
                  onDragMove={(e) => handleDrag(e, key, "lengthY", "y")}
                  rotation={0}
                  color={"red"}
                />

                {/* Vertical height */}
                <Dimension
                  p1={{ x: box.minX, y: box.minY }}
                  p2={{ x: box.minX, y: box.maxY }}
                  offset={dragPositions[key].heightX}
                  label={(box.maxY - box.minY).toFixed(0)}
                  isVertical={true}
                  dragPosition={dragPositions[key].heightX}
                  onDragMove={(e) => handleDrag(e, key, "heightX", "x")}
                  rotation={270}
                  color={"red"}
                />
              </>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
});

export default MullionColumn;
