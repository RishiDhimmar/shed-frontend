import React, { useRef } from "react";

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

  const displayValue = value === 0 ? "" : (value * 1000).toString();

  return (
    <div className="mb-4 flex flex-col">
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
