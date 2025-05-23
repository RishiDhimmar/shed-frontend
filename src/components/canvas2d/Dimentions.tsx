// import React, { useState, useRef, useCallback, MouseEvent } from "react";
// import { Arrow, Line, Text, Group } from "react-konva";
// import { Html } from "react-konva-utils";
// import columnStore from "../../stores/ColumnStore";
// import { toJS } from "mobx";

// interface DimensionProps {
//   p1: { x: number; y: number };
//   p2: { x: number; y: number };
//   offset: number;
//   label: string;
//   isVertical: boolean;
//   dragPosition: number;
//   rotation: number;
//   color: string;
//   isDraggable: boolean;
//   fontSize?: number;
//   textStrokeWidth?: number;
//   onDblClick?: () => void;
//   onLabelChange?: (val: string) => void;
//   grpName?: string;
//   name?: string;
// }

// const Dimension: React.FC<DimensionProps> = ({
//   p1,
//   p2,
//   offset,
//   label,
//   isVertical,
//   dragPosition,
//   rotation,
//   color,
//   isDraggable,
//   fontSize = 100,
//   textStrokeWidth = 3,
//   onDblClick,
//   onLabelChange,
//   grpName = "N/A",
//   name = "N/A",
// }) => {
//   const [isInputActive, setIsInputActive] = useState(false);
//   const lastValueRef = useRef(Number(label));
//   const inputRef = useRef<HTMLInputElement>(null);

//   const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
//   const offsetX = offset * Math.sin(angle);
//   const offsetY = -offset * Math.cos(angle);

//   const labelX = (p1.x + p2.x) / 2 + offsetX;
//   const labelY = (p1.y + p2.y) / 2 + offsetY;

//   const handleInputClick = () => {
//     setIsInputActive(true);
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }
//   };

//   const handleInputBlur = () => {
//     setIsInputActive(false);
//     if (onLabelChange) onLabelChange(label); // Ensure parent has the latest value
//   };

//   const handleChangeOfColumnInputs = useCallback(
//     (delta: number, grpName: string, name: string) => {
//       const currentInputs = toJS(columnStore.columnInputs);
//       const updatedInputs = {};

//       for (const group in currentInputs) {
//         const groupInputs = currentInputs[group];
//         if (group === grpName) {
//           updatedInputs[group] = {
//             ...groupInputs,
//             ...(isVertical
//               ? {
//                   "-y": (groupInputs["-y"] ?? 0) + delta,
//                   "+y": (groupInputs["+y"] ?? 0) + delta,
//                 }
//               : {
//                   "-x": (groupInputs["-x"] ?? 0) + delta,
//                   "+x": (groupInputs["+x"] ?? 0) + delta,
//                 }),
//           };
//         } else {
//           updatedInputs[group] = { ...groupInputs };
//         }
//       }

//       columnStore.setColumnInputs(updatedInputs);
//     },
//     []
//   );

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value;
//     const parsedNewValue = Number(newValue);

//     if (isNaN(parsedNewValue)) {
//       console.warn("Invalid input: Not a number");
//       return;
//     }

//     const delta = parsedNewValue - lastValueRef.current;

//     console.log("Input Change:", {
//       newValue,
//       parsedNewValue,
//       previousValue: lastValueRef.current,
//       delta,
//       grpName,
//       name,
//     });

//     lastValueRef.current = parsedNewValue;
//     if (onLabelChange) onLabelChange(newValue);
//     handleChangeOfColumnInputs(delta, grpName, name);
//   };

//   function onMoveToNewGroup(
//     event: MouseEvent<HTMLButtonElement, MouseEvent>
//   ): void {
//     columnStore.addGroup({
//       name: "Temp" + Object.keys(columnStore.polygons).length,
//       columns: [],
//     });
//     columnStore.removeColumnFromGroup(grpName, name);
//     columnStore.addColumnToGroup(
//       "Temp" + (Object.keys(columnStore.polygons).length - 1),
//       name
//     );
//   }

//   return (
//     <Group>
//       <Arrow
//         points={[
//           p1.x + offsetX,
//           p1.y + offsetY,
//           p2.x + offsetX,
//           p2.y + offsetY,
//         ]}
//         pointerLength={20}
//         pointerWidth={15}
//         fill={color}
//         stroke={color}
//         strokeWidth={3}
//         pointerAtBeginning
//         pointerAtEnding
//       />
//       <Line
//         points={[
//           p1.x,
//           p1.y,
//           p1.x + offsetX - (isVertical ? dragPosition : 0),
//           p1.y + offsetY - (isVertical ? 0 : dragPosition),
//         ]}
//         stroke={color}
//         strokeWidth={3}
//         dash={[10, 5]}
//       />
//       <Line
//         points={[
//           p2.x,
//           p2.y,
//           p2.x + offsetX - (isVertical ? dragPosition : 0),
//           p2.y + offsetY - (isVertical ? 0 : dragPosition),
//         ]}
//         stroke={color}
//         strokeWidth={3}
//         dash={[10, 5]}
//       />
//       <Text
//         x={labelX}
//         y={labelY}
//         text={`${label} mm`}
//         fontSize={fontSize}
//         stroke="black"
//         strokeWidth={textStrokeWidth}
//         fill={color}
//         align="center"
//         rotation={rotation}
//         onDblClick={() => {
//           handleInputClick();
//           if (onDblClick) onDblClick();
//         }}
//         listening
//       />
//       {isInputActive && (
//         <Html groupProps={{ x: labelX, y: labelY }}>
//           <div className="flex flex-col items-center justify-center">
//             <>
//               <input
//                 ref={inputRef}
//                 type="number"
//                 value={label}
//                 onChange={handleInputChange}
//                 onBlur={handleInputBlur}
//                 step={25}
//                 className="w-[250px] h-[100px] border border-gray-300 rounded-md p-2 text-[50px] text-center bg-white/80"
//               />

//               {columnStore.polygons.find((g) => g.name === grpName).columns
//                 .length > 1 && (
//                 <button
//                   onClick={onMoveToNewGroup}
//                   className="mt-2 px-6 py-2 text-lg bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
//                 >
//                   Move to New Group
//                 </button>
//               )}
//             </>
//           </div>
//         </Html>
//       )}
//     </Group>
//   );
// };

// export default Dimension;


import React from "react";
import { Arrow, Line, Text, Group } from "react-konva";
import { Html } from "react-konva-utils";

interface DimensionProps {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  offset: number;
  label: string;
  isVertical: boolean;
  dragPosition: number;
  rotation: number;
  color: string;
  fontSize?: number;
  textStrokeWidth?: number;
  isInputActive?: boolean;
  onInputClick?: () => void;
  onInputChange?: (val: string) => void;
  onInputBlur?: () => void;
  showMoveButton?: boolean;
  onMoveToNewGroup?: () => void;
}

const Dimension: React.FC<DimensionProps> = ({
  p1,
  p2,
  offset,
  label,
  isVertical,
  dragPosition,
  rotation,
  color,
  fontSize = 100,
  textStrokeWidth = 3,
  isInputActive = false,
  onInputClick,
  onInputChange,
  onInputBlur,
  showMoveButton = false,
  onMoveToNewGroup,
}) => {
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const offsetX = offset * Math.sin(angle);
  const offsetY = -offset * Math.cos(angle);

  const labelX = (p1.x + p2.x) / 2 + offsetX;
  const labelY = (p1.y + p2.y) / 2 + offsetY;

  return (
    <Group>
      <Arrow
        points={[
          p1.x + offsetX,
          p1.y + offsetY,
          p2.x + offsetX,
          p2.y + offsetY,
        ]}
        pointerLength={20}
        pointerWidth={15}
        fill={color}
        stroke={color}
        strokeWidth={3}
        pointerAtBeginning
        pointerAtEnding
      />
      <Line
        points={[
          p1.x,
          p1.y,
          p1.x + offsetX - (isVertical ? dragPosition : 0),
          p1.y + offsetY - (isVertical ? 0 : dragPosition),
        ]}
        stroke={color}
        strokeWidth={3}
        dash={[10, 5]}
      />
      <Line
        points={[
          p2.x,
          p2.y,
          p2.x + offsetX - (isVertical ? dragPosition : 0),
          p2.y + offsetY - (isVertical ? 0 : dragPosition),
        ]}
        stroke={color}
        strokeWidth={3}
        dash={[10, 5]}
      />
      <Text
        x={labelX}
        y={labelY}
        text={`${label} mm`}
        fontSize={fontSize}
        stroke="black"
        strokeWidth={textStrokeWidth}
        fill={color}
        align="center"
        rotation={rotation}
        onDblClick={onInputClick}
        
        listening
      />
      {isInputActive && (
        <Html groupProps={{ x: labelX, y: labelY }}>
          <div className="flex flex-col items-center justify-center">
            <input
              type="number"
              value={label}
              onChange={(e) => onInputChange?.(e.target.value)}
              onBlur={onInputBlur}
              step={25}
              className="w-[550px] h-[100px] border border-gray-300 rounded-md p-2 text-[90px] text-center bg-white/80"
            />
            {showMoveButton && (
              <button
                onClick={onMoveToNewGroup}
                className="mt-2 w-full h-[75px] text-[40px] cursor-pointer text-lg bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Move to New Group
              </button>
            )}
          </div>
        </Html>
      )}
    </Group>
  );
};

export default Dimension;