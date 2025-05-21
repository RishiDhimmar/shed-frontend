import React, { useState, useEffect } from "react";
import uiStore from "../../stores/UIStore";
import foundationStore from "../../stores/FoundationStore";
import { Line, Text, Group, Circle } from "react-konva";
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

  const calculateRods = (length, width) => {
    const rodLength = length - 50 - 50;
    const rodWidth = width - 50 - 50;
    const rodsAlongLength = Math.ceil(length / 150);
    const rodsAlongWidth = Math.ceil(width / 150);

    return { rodLength, rodWidth, rodsAlongLength, rodsAlongWidth };
  };

  const generateRodLines = (
    bbox,
    rodLength,
    rodWidth,
    rodsAlongLength,
    rodsAlongWidth
  ) => {
    const rodLines = [];
    const tubeWidth = 10; // Distance between parallel lines

    // Horizontal rods (along length)
    const lengthSpacing = (bbox.maxY - bbox.minY) / (rodsAlongLength + 1);
    for (let i = 1; i <= rodsAlongLength; i++) {
      const y = bbox.minY + i * lengthSpacing;
      rodLines.push({
        line1: [bbox.minX + 50, y - tubeWidth/2, bbox.minX + rodLength + 50, y - tubeWidth/2],
        line2: [bbox.minX + 50, y + tubeWidth/2, bbox.minX + rodLength + 50, y + tubeWidth/2],
        circle1: { x: bbox.minX + 50, y: y },
        circle2: { x: bbox.minX + rodLength + 50, y: y },
        isHorizontal: true,
      });
    }

    // Vertical rods (along width)
    const widthSpacing = (bbox.maxX - bbox.minX) / (rodsAlongWidth + 1);
    for (let i = 1; i <= rodsAlongWidth; i++) {
      const x = bbox.minX + i * widthSpacing;
      rodLines.push({
        line1: [x - tubeWidth/2, bbox.minY + 50, x - tubeWidth/2, bbox.minY + rodWidth + 50],
        line2: [x + tubeWidth/2, bbox.minY + 50, x + tubeWidth/2, bbox.minY + rodWidth + 50],
        circle1: { x: x, y: bbox.minY + 50 },
        circle2: { x: x, y: bbox.minY + rodWidth + 50 },
        isHorizontal: false,
      });
    }

    return rodLines;
  };

  return (
    <>
      {foundationStore.groups &&
        foundationStore.groups.map(
          (group, i) =>
            group.foundations.length > 0 &&
            group.foundations.map((foundation, j) => {
              const foundationKey = `foundation-${i}-${j}`;
              const dragPos = dragPositions[foundationKey];

              if (!dragPos) return null;

              const outerBbox = calculateBoundingBox(
                foundation.outerFoundationPoints
              );
              const innerBbox = calculateBoundingBox(
                foundation.innerFoundationPoints
              );

              const outerLength = (outerBbox.maxX - outerBbox.minX).toFixed(0);
              const outerHeight = (outerBbox.maxY - outerBbox.minY).toFixed(0);
              const innerLength = (innerBbox.maxX - innerBbox.minX).toFixed(0);
              const innerHeight = (innerBbox.maxY - innerBbox.minY).toFixed(0);

              const { rodLength, rodWidth, rodsAlongLength, rodsAlongWidth } =
                calculateRods(outerLength, outerHeight);

              const rodLines = generateRodLines(
                outerBbox,
                rodLength,
                rodWidth,
                rodsAlongLength,
                rodsAlongWidth
              );

              foundationStore.setRodData(
                group.name,
                foundation.label,
                rodLines
              );

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
                    points={foundation.innerFoundationPoints.flatMap((p) => [
                      p.x,
                      p.y,
                    ])}
                    stroke={
                      uiStore.currentComponent === "foundation"
                        ? "black"
                        : "#FF00FF"
                    }
                    strokeWidth={5}
                    fill={
                      uiStore.currentComponent === "foundation" ? "white" : ""
                    }
                    opacity={
                      uiStore.currentComponent === "foundation" ? 0.5 : 1
                    }
                    closed
                  />
                  <Line
                    points={foundation.outerFoundationPoints.flatMap((p) => [
                      p.x,
                      p.y,
                    ])}
                    stroke={
                      uiStore.currentComponent === "foundation"
                        ? "black"
                        : "#FF00FF"
                    }
                    strokeWidth={5}
                    fill={
                      uiStore.currentComponent === "foundation" ? "#FF00FF" : ""
                    }
                    opacity={
                      uiStore.currentComponent === "foundation" ? 0.5 : 1
                    }
                    closed
                  />
                  <Line
                    points={foundation.ppcPoints.flatMap((p) => [p.x, p.y])}
                    stroke="#FF00FF"
                    strokeWidth={5}
                    opacity={
                      uiStore.currentComponent === "foundation" ? 0.5 : 1
                    }
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
                      stroke={
                        uiStore.currentComponent === "foundation"
                          ? "black"
                          : "#FF00FF"
                      }
                      strokeWidth={5}
                    />
                  ))}

                  {/* Render Tube-like Rods */}
                  {uiStore.currentComponent === "foundation" &&
                    rodLines.map((rod, index) => (
                      <Group key={`rod-${i}-${j}-${index}`}>
                        <Line
                          points={rod.line1}
                          stroke="blue"
                          strokeWidth={3}
                          opacity={0.8}
                        />
                        <Line
                          points={rod.line2}
                          stroke="blue"
                          strokeWidth={3}
                          opacity={0.8}
                        />
                        <Circle
                          x={rod.circle1.x}
                          y={rod.circle1.y}
                          radius={5}
                          stroke="blue"
                          strokeWidth={3}
                          opacity={0.8}
                        />
                        <Circle
                          x={rod.circle2.x}
                          y={rod.circle2.y}
                          radius={5}
                          stroke="blue"
                          strokeWidth={3}
                          opacity={0.8}
                        />
                      </Group>
                    ))}

                  {uiStore.currentComponent === "foundation" && (
                    <>
                      <Text
                        x={foundation.outerFoundationPoints[0].x }
                        y={foundation.outerFoundationPoints[0].y }
                        text={foundation.label}
                        fontSize={150}
                        fill="#FF00FF"
                        stroke="black"
                        strokeWidth={5}
                      />

                      <Dimension
                        p1={outerLengthPoints[0]}
                        p2={outerLengthPoints[1]}
                        offset={450}
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
                        offset={-450}
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
                        offset={150}
                        label={innerLength}
                        isVertical={false}
                        dragPosition={dragPos.innerLengthY}
                        onDragMove={(e) =>
                          handleDrag("innerLengthY", e.target.y())
                        }
                        rotation={0}
                        color="#FF00FF"
                      />
                      <Dimension
                        p1={innerHeightPoints[0]}
                        p2={innerHeightPoints[1]}
                        offset={-150}
                        label={innerHeight}
                        isVertical={true}
                        dragPosition={dragPos.innerHeightX}
                        onDragMove={(e) =>
                          handleDrag("innerHeightX", e.target.x())
                        }
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