import React from "react";

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue === "") {
      onChange(0);
    } else {
      const numValue =
        Math.max(0, Number(newValue)) === 0 ? 0.01 : Number(newValue);
      onChange(numValue);
    }
  };

  return (
    <div className="mb-4 flex flex-col">
      <label className="font-poppins text-gray-500">{label}</label>
      <input
        type="number"
        value={value === 0 ? "" : value}
        step={0.1}
        onChange={handleChange}
        className="w-full p-3 py-1 border font-poppins border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1"
        min={0}
      />
    </div>
  );
};

export default InputNumber;
