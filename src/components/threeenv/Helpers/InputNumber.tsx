import React, { useEffect, useRef } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Tooltip } from "react-tooltip";
interface InputNumberProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  infoText?: string;
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
        <div>
          <IoMdInformationCircleOutline
            className="w-4 h-4 text-gray-500 cursor-pointer"
            data-tooltip-id="info-tooltip"
            data-tooltip-content={infoText}
            data-tooltip-place="top"
          />
          <Tooltip
            id="info-tooltip"
            className="!text-sm !font-poppins !w-32 !p-1  !bg-gray-600"
          />
        </div>
      </div>

      <input
        ref={inputRef}
        type="number"
        value={displayValue}
        step={100}
        onChange={handleChange}
        className="w-full p-3 py-1  border font-poppins border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1"
        min={0}
      />
    </div>
  );
};

export default InputNumber;
