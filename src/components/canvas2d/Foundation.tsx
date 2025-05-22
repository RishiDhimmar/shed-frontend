// import React, { useState, useEffect } from "react";
// import uiStore from "../../stores/UIStore";
// import foundationStore from "../../stores/FoundationStore";
// import { Line, Text, Group, Circle } from "react-konva";
// import { observer } from "mobx-react-lite";
// import Dimension from "./Dimentions";
// import { toJS } from "mobx";

// const Foundation = observer(() => {
//   const [dragPositions, setDragPositions] = useState({});

//   useEffect(() => {
//     const newPositions = {};

//     foundationStore.groups.forEach((group, i) => {
//       group.foundations.forEach((foundation, j) => {
//         const foundationKey = `foundation-${i}-${j}`;
//         if (!dragPositions[foundationKey]) {
//           newPositions[foundationKey] = {
//             lengthY: 0,
//             heightX: 0,
//             innerLengthY: 0,
//             innerHeightX: 0,
//           };
//         }
//       });
//     });

//     if (Object.keys(newPositions).length > 0) {
//       setDragPositions((prev) => ({ ...prev, ...newPositions }));
//     }
//   }, [foundationStore.groups]);

//   if (!uiStore.visibility.foundation) return null;

//   const calculateBoundingBox = (points) => {
//     const xs = points.map((p) => p.x);
//     const ys = points.map((p) => p.y);
//     return {
//       minX: Math.min(...xs),
//       maxX: Math.max(...xs),
//       minY: Math.min(...ys),
//       maxY: Math.max(...ys),
//     };
//   };

//   const calculateRods = (length, width) => {
//     const rodLength = length - 50 - 50;
//     const rodWidth = width - 50 - 50;
//     const rodsAlongLength = Math.ceil(length / 150);
//     const rodsAlongWidth = Math.ceil(width / 150);

//     return { rodLength, rodWidth, rodsAlongLength, rodsAlongWidth };
//   };

//   const generateRodLines = (
//     bbox,
//     rodLength,
//     rodWidth,
//     rodsAlongLength,
//     rodsAlongWidth
//   ) => {
//     const rodLines = [];
//     const tubeWidth = 10; // Distance between parallel lines

//     // Horizontal rods (along length)
//     const lengthSpacing = (bbox.maxY - bbox.minY) / (rodsAlongLength + 1);
//     for (let i = 1; i <= rodsAlongLength; i++) {
//       const y = bbox.minY + i * lengthSpacing;
//       rodLines.push({
//         line1: [bbox.minX + 50, y - tubeWidth/2, bbox.minX + rodLength + 50, y - tubeWidth/2],
//         line2: [bbox.minX + 50, y + tubeWidth/2, bbox.minX + rodLength + 50, y + tubeWidth/2],
//         circle1: { x: bbox.minX + 50, y: y },
//         circle2: { x: bbox.minX + rodLength + 50, y: y },
//         isHorizontal: true,
//       });
//     }

//     // Vertical rods (along width)
//     const widthSpacing = (bbox.maxX - bbox.minX) / (rodsAlongWidth + 1);
//     for (let i = 1; i <= rodsAlongWidth; i++) {
//       const x = bbox.minX + i * widthSpacing;
//       rodLines.push({
//         line1: [x - tubeWidth/2, bbox.minY + 50, x - tubeWidth/2, bbox.minY + rodWidth + 50],
//         line2: [x + tubeWidth/2, bbox.minY + 50, x + tubeWidth/2, bbox.minY + rodWidth + 50],
//         circle1: { x: x, y: bbox.minY + 50 },
//         circle2: { x: x, y: bbox.minY + rodWidth + 50 },
//         isHorizontal: false,
//       });
//     }

//     return rodLines;
//   };

//   return (
//     <>
//       {foundationStore.groups &&
//         foundationStore.groups.map(
//           (group, i) =>
//             group.foundations.length > 0 &&
//             group.foundations.map((foundation, j) => {
//               const foundationKey = `foundation-${i}-${j}`;
//               const dragPos = dragPositions[foundationKey];

//               if (!dragPos) return null;

//               const outerBbox = calculateBoundingBox(
//                 foundation.outerFoundationPoints
//               );
//               const innerBbox = calculateBoundingBox(
//                 foundation.innerFoundationPoints
//               );

//               const outerLength = (outerBbox.maxX - outerBbox.minX).toFixed(0);
//               const outerHeight = (outerBbox.maxY - outerBbox.minY).toFixed(0);
//               const innerLength = (innerBbox.maxX - innerBbox.minX).toFixed(0);
//               const innerHeight = (innerBbox.maxY - innerBbox.minY).toFixed(0);

//               const { rodLength, rodWidth, rodsAlongLength, rodsAlongWidth } =
//                 calculateRods(outerLength, outerHeight);

//               const rodLines = generateRodLines(
//                 outerBbox,
//                 rodLength,
//                 rodWidth,
//                 rodsAlongLength,
//                 rodsAlongWidth
//               );

//               foundationStore.setRodData(
//                 group.name,
//                 foundation.label,
//                 rodLines
//               );

//               const outerLengthPoints = [
//                 { x: outerBbox.minX, y: outerBbox.minY },
//                 { x: outerBbox.maxX, y: outerBbox.minY },
//               ];
//               const outerHeightPoints = [
//                 { x: outerBbox.minX, y: outerBbox.minY },
//                 { x: outerBbox.minX, y: outerBbox.maxY },
//               ];
//               const innerLengthPoints = [
//                 { x: innerBbox.minX, y: innerBbox.minY },
//                 { x: innerBbox.maxX, y: innerBbox.minY },
//               ];
//               const innerHeightPoints = [
//                 { x: innerBbox.minX, y: innerBbox.minY },
//                 { x: innerBbox.minX, y: innerBbox.maxY },
//               ];

//               const handleDrag = (type, value) => {
//                 setDragPositions((prev) => ({
//                   ...prev,
//                   [foundationKey]: { ...prev[foundationKey], [type]: value },
//                 }));
//               };

//               return (
//                 <Group key={foundationKey} name={foundationKey}>
//                 {console.log(toJS(foundation))}
//                   <Line
//                     points={foundation.innerFoundationPoints.flatMap((p) => [
//                       p.x,
//                       p.y,
//                     ])}
//                     stroke={
//                       uiStore.currentComponent === "foundation"
//                         ? "black"
//                         : "#FF00FF"
//                     }
//                     strokeWidth={5}
//                     fill={
//                       uiStore.currentComponent === "foundation" ? "white" : ""
//                     }
//                     opacity={
//                       uiStore.currentComponent === "foundation" ? 0.5 : 1
//                     }
//                     closed
//                   />
//                   <Line
//                     points={foundation.outerFoundationPoints.flatMap((p) => [
//                       p.x,
//                       p.y,
//                     ])}
//                     stroke={
//                       uiStore.currentComponent === "foundation"
//                         ? "black"
//                         : "#FF00FF"
//                     }
//                     strokeWidth={5}
//                     fill={
//                       uiStore.currentComponent === "foundation" ? "#FF00FF" : ""
//                     }
//                     opacity={
//                       uiStore.currentComponent === "foundation" ? 0.5 : 1
//                     }
//                     closed
//                   />
//                   <Line
//                     points={foundation.ppcPoints.flatMap((p) => [p.x, p.y])}
//                     stroke="#FF00FF"
//                     strokeWidth={5}
//                     opacity={
//                       uiStore.currentComponent === "foundation" ? 0.5 : 1
//                     }
//                     closed
//                   />
//                   {[0, 1, 2, 3].map((k) => (
//                     <Line
//                       key={`foundation-line-${i}-${j}-${k}`}
//                       points={[
//                         foundation.innerFoundationPoints[k].x,
//                         foundation.innerFoundationPoints[k].y,
//                         foundation.outerFoundationPoints[k].x,
//                         foundation.outerFoundationPoints[k].y,
//                       ]}
//                       stroke={
//                         uiStore.currentComponent === "foundation"
//                           ? "black"
//                           : "#FF00FF"
//                       }
//                       strokeWidth={5}
//                     />
//                   ))}

//                   {/* Render Tube-like Rods */}
//                   {uiStore.currentComponent === "foundation" &&
//                     rodLines.map((rod, index) => (
//                       <Group key={`rod-${i}-${j}-${index}`}>
//                         <Line
//                           points={rod.line1}
//                           stroke="blue"
//                           strokeWidth={3}
//                           opacity={0.8}
//                         />
//                         <Line
//                           points={rod.line2}
//                           stroke="blue"
//                           strokeWidth={3}
//                           opacity={0.8}
//                         />
//                         <Circle
//                           x={rod.circle1.x}
//                           y={rod.circle1.y}
//                           radius={5}
//                           stroke="blue"
//                           strokeWidth={3}
//                           opacity={0.8}
//                         />
//                         <Circle
//                           x={rod.circle2.x}
//                           y={rod.circle2.y}
//                           radius={5}
//                           stroke="blue"
//                           strokeWidth={3}
//                           opacity={0.8}
//                         />
//                       </Group>
//                     ))}

//                   {uiStore.currentComponent === "foundation" && (
//                     <>
//                       <Text
//                         x={foundation.outerFoundationPoints[0].x }
//                         y={foundation.outerFoundationPoints[0].y }
//                         text={foundation.label}
//                         fontSize={150}
//                         fill="#FF00FF"
//                         stroke="black"
//                         strokeWidth={5}
//                       />

//                       <Dimension
//                         p1={outerLengthPoints[0]}
//                         p2={outerLengthPoints[1]}
//                         offset={450}
//                         label={outerLength}
//                         isVertical={false}
//                         dragPosition={dragPos.lengthY}
//                         onDragMove={(e) => handleDrag("lengthY", e.target.y())}
//                         rotation={0}
//                         color="#FF00FF"
//                       />
//                       <Dimension
//                         p1={outerHeightPoints[0]}
//                         p2={outerHeightPoints[1]}
//                         offset={-450}
//                         label={outerHeight}
//                         isVertical={true}
//                         dragPosition={dragPos.heightX}
//                         onDragMove={(e) => handleDrag("heightX", e.target.x())}
//                         rotation={270}
//                         color="#FF00FF"
//                       />
//                       <Dimension
//                         p1={innerLengthPoints[0]}
//                         p2={innerLengthPoints[1]}
//                         offset={150}
//                         label={innerLength}
//                         isVertical={false}
//                         dragPosition={dragPos.innerLengthY}
//                         onDragMove={(e) =>
//                           handleDrag("innerLengthY", e.target.y())
//                         }
//                         rotation={0}
//                         color="#FF00FF"
//                       />
//                       <Dimension
//                         p1={innerHeightPoints[0]}
//                         p2={innerHeightPoints[1]}
//                         offset={-150}
//                         label={innerHeight}
//                         isVertical={true}
//                         dragPosition={dragPos.innerHeightX}
//                         onDragMove={(e) =>
//                           handleDrag("innerHeightX", e.target.x())
//                         }
//                         rotation={270}
//                         color="#FF00FF"
//                       />
//                     </>
//                   )}
//                 </Group>
//               );
//             })
//         )}
//     </>
//   );
// });

// export default Foundation;
import React, { useState, useEffect, useRef, useCallback } from "react";
import uiStore from "../../stores/UIStore";
import foundationStore from "../../stores/FoundationStore";
import { Line, Text, Group, Circle } from "react-konva";
import { observer } from "mobx-react-lite";
import Dimension from "./Dimentions"; // Note: Fix typo in import (should be "Dimensions")
import { toJS } from "mobx";

const Foundation = observer(() => {
  const [dragPositions, setDragPositions] = useState({});
  const [activeInputs, setActiveInputs] = useState({});
  const lastValuesRef = useRef({});

  useEffect(() => {
    if (!foundationStore.groups || foundationStore.groups.length === 0) {
      console.warn("foundationStore.groups is empty or not initialized");
      return;
    }

    const newPositions = {};
    const initialValues = {};

    foundationStore.groups.forEach((group, i) => {
      group.foundations.forEach((foundation, j) => {
        const foundationKey = `${group.name}-${foundation.label}`; // Consistent key format
        if (!dragPositions[foundationKey]) {
          newPositions[foundationKey] = {
            lengthY: 0,
            heightX: 0,
          };
        }

        const outerBbox = calculateBoundingBox(
          foundation.outerFoundationPoints
        );
        initialValues[foundationKey] = {
          outerLength: outerBbox.maxX - outerBbox.minX,
          outerHeight: outerBbox.maxY - outerBbox.minY,
        };
      });
    });

    if (Object.keys(newPositions).length > 0) {
      setDragPositions((prev) => ({ ...prev, ...newPositions }));
    }
    lastValuesRef.current = initialValues;

    console.log("Initialized lastValuesRef.current:", lastValuesRef.current);
  }, [foundationStore.groups]);

  const calculateBoundingBox = (points) => {
    if (!points || points.length === 0) {
      console.warn("No points provided for calculateBoundingBox");
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    if (maxX === minX || maxY === minY) {
      console.warn("Invalid bounding box: points may be identical", points);
    }

    return { minX, maxX, minY, maxY };
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
    const tubeWidth = 10;

    const lengthSpacing = (bbox.maxY - bbox.minY) / (rodsAlongLength + 1);
    for (let i = 1; i <= rodsAlongLength; i++) {
      const y = bbox.minY + i * lengthSpacing;
      rodLines.push({
        line1: [
          bbox.minX + 50,
          y - tubeWidth / 2,
          bbox.minX + rodLength + 50,
          y - tubeWidth / 2,
        ],
        line2: [
          bbox.minX + 50,
          y + tubeWidth / 2,
          bbox.minX + rodLength + 50,
          y + tubeWidth / 2,
        ],
        circle1: { x: bbox.minX + 50, y: y },
        circle2: { x: bbox.minX + rodLength + 50, y: y },
        isHorizontal: true,
      });
    }

    const widthSpacing = (bbox.maxX - bbox.minX) / (rodsAlongWidth + 1);
    for (let i = 1; i <= rodsAlongWidth; i++) {
      const x = bbox.minX + i * widthSpacing;
      rodLines.push({
        line1: [
          x - tubeWidth / 2,
          bbox.minY + 50,
          x - tubeWidth / 2,
          bbox.minY + rodWidth + 50,
        ],
        line2: [
          x + tubeWidth / 2,
          bbox.minY + 50,
          x + tubeWidth / 2,
          bbox.minY + rodWidth + 50,
        ],
        circle1: { x: x, y: bbox.minY + 50 },
        circle2: { x: x, y: bbox.minY + rodWidth + 50 },
        isHorizontal: false,
      });
    }

    return rodLines;
  };

  const handleChangeOfFoundationInputs = useCallback(
    (delta, groupName, foundationLabel, isVertical) => {
      const currentInputs = toJS(foundationStore.foundationInputs);
      const updatedInputs = {};

      for (const group in currentInputs) {
        const groupInputs = currentInputs[group];
        if (group === groupName) {
          updatedInputs[group] = {
            ...groupInputs,
            ...(isVertical
              ? {
                  "-y": (groupInputs["-y"] ?? 0) + delta / 2,
                  "+y": (groupInputs["+y"] ?? 0) + delta / 2,
                }
              : {
                  "-x": (groupInputs["-x"] ?? 0) + delta / 2,
                  "+x": (groupInputs["+x"] ?? 0) + delta / 2,
                }),
          };
        } else {
          updatedInputs[group] = { ...groupInputs };
        }
      }

      foundationStore.setFoundationInputs(updatedInputs);
    },
    []
  );

  const handleOuterLengthInputChange = (
    newValue,
    groupName,
    foundationLabel
  ) => {
    const parsedNewValue = Number(newValue);
    if (isNaN(parsedNewValue)) {
      console.warn("Invalid input: Not a number");
      return;
    }

    const foundationKey = `${groupName}-${foundationLabel}`;
    const currentOuterLength =
      lastValuesRef.current[foundationKey]?.outerLength || 0;
    const delta = parsedNewValue - currentOuterLength;

    lastValuesRef.current = {
      ...lastValuesRef.current,
      [foundationKey]: {
        ...lastValuesRef.current[foundationKey],
        outerLength: parsedNewValue,
      },
    };

    console.log(
      `handleOuterLengthInputChange - foundationKey: ${foundationKey}, currentOuterLength: ${currentOuterLength}, newValue: ${parsedNewValue}, delta: ${delta}`
    );

    handleChangeOfFoundationInputs(delta, groupName, foundationLabel, false);
  };

  const handleOuterHeightInputChange = (
    newValue,
    groupName,
    foundationLabel
  ) => {
    const parsedNewValue = Number(newValue);
    if (isNaN(parsedNewValue)) {
      console.warn("Invalid input: Not a number");
      return;
    }

    const foundationKey = `${groupName}-${foundationLabel}`;
    const currentOuterHeight =
      lastValuesRef.current[foundationKey]?.outerHeight || 0;
    const delta = parsedNewValue - currentOuterHeight;

    lastValuesRef.current = {
      ...lastValuesRef.current,
      [foundationKey]: {
        ...lastValuesRef.current[foundationKey],
        outerHeight: parsedNewValue,
      },
    };

    console.log(
      `handleOuterHeightInputChange - foundationKey: ${foundationKey}, currentOuterHeight: ${currentOuterHeight}, newValue: ${parsedNewValue}, delta: ${delta}`
    );

    handleChangeOfFoundationInputs(delta, groupName, foundationLabel, true);
  };
  const handleMoveToNewGroup = (groupName, foundationLabel) => {
    const newGroupName =
      "Group " + (Object.keys(foundationStore.groups).length + 1);
    if (newGroupName) {
      const newGroup = {
        name: newGroupName,
        foundations: [],
      };
      foundationStore.groups.push(newGroup);
    }
    foundationStore.removeFoundationFromGroup(groupName, foundationLabel);
    foundationStore.addFoundationToGroup(newGroupName, foundationLabel);
  };

  const handleInputClick = (foundationKey, dimensionType) => {
    console.log("Input clicked:", foundationKey, dimensionType);
    setActiveInputs((prev) => ({
      ...prev,
      [`${foundationKey}-${dimensionType}`]: true,
    }));
  };

  const handleInputBlur = (foundationKey, dimensionType) => {
    setActiveInputs((prev) => ({
      ...prev,
      [`${foundationKey}-${dimensionType}`]: false,
    }));
  };
  if (!uiStore.visibility.foundation) return null;

  return (
    <>
      {foundationStore.groups &&
        foundationStore.groups.map(
          (group, i) =>
            group.foundations.length > 0 &&
            group.foundations.map((foundation, j) => {
              const foundationKey = `${group.name}-${foundation.label}`;
              const dragPos = dragPositions[foundationKey];

              if (!dragPos) return null;

              const outerBbox = calculateBoundingBox(
                foundation.outerFoundationPoints
              );

              const outerLength = (outerBbox.maxX - outerBbox.minX).toFixed(0);
              const outerHeight = (outerBbox.maxY - outerBbox.minY).toFixed(0);

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
                        x={foundation.outerFoundationPoints[0].x}
                        y={foundation.outerFoundationPoints[0].y}
                        text={foundation.label}
                        fontSize={150}
                        fill="#FF00FF"
                        stroke="black"
                        strokeWidth={5}
                      />
                      {console.log(
                        foundationStore.groups.find(
                          (g) => g.name === group.name
                        )
                      )}
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
                        isInputActive={
                          activeInputs[`${foundationKey}-outerLength`] || false
                        }
                        onInputClick={() =>
                          handleInputClick(foundationKey, "outerLength")
                        }
                        onInputChange={(value) =>
                          handleOuterLengthInputChange(
                            value,
                            group.name,
                            foundation.label
                          )
                        }
                        onInputBlur={() =>
                          handleInputBlur(foundationKey, "outerLength")
                        }
                        showMoveButton={
                          foundationStore.groups.find(
                            (g) => g.name === group.name
                          ).foundations.length > 1
                        }
                        onMoveToNewGroup={() => {
                          handleMoveToNewGroup(group.name, foundation.label);
                        }}
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
                        isInputActive={
                          activeInputs[`${foundationKey}-outerHeight`] || false
                        }
                        onInputClick={() =>
                          handleInputClick(foundationKey, "outerHeight")
                        }
                        onInputChange={(value) =>
                          handleOuterHeightInputChange(
                            value,
                            group.name,
                            foundation.label
                          )
                        }
                        onInputBlur={() =>
                          handleInputBlur(foundationKey, "outerHeight")
                        }
                        showMoveButton={
                          foundationStore.groups.find(
                            (g) => g.name === group.name
                          ).foundations.length > 1
                        }
                        onMoveToNewGroup={handleMoveToNewGroup}
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
