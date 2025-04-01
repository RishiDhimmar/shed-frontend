// import React from "react";

// interface InputNumberProps {
//   label: string;
//   value: number;
//   onChange: (value: number) => void;
// }

// const InputNumber: React.FC<InputNumberProps> = ({
//   label,
//   value,
//   onChange,
// }) => {
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value;

//     if (newValue === "") {
//       onChange(0);
//     } else {
//       const numValue =
//         Math.max(0, Number(newValue)) === 0
//           ? 0.01
//           : parseFloat(Number(newValue).toFixed(2));
//       onChange(numValue);
//     }
//   };

//   return (
//     <div className="mb-4 flex flex-col">
//       <label className="font-poppins text-gray-500">{label}</label>
//       <input
//         type="number"
//         value={value === 0 ? "" : value.toFixed(2)}
//         step={0.1}
//         onChange={handleChange}
//         className="w-full p-3 py-1 border font-poppins border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1"
//         min={0}
//       />
//     </div>
//   );
// };

// export default InputNumber;


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
    const inputValue = e.target.value;
    // Allow empty input for smoother typing
    if (inputValue === "") {
      onChange(0);
    } else {
      // Parse the input as an integer (since we want to show integers)
      const parsedValue = parseInt(inputValue, 10);
      if (!isNaN(parsedValue)) {
        // Divide by 1000 before setting the value
        onChange(parsedValue / 1000);
      }
    }
  };

  // Multiply the stored value by 1000 for display.
  // If value is 0, show empty string.
  const displayValue = value === 0 ? "" : (value * 1000).toString();

  return (
    <div className="mb-4 flex flex-col">
      <label className="font-poppins text-gray-500">{label}</label>
      <input
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
