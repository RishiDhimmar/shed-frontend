import React, { useState, useRef, useEffect } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoIosArrowDropdown } from "react-icons/io";
import { Tooltip } from "react-tooltip";
import uiStore from "../../../stores/UIStore";
import { observer } from "mobx-react-lite";

interface InputNumberProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  infoText?: string;
  standardType?: "shed" | "baseplate";
  dimensionField?:
    | "length"
    | "width"
    | "thickness"
    | "horizontalDistance"
    | "verticalDistance";
  disabled?: boolean;
}

const InputNumber: React.FC<InputNumberProps> = observer(
  ({
    label,
    value,
    onChange,
    infoText = "This is some helpful information.",
    standardType,
    dimensionField,
    disabled,
    step = 50,
  }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const numericValue = value * 1000;

    // Get options from standards based on type and field
    const getStandardOptions = () => {
      if (!standardType || !dimensionField) return [];

      const relevantStandards = uiStore.getStandardsByType(standardType);
      if (!relevantStandards || relevantStandards.length === 0) return [];

      let options: number[] = [];

      if (standardType === "shed") {
        // Handle shed dimensions
        relevantStandards.forEach((standard) => {
          const dimensions = standard.dimensions as any;
          if (!dimensions) return;

          if (dimensionField === "length" && dimensions.lengthOptions) {
            options = [...options, ...dimensions.lengthOptions];
          } else if (dimensionField === "width" && dimensions.widthOptions) {
            options = [...options, ...dimensions.widthOptions];
          } else if (
            dimensionField === "thickness" &&
            dimensions.thicknessOptions
          ) {
            options = [...options, ...dimensions.thicknessOptions];
          }
        });
      } else if (standardType === "baseplate") {
        // Handle baseplate dimensions
        relevantStandards.forEach((standard) => {
          const dimensions = standard.dimensions as any;
          if (!dimensions) return;

          if (
            dimensionField === "horizontalDistance" &&
            dimensions.idealHorizontalDistance
          ) {
            options.push(dimensions.idealHorizontalDistance * 1000); // Convert to match numericValue
          } else if (
            dimensionField === "verticalDistance" &&
            dimensions.idealVerticalDistance
          ) {
            options.push(dimensions.idealVerticalDistance * 1000); // Convert to match numericValue
          }
        });
      }

      // Remove duplicates and sort
      return [...new Set(options)].sort((a, b) => a - b);
    };

    function generateDynamicOptions() {
      let step = 1000;
      if (numericValue <= 1000) step = 100;
      if (numericValue <= 100) step = 50;
      if (numericValue <= 10) step = 10;

      const options = [];
      for (let i = -2; i <= 2; i++) {
        const option = numericValue + i * step;
        if (option > 0) options.push(option);
      }
      return options;
    }

    // First try to get standard options
    const standardOptions = getStandardOptions();

    // Decide which options to use based on availability of standards
    const options = uiStore.useStandardInputs
      ? standardOptions.length > 0
        ? standardOptions
        : generateDynamicOptions()
      : generateDynamicOptions();

    const handleOptionClick = (val: number) => {
      if (val >= 0) {
        onChange(val / 1000); // Convert back to meters
        setShowDropdown(false);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue === "") {
        onChange(0);
        return;
      }

      // Only allow non-negative numbers
      const parsedValue = parseInt(inputValue, 10);
      if (!isNaN(parsedValue)) {
        if (parsedValue >= 0) {
          onChange(parsedValue / 1); // Convert to meters
        } else {
          // Force reset to 0 if user types negative
          onChange(0);
        }
      }
    };

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setShowDropdown(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;
      const handleWheel = (e: WheelEvent) => {
        if (document.activeElement === input) return;

        e.preventDefault();
        e.stopPropagation();
      };

      input.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        input.removeEventListener("wheel", handleWheel);
      };
    }, []);

    // Add a small flag to indicate whether we're showing standard or dynamic values

    return (
      <div className="mb-4 relative font-poppins" ref={containerRef}>
        <div className="flex gap-5 justify-between items-center">
          <label className="text-xs text-gray-500">{label}</label>
          <IoMdInformationCircleOutline
            className="w-4 h-4 text-gray-500 cursor-pointer"
            data-tooltip-id="info-tooltip"
            data-tooltip-content={infoText}
            data-tooltip-place="top"
          />
          <Tooltip
            id="info-tooltip"
            className="!text-sm !w-32 !p-1 !bg-gray-600"
          />
        </div>

        {uiStore.useStandardInputs ? (
          <div
            className="border border-gray-300 px-3 py-1 mt-1 rounded-md flex justify-between items-center cursor-pointer"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <span>{Math.round(numericValue)}</span>
            <IoIosArrowDropdown className="text-gray-500" />
          </div>
        ) : (
          <input
            ref={inputRef}
            type="number"
            value={value === 0 ? "" : (value * 1).toString().split(".")[0]}
            step={step}
            onChange={handleChange}
            className={`w-full p-3 py-1 border font-poppins border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1 ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            min={0}
            disabled={disabled}
          />
        )}

        {showDropdown && uiStore.useStandardInputs && (
          <div className="absolute w-full bg-white shadow-md border rounded mt-1 z-50 max-h-40 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option}
                onClick={() => handleOptionClick(option)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {option.toString().split(".")[0]}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

export default InputNumber;
