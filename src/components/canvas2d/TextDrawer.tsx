import React from "react";
import { Text } from "react-konva";
import uiStore from "../../stores/UIStore";
import { observer } from "mobx-react-lite";

const TextDrawer = observer(({ texts, scale = 1 }) => {
  // Helper function to convert DXF color (integer) to hex
  const getColor = (color) => {
    if (!color) return "#000000"; // Default to black
    // Convert DXF color (e.g., 16777215 for white) to hex
    const hex = `#${color.toString(16).padStart(6, "0")}`;
    return hex;
  };

  return (
    <>
      {uiStore.visibility.annotation &&
        texts.map((text) => (
          <>
            <Text
              key={text.handle || `${text.position.x}-${text.position.y}`} // Unique key
              text={text.text.replace("}", "\n").split(";")[1]} // Remove DXF alignment codes
              x={
                text.height
                  ? text.position.x - text.height / 2
                  : text.position.x
              } // Scale x position
              y={
                text.width ? text.position.y - text.height / 2 : text.position.y
              } // Scale y position
              fontSize={text.height} // Scale height to fontSize
              rotation={text.rotation || 0} // Default rotation to 0
              fill={"black"} // Convert DXF color to hex
            />
          </>
        ))}
    </>
  );
});

// Map attachmentPoint to horizontal alignment
function getAlign(attachmentPoint) {
  if ([1, 4, 7].includes(attachmentPoint)) return "left";
  if ([2, 5, 8].includes(attachmentPoint)) return "center";
  if ([3, 6, 9].includes(attachmentPoint)) return "right";
  return "left"; // Default
}

// Map attachmentPoint to vertical alignment
function getVerticalAlign(attachmentPoint) {
  if ([1, 2, 3].includes(attachmentPoint)) return "top";
  if ([4, 5, 6].includes(attachmentPoint)) return "middle";
  if ([7, 8, 9].includes(attachmentPoint)) return "bottom";
  return "top"; // Default
}

export default TextDrawer;
