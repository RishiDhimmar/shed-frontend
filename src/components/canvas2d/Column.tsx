import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Line, Text, Group, Circle } from "react-konva";
import uiStore from "../../stores/UIStore";
import columnStore from "../../stores/ColumnStore";
import Dimension from "./Dimentions";

const Column = observer(() => {
  const [dragPositions, setDragPositions] = useState({});

  useEffect(() => {
    const initialPositions = {};
    columnStore.polygons.forEach((columnGroup, groupIndex) => {
      columnGroup.columns.forEach((_, columnIndex) => {
        const key = `column-${groupIndex}-${columnIndex}`;
        initialPositions[key] = { lengthY: 0, heightX: 0 };
      });

      // Initialize hEdgeWires and vEdgeWires if unset or set to default 10
      columnGroup.columns.forEach((column) => {
        const bbox = calculateBoundingBox(column.points);
        const offset = 40;
        const innerLength = bbox.maxX - bbox.minX - 2 * offset;
        const innerHeight = bbox.maxY - bbox.minY - 2 * offset;
        const numCirclesLength = Math.ceil(innerLength / 100);
        const numCirclesHeight = Math.ceil(innerHeight / 100);

        if (columnGroup.hEdgeWires === undefined || columnGroup.hEdgeWires === 10) {
          columnStore.sethEdgeWires(columnGroup.name, numCirclesLength);
        }
        if (columnGroup.vEdgeWires === undefined || columnGroup.vEdgeWires === 10) {
          columnStore.setvEdgeWires(columnGroup.name, numCirclesHeight);
        }
      });
    });
    setDragPositions(initialPositions);
  }, [columnStore.polygons]);

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

  const generateCirclesAlongEdge = (p1, p2, numCircles, edgeType, groupIndex, columnIndex) => {
    const circles = [];
    const wireData = [];
    const radius = 16;
    let xOffset, yOffset;

    switch (edgeType) {
      case "top":
        xOffset = 0;
        yOffset = radius;
        break;
      case "right":
        xOffset = -radius;
        yOffset = 0;
        break;
      case "bottom":
        xOffset = 0;
        yOffset = -radius;
        break;
      case "left":
        xOffset = radius;
        yOffset = 0;
        break;
      default:
        xOffset = 0;
        yOffset = 0;
    }

    const numEdgeCircles = Math.max(0, numCircles - 2);
    for (let i = 0; i < numEdgeCircles; i++) {
      const t = numEdgeCircles <= 0 ? 0.5 : (i + 1) / (numEdgeCircles + 1);
      const x = p1.x + t * (p2.x - p1.x) + xOffset;
      const y = p1.y + t * (p2.y - p1.y) + yOffset;
      
      circles.push(
        <Circle
          key={`circle-${edgeType}-${i}`}
          x={x}
          y={y}
          radius={radius}
          stroke="black"
          strokeWidth={3}
          opacity={0.8}
        />
      );
      
      wireData.push({
        type: "edge",
        edge: edgeType,
        x,
        y,
        radius,
      });
    }

    return { circles, wireData };
  };

  const generateCornerCircles = (bbox, offset, radius, groupIndex, columnIndex) => {
    const corners = [
      { x: bbox.minX + offset, y: bbox.minY + offset, position: "top-left", xOffset: radius, yOffset: radius },
      { x: bbox.maxX - offset, y: bbox.minY + offset, position: "top-right", xOffset: -radius, yOffset: radius },
      { x: bbox.maxX - offset, y: bbox.maxY - offset, position: "bottom-right", xOffset: -radius, yOffset: -radius },
      { x: bbox.minX + offset, y: bbox.maxY - offset, position: "bottom-left", xOffset: radius, yOffset: -radius },
    ];

    const circles = corners.map((corner, index) => (
      <Circle
        key={`corner-circle-${index}`}
        x={corner.x + corner.xOffset}
        y={corner.y + corner.yOffset}
        radius={radius}
        stroke="black"
        strokeWidth={3}
        opacity={0.8}
      />
    ));

    const wireData = corners.map((corner) => ({
      type: "corner",
      position: corner.position,
      x: corner.x + corner.xOffset,
      y: corner.y + corner.yOffset,
      radius,
    }));

    return { circles, wireData };
  };

  const renderColumns = () => {
    return columnStore.polygons.map((columnGroup, groupIndex) =>
      columnGroup.columns.map((column, columnIndex) => {
        const columnKey = `column-${groupIndex}-${columnIndex}`;
        const bbox = calculateBoundingBox(column.points);

        const drag = dragPositions[columnKey];
        if (!drag) return null;

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
              Math.pow(hits.right.hitPoint.x - hits.left.hitPoint.x, 2) +
              Math.pow(hits.right.hitPoint.y - hits.left.hitPoint.y, 2)
            ).toFixed(0);
            lengthPoints = [hits.left.hitPoint, hits.right.hitPoint];
          }

          if (hits.top && hits.bottom) {
            height = Math.sqrt(
              Math.pow(hits.bottom.hitPoint.x - hits.top.hitPoint.x, 2) +
              Math.pow(hits.bottom.hitPoint.y - hits.top.hitPoint.y, 2)
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

        const lengthOffset = column.hits?.find(
          (hit) => hit.hitDirection === "top"
        )
          ? -150
          : 150;
        const heightOffset = column.hits?.find(
          (hit) => hit.hitDirection === "left"
        )
          ? 150
          : -150;

        const offset = 40;
        const innerRectPoints = [
          bbox.minX + offset,
          bbox.minY + offset,
          bbox.maxX - offset,
          bbox.minY + offset,
          bbox.maxX - offset,
          bbox.maxY - offset,
          bbox.minX + offset,
          bbox.maxY - offset,
        ];

        const numCirclesLength = Math.max(2, Number(columnGroup.hEdgeWires) || 2);
        const numCirclesHeight = Math.max(2, Number(columnGroup.vEdgeWires) || 2);

        const topEdge = [
          { x: bbox.minX + offset, y: bbox.minY + offset },
          { x: bbox.maxX - offset, y: bbox.minY + offset },
        ];
        const rightEdge = [
          { x: bbox.maxX - offset, y: bbox.minY + offset },
          { x: bbox.maxX - offset, y: bbox.maxY - offset },
        ];
        const bottomEdge = [
          { x: bbox.maxX - offset, y: bbox.maxY - offset },
          { x: bbox.minX + offset, y: bbox.maxY - offset },
        ];
        const leftEdge = [
          { x: bbox.minX + offset, y: bbox.maxY - offset },
          { x: bbox.minX + offset, y: bbox.minY + offset },
        ];

        // Collect wire data
        const wireData = [];
        const { circles: topCircles, wireData: topWireData } = generateCirclesAlongEdge(
          topEdge[0],
          topEdge[1],
          numCirclesLength,
          "top",
          groupIndex,
          columnIndex
        );
        const { circles: rightCircles, wireData: rightWireData } = generateCirclesAlongEdge(
          rightEdge[0],
          rightEdge[1],
          numCirclesHeight,
          "right",
          groupIndex,
          columnIndex
        );
        const { circles: bottomCircles, wireData: bottomWireData } = generateCirclesAlongEdge(
          bottomEdge[0],
          bottomEdge[1],
          numCirclesLength,
          "bottom",
          groupIndex,
          columnIndex
        );
        const { circles: leftCircles, wireData: leftWireData } = generateCirclesAlongEdge(
          leftEdge[0],
          leftEdge[1],
          numCirclesHeight,
          "left",
          groupIndex,
          columnIndex
        );
        const { circles: cornerCircles, wireData: cornerWireData } = generateCornerCircles(
          bbox,
          offset,
          16,
          groupIndex,
          columnIndex
        );

        wireData.push(...topWireData, ...rightWireData, ...bottomWireData, ...leftWireData, ...cornerWireData);

        // Store wire data in columnStore
        columnStore.setWireData(columnGroup.name, column, wireData);

        return (
          <Group key={columnKey}>
            <Line
              points={column.points.flatMap((p) => [p.x, p.y])}
              stroke={
                uiStore.currentComponent === "foundation" ? "black" : "#6363E1"
              }
              strokeWidth={5}
              fill={uiStore.currentComponent === "column" ? "blue" : ""}
              opacity={uiStore.currentComponent === "column" ? 0.5 : 1}
              closed
              listening={false}
            />
            {uiStore.currentComponent === "column" && cornerCircles}
            {uiStore.currentComponent === "column" && topCircles}
            {uiStore.currentComponent === "column" && rightCircles}
            {uiStore.currentComponent === "column" && bottomCircles}
            {uiStore.currentComponent === "column" && leftCircles}
            {uiStore.currentComponent === "column" && (
              <>
                <Text
                  x={column.points[0].x}
                  y={column.points[0].y }
                  text={column.label}
                  fontSize={300}
                  fill="#6363E1"
                />
                <Dimension
                  p1={lengthPoints[0]}
                  p2={lengthPoints[1]}
                  offset={lengthOffset}
                  label={length}
                  isVertical={false}
                  dragPosition={drag.lengthY}
                  onDragMove={handleLengthDrag}
                  rotation={0}
                  color="#6363E1"
                />
                <Dimension
                  p1={heightPoints[0]}
                  p2={heightPoints[1]}
                  offset={heightOffset}
                  label={height}
                  isVertical={true}
                  dragPosition={drag.heightX}
                  onDragMove={handleHeightDrag}
                  rotation={270}
                  color="#6363E1"
                />
              </>
            )}
          </Group>
        );
      })
    );
  };

  return <>{renderColumns()}</>;
});

export default Column;