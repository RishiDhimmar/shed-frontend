function InputNumber({ label, value, onChange }: any) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (newValue === "") {
      onChange("");
    } else {
      const numValue = Math.max(0, Number(newValue));
      onChange(numValue);
    }
  };

  return (
    <div className="mb-4 flex-col">
      <label className="text-gray-500">{label}</label>
      <input
        type="number"
        value={value === 0 ? "" : value} // Remove default 0 display
        step={0.1}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1"
        min={0} // Enforces non-negative numbers
      />
    </div>
  );
}

export default InputNumber;
