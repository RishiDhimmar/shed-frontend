import React, { useEffect, useRef } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";

interface InputNumberProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  infoText?: string; // Optional prop for info tooltip text
}

const InputNumber: React.FC<InputNumberProps> = ({
  label,
  value,
  onChange,
  infoText = "This is some helpful information.",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      onChange(0);
    } else {
      const parsedValue = parseInt(inputValue, 10);
      if (!isNaN(parsedValue)) {
        onChange(parsedValue / 1000);
      }
    }
  };

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleWheel = (e: WheelEvent) => {
      if (document.activeElement === input) {
        e.preventDefault();
        e.stopPropagation();

        const step = parseInt(input.step || "100", 10);
        const delta = e.deltaY < 0 ? step : -step;
        const current = parseInt(input.value || "0", 10);
        const newValue = Math.max(0, current + delta);

        onChange(newValue / 1000);
      }
    };

    input.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      input.removeEventListener("wheel", handleWheel);
    };
  }, [onChange]);

  const displayValue =
    value === 0 ? "" : (value * 1000).toString().split(".")[0];

  return (
    <div className="mb-4 flex flex-col relative">
      <div className="flex justify-between items-center">
        <label className="font-poppins text-xs text-gray-500">{label}</label>
        <div className="relative group flex items-center">
          <IoMdInformationCircleOutline className="w-4 h-4 cursor-pointer" />
          <div className="absolute top-full left-0 mt-1 w-15 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {infoText}
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="number"
        value={displayValue}
        step={100}
        onChange={handleChange}
        className="w-full p-3 py-1 border font-poppins border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1"
        min={0}
      />
    </div>
  );
};

export default InputNumber;
