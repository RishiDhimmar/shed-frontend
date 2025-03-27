import baseplateStore from "../../../stores/BasePlateStore";

export const BaseplateInput = () => {
  return (
    <div className="flex flex-col gap-4">
      <label>
        Baseplate Type:
        <select
          value={baseplateStore.type}
          onChange={(e) => baseplateStore.setType(e.target.value)}
          className="ml-2 p-1 border"
        >
          <option value="corner">Corner</option>
          <option value="horizontal">Horizontally Placed</option>
          <option value="vertical">Vertically Placed</option>
        </select>
      </label>
      <label>
        Length:
        <input
          type="number"
          value={baseplateStore.length}
          onChange={(e) => baseplateStore.setLength(e.target.value)}
          className="ml-2 p-1 border"
        />
      </label>
      <label>
        Width:
        <input
          type="number"
          value={baseplateStore.width}
          onChange={(e) => baseplateStore.setWidth(e.target.value)}
          className="ml-2 p-1 border"
        />
      </label>
      <label>
        Offset X:
        <input
          type="number"
          value={baseplateStore.offsetX}
          onChange={(e) => baseplateStore.setOffsetX(e.target.value)}
          className="ml-2 p-1 border"
        />
      </label>
      <label>
        Offset Y:
        <input
          type="number"
          value={baseplateStore.offsetY}
          onChange={(e) => baseplateStore.setOffsetY(e.target.value)}
          className="ml-2 p-1 border"
        />
      </label>
      <label>
        Ideal Distance:
        <input
          type="number"
          value={baseplateStore.idealDistance}
          onChange={(e) => baseplateStore.setIdealDistance(e.target.value)}
          className="ml-2 p-1 border"
        />
      </label>
    </div>
  );
};
