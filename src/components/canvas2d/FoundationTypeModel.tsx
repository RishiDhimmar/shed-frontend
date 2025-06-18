import { Html } from "react-konva-utils";
import { useState } from "react";

const FoundationTypeModal = ({
  isOpen,
  onClose,
  onSelect,
  groupName,
  foundationLabel,
  position,
}) => {
  const [selectedType, setSelectedType] = useState(null);
  const [pileDepth, setPileDepth] = useState("");

  if (!isOpen) return null;

  const foundationTypes = [
    "Frustum Foundation",
    "Flat Foundation",
    "Pile Foundation",
  ];

  const handleTypeClick = (type) => {
    setSelectedType(type);
    if (type !== "Pile Foundation") {
      setPileDepth(""); // Reset pileDepth for non-Pile types
      onSelect(type, groupName, foundationLabel, null);
      onClose();
    }
  };

  const handleConfirm = () => {
    if (selectedType === "Pile Foundation") {
      const parsedPileDepth = Number(pileDepth);
      if (isNaN(parsedPileDepth) || parsedPileDepth < 0) {
        alert("Please enter a valid non-negative number for pile depth.");
        return;
      }
      onSelect(selectedType, groupName, foundationLabel, parsedPileDepth);
    } else {
      onSelect(selectedType, groupName, foundationLabel, null);
    }
    onClose();
  };

  return (
    <Html
      groupProps={{ x: position.x, y: position.y }}
      divProps={{ style: { position: "absolute" } }}
    >
      <div
        style={{
          width: "1800px",
          height: selectedType === "Pile Foundation" ? "1400px" : "1100px", // Increase height for input
          backgroundColor: "white",
          border: "2px solid black",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
          position: "relative",
        }}
      >
        <p
          style={{
            position: "absolute",
            left: "20px",
            top: "20px",
            fontSize: "120px",
            fontWeight: "bold",
            color: "black",
            margin: 0,
          }}
        >
          Select Foundation Type
        </p>
        {foundationTypes.map((type, index) => (
          <div
            key={type}
            onClick={() => handleTypeClick(type)}
            onMouseEnter={(e) => {
              e.currentTarget.style.cursor = "pointer";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.cursor = "default";
            }}
            style={{
              position: "absolute",
              left: "20px",
              top: `${360 + index * 250}px`,
              width: "1750px",
              height: "190px",
              backgroundColor: selectedType === type ? "#d0d0d0" : "#f0f0f0", // Highlight selected
              border: "1px solid black",
              display: "flex",
              alignItems: "center",
              paddingLeft: "10px",
            }}
          >
            <span
              style={{
                fontSize: "160px",
                color: "black",
                fontFamily: "Poppins",
              }}
            >
              {type}
            </span>
          </div>
        ))}
        {selectedType === "Pile Foundation" && (
          <div
            style={{
              position: "absolute",
              left: "20px",
              top: "1060px", // Below the last type option
              width: "1750px",
              height: "190px",
              display: "flex",
              alignItems: "center",
              paddingLeft: "10px",
            }}
          >
            <label
              style={{
                fontSize: "120px",
                color: "black",
                fontFamily: "Poppins",
                marginRight: "20px",
              }}
            >
              No of Columns:
            </label>
            <input
              type="number"
              value={pileDepth}
              onChange={(e) => setPileDepth(e.target.value)}
              style={{
                width: "600px",
                height: "120px",
                fontSize: "100px",
                fontFamily: "Poppins",
                border: "1px solid black",
                padding: "10px",
              }}
              placeholder=""
              min="0"
              max="4"
            />
          </div>
        )}
        <div
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.cursor = "pointer";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.cursor = "default";
          }}
          style={{
            position: "absolute",
            left: "1680px",
            top: "-20px",
            width: "140px",
            height: "140px",
            backgroundColor: "red",
            border: "1px solid black",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "100px",
              color: "white",
              textAlign: "center",
              lineHeight: "140px",
            }}
          >
            X
          </span>
        </div>
        <div
          onClick={handleConfirm}
          onMouseEnter={(e) => {
            e.currentTarget.style.cursor = "pointer";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.cursor = "default";
          }}
          style={{
            position: "absolute",
            left: "20px",
            bottom: "20px",
            width: "400px",
            height: "140px",
            backgroundColor: "#4CAF50",
            border: "1px solid black",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "100px",
              color: "white",
              fontFamily: "Poppins",
              textAlign: "center",
              lineHeight: "140px",
            }}
          >
            Confirm
          </span>
        </div>
      </div>
    </Html>
  );
};

export default FoundationTypeModal;
