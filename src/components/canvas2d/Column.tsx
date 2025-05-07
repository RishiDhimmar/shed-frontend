import React, { useState } from "react";
import uiStore from "../../stores/UIStore";
import columnStore from "../../stores/ColumnStore";
import { Line, Text, Group } from "react-konva";
import { observer } from "mobx-react-lite";
import Dimension from "./Dimentions";

const Column = observer(() => {
  const [dragPositions, setDragPositions] = useState({});

  if (!uiStore.visibility.column) return null;

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

  const renderColumns = () => {
    return columnStore.polygons.flat().map((column, i) => {
      const columnKey = `column-${i}`;
      const bbox = calculateBoundingBox(column.points);

      if (!dragPositions[columnKey]) {
        // Initialize dragPositions for the column
        setDragPositions((prev) => ({
          ...prev,
          [columnKey]: { lengthY: 0, heightX: 0 },
        }));
        return null;
      }

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

      if (column.hits?.length) {
        const hits = {
          top: column.hits.find((hit) => hit.hitDirection === "top"),
          bottom: column.hits.find((hit) => hit.hitDirection === "bottom"),
          left: column.hits.find((hit) => hit.hitDirection === "left"),
          right: column.hits.find((hit) => hit.hitDirection === "right"),
        };

        if (hits.left && hits.right) {
          length = Math.sqrt(
            (hits.right.hitPoint.x - hits.left.hitPoint.x) ** 2 +
              (hits.right.hitPoint.y - hits.left.hitPoint.y) ** 2
          ).toFixed(0);
          lengthPoints = [hits.left.hitPoint, hits.right.hitPoint];
        }

        if (hits.top && hits.bottom) {
          height = Math.sqrt(
            (hits.bottom.hitPoint.x - hits.top.hitPoint.x) ** 2 +
              (hits.bottom.hitPoint.y - hits.top.hitPoint.y) ** 2
          ).toFixed(0);
          heightPoints = [hits.top.hitPoint, hits.bottom.hitPoint];
        }
      }

      const handleLengthDrag = (e) => {
        const node = e.target;
        node.x(0);
        const newY = node.y();
        setDragPositions((prev) => ({
          ...prev,
          [columnKey]: { ...prev[columnKey], lengthY: newY },
        }));
      };

      const handleHeightDrag = (e) => {
        const node = e.target;
        node.y(0);
        const newX = node.x();
        setDragPositions((prev) => ({
          ...prev,
          [columnKey]: { ...prev[columnKey], heightX: newX },
        }));
      };

      const lengthOffset = column.hits?.find((hit) => hit.hitDirection === "top")
        ? -1500
        : 1500;
      const heightOffset = column.hits?.find((hit) => hit.hitDirection === "left")
        ? -1500
        : 1500;

      return (
        <Group key={columnKey}>
          <Line
            points={column.points.flatMap((p) => [p.x, p.y])}
            stroke="#6363E1"
            strokeWidth={5}
            fill={uiStore.currentComponent === "column" ? "blue" : ""}
            opacity={uiStore.currentComponent === "column" ? 0.5 : 1}
            closed
            listening={false}
          />
          {uiStore.currentComponent === "column" && (
            <>
              <Text
                x={column.points[0].x - 900}
                y={column.points[0].y + 1200}
                text={column.label}
                fontSize={300}
                fill="#6363E1"
                draggable
              />
              <Dimension
                p1={lengthPoints[0]}
                p2={lengthPoints[1]}
                offset={lengthOffset}
                label={length}
                isVertical={false}
                dragPosition={dragPositions[columnKey].lengthY}
                onDragMove={handleLengthDrag}
                rotation={0}
                color={"#6363E1"}
              />
              <Dimension
                p1={heightPoints[0]}
                p2={heightPoints[1]}
                offset={heightOffset}
                label={height}
                isVertical={true}
                dragPosition={dragPositions[columnKey].heightX}
                onDragMove={handleHeightDrag}
                rotation={270}
                color={"#6363E1"}
              />
            </>
          )}
        </Group>
      );
    });
  };

  return <>{renderColumns()}</>;
});

export default Column;
