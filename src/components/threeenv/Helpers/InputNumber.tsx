// import React, { useEffect, useRef } from "react";
// import { IoMdInformationCircleOutline } from "react-icons/io";
// import { Tooltip } from "react-tooltip";
// interface InputNumberProps {
//   label: string;
//   value: number;
//   onChange: (value: number) => void;
//   infoText?: string;
// }

// const InputNumber: React.FC<InputNumberProps> = ({
//   label,
//   value,
//   onChange,
//   infoText = "This is some helpful information.",
// }) => {
//   const inputRef = useRef<HTMLInputElement>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const inputValue = e.target.value;
//     if (inputValue === "") {
//       onChange(0);
//     } else {
//       const parsedValue = parseInt(inputValue, 10);
//       if (!isNaN(parsedValue)) {
//         onChange(parsedValue / 1000);
//       }
//     }
//   };

//   useEffect(() => {
//     const input = inputRef.current;
//     if (!input) return;

//     const handleWheel = (e: WheelEvent) => {
//       if (document.activeElement === input) {
//         e.preventDefault();
//         e.stopPropagation();

//         const step = parseInt(input.step || "100", 10);
//         const delta = e.deltaY < 0 ? step : -step;
//         const current = parseInt(input.value || "0", 10);
//         const newValue = Math.max(0, current + delta);

//         onChange(newValue / 1000);
//       }
//     };

//     input.addEventListener("wheel", handleWheel, { passive: false });

//     return () => {
//       input.removeEventListener("wheel", handleWheel);
//     };
//   }, [onChange]);

//   const displayValue =
//     value === 0 ? "" : (value * 1000).toString().split(".")[0];

//   return (
//     <div className="mb-4 flex flex-col relative">
//       <div className="flex justify-between items-center">
//         <label className="font-poppins text-xs text-gray-500">{label}</label>
//         <div>
//           <IoMdInformationCircleOutline
//             className="w-4 h-4 text-gray-500 cursor-pointer"
//             data-tooltip-id="info-tooltip"
//             data-tooltip-content={infoText}
//             data-tooltip-place="top"
//           />
//           <Tooltip
//             id="info-tooltip"
//             className="!text-sm !font-poppins !w-32 !p-1  !bg-gray-600"
//           />
//         </div>
//       </div>

//       <input
//         ref={inputRef}
//         type="number"
//         value={displayValue}
//         step={100}
//         onChange={handleChange}
//         className="w-full p-3 py-1  border font-poppins border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1"
//         min={0}
//       />
//     </div>
//   );
// };

// export default InputNumber;
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
}

const InputNumber: React.FC<InputNumberProps> = observer(
  ({
    label,
    value,
    onChange,
    infoText = "This is some helpful information.",
  }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const numericValue = value * 1000;

    const numberStep = 100;
    let step = 1000;
    if (numericValue <= 1000) step = 100;
    if (numericValue <= 100) step = 50;
    if (numericValue <= 10) step = 10;

    const generateOptions = () => {
      const options = [];
      for (let i = -2; i <= 2; i++) {
        const option = numericValue + i * step;
        if (option > 0) options.push(option);
      }
      return options;
    };

    const handleOptionClick = (val: number) => {
      if (val >= 0) {
        onChange(val / 1000);
        setShowDropdown(false);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue === "") {
        onChange(0);
      }

      // Only allow non-negative numbers
      const parsedValue = parseInt(inputValue, 10);
      if (!isNaN(parsedValue)) {
        if (parsedValue >= 0) {
          onChange(parsedValue / 1000);
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
            <span>{numericValue}</span>
            <IoIosArrowDropdown className="text-gray-500" />
          </div>
        ) : (
          <input
            ref={inputRef}
            type="number"
            value={value === 0 ? "" : (value * 1000).toString().split(".")[0]}
            step={numberStep}
            onChange={handleChange}
            className="w-full p-3 py-1 border font-poppins border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1"
            min={0}
          />
        )}

        {showDropdown && uiStore.useStandardInputs && (
          <div className="absolute w-full bg-white shadow-md border rounded mt-1 z-50 max-h-40 overflow-y-auto">
            {generateOptions().map((option) => (
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
  }
);

export default InputNumber;
