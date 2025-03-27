function InputNumber({ label, value, onChange }: any) {
  return (
    <>
      <div className="mb-4 flex-col gap-4">
        <label className="block text-sm/6 font-medium text-gray-900">{label}</label>
        <input
          type="number"
          placeholder="Length of shade (in meters)"
          value={value}
          step={0.01}
          onChange={(e) => onChange(Number(e.target.value))}
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
        />
      </div>
    </>
  );
}

export default InputNumber;
