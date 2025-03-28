function InputNumber({ label, value, onChange }: any) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (newValue === "") {
      console.log(newValue);

      onChange("");
    } else {
      console.log(newValue);

      const numValue =
        Math.max(0, Number(newValue)) === 0 ? 0.01 : Number(newValue);
      onChange(numValue);
    }
  };

  return (
    <div className="mb-4 flex-col">
      <label className="text-gray-500">{label}</label>
      <input
        type="number"
        value={value === 0 ? "" : value}
        step={0.1}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1"
        min={0}
      />
    </div>
  );
}

export default InputNumber;
