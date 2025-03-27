function InputNumber({ label, value, onChange }: any) {
  return (
    <>
      <div className="mb-4 flex-col">
        <label>{label}</label>
        <input
          type="number"
          placeholder="Length of shade (in meters)"
          value={value }
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full p-3  border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </>
  );
}

export default InputNumber;
