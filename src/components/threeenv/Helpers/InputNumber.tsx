import React, { useEffect, useRef } from "react";

interface InputNumberProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const InputNumber: React.FC<InputNumberProps> = ({
  label,
  value,
  onChange,
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
      // Only prevent when input is focused
      if (document.activeElement === input) {
        e.preventDefault();

        const step = parseInt(input.step || "100", 10);
        const delta = e.deltaY < 0 ? step : -step;
        const newValue = Math.max(0, parseInt(input.value || "0", 10) + delta);

        // Trigger change
        input.value = newValue.toString();
        const event = new Event("input", { bubbles: true });
        input.dispatchEvent(event);
      }
    };

    input.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      input.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const displayValue = value === 0 ? "" : (value * 1000).toString();

  return (
    <div
      className="mb-4 flex flex-col"
      style={{ overscrollBehavior: "contain" }} // Prevents scroll from reaching the sidebar
    >
      <label className="font-poppins text-gray-500">{label}</label>
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
