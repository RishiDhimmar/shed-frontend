import React from "react";
import {
  IoArrowUp,
  IoArrowDown,
  IoArrowForward,
  IoArrowBack,
} from "react-icons/io5";

const DirectionalArrows: React.FC = () => {
  return (
    <div
      className="directional-arrows"
      style={{ zIndex: 50, pointerEvents: "none" }}
    >
      {/* North Arrow (Top Center) */}
      <div
        style={{
          position: "absolute",
          bottom: "50px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "bold" }}>+Y</span>
        <IoArrowUp size={24} color="black" />
      </div>

      {/* South Arrow (Bottom Center) */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <IoArrowDown size={24} color="black" />
        <span style={{ fontSize: "14px", fontWeight: "bold" }}>-Y</span>
      </div>

      {/* East Arrow (Right Center) */}
      <div
        style={{
          position: "absolute",
          right: "33%",
          bottom: "29px",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <IoArrowForward size={24} color="black" />
        <span
          style={{ fontSize: "14px", fontWeight: "bold", marginLeft: "5px" }}
        >
          +X
        </span>
      </div>

      {/* West Arrow (Left Center) */}
      <div
        style={{
          position: "absolute",
          left: "33%",
          bottom: "29px",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontSize: "14px", fontWeight: "bold", marginRight: "5px" }}
        >
          -X
        </span>
        <IoArrowBack size={24} color="black" />
      </div>
    </div>
  );
};

export default DirectionalArrows;
