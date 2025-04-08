import { Line, Text } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import uiStore from "../../../stores/UIStore";

interface DimensionLineProps {
  startPoint: [number, number, number];
  endPoint: [number, number, number];
  length: number;
  lineColor?: string;
  textColor?: string;
  lineDirection: "+x" | "-x" | "+y" | "-y";
  lineOffset?: number;
  textDirection?: "+x" | "-x" | "+y" | "-y";
  textOffset?: number;
  textSize?: number;
}

const DimensionLine = observer(
  ({
    startPoint,
    endPoint,
    length,
    lineDirection,
    lineOffset = 0.5,
    textDirection,
    textOffset = 0.3,
    textSize = 0.3,
  }: DimensionLineProps) => {
    // Compute offset vector for the dimension line
    const getOffsetVector = (
      direction: "+x" | "-x" | "+y" | "-y" | undefined,
      offset: number
    ) => {
      if (!direction) return [0, 0, 0];
      if (direction === "+x") return [offset, 0, 0];
      if (direction === "-x") return [-offset, 0, 0];
      if (direction === "+y") return [0, offset, 0];
      if (direction === "-y") return [0, -offset, 0];
      return [0, 0, 0];
    };

    // Apply offsets to get the final positions
    const lineOffsetVector = getOffsetVector(lineDirection, lineOffset);
    const textOffsetVector = getOffsetVector(textDirection, textOffset);

    // Compute offset positions
    const startOffset: [number, number, number] = [
      startPoint[0] + lineOffsetVector[0],
      startPoint[1] + lineOffsetVector[1],
      0,
    ];

    const endOffset: [number, number, number] = [
      endPoint[0] + lineOffsetVector[0],
      endPoint[1] + lineOffsetVector[1],
      0,
    ];

    // Compute text position
    const textPosition: [number, number, number] = [
      (startOffset[0] + endOffset[0]) / 2 + textOffsetVector[0],
      (startOffset[1] + endOffset[1]) / 2 + textOffsetVector[1],
      0,
    ];

    // Determine rotation: vertical lines need 90deg (PI/2 rad)
    const isVertical = lineDirection === "+y" || lineDirection === "-y";
    const textRotation: [number, number, number] = isVertical
      ? [0, 0, 0]
      : [0, 0, Math.PI / 2];

    return (
      <>
        {uiStore.isDimensionsVisible && (
          <>
            <Line
              points={[startOffset, endOffset]}
              color={"black"}
              lineWidth={1.5}
            />

            {/* Display the length label at variable offset */}
            <Text
              position={textPosition}
              color={"black"}
              fontSize={textSize}
              rotation={textRotation}
            >
              {(length * 1000).toFixed().split(".")[0]}
            </Text>
          </>
        )}
      </>
    );
  }
);

export default DimensionLine;
