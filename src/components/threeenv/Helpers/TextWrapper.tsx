import { Text } from "@react-three/drei";
import { JSX } from "react";

interface TextWrapperProps {
  text: string;
  position: number[]; // You may want to type this as well
  rotation: number; // You may want to type this as well
  color: any; // You may want to type this as well
  fontSize: number;
}

const TextWrapper = ({
  text,
  position,
  rotation,
  color,
  fontSize,
}: TextWrapperProps): JSX.Element => {
  // debugger
  return (
    <Text
      position={position as [number, number, number]}
      rotation={[0, 0, 0]}
      color={"black"}
      fontSize={fontSize}
    >
      {" "}
      {text}{" "}
    </Text>
  );
};

export default TextWrapper;
