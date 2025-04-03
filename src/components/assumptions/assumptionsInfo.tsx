export const plotAssumptions = (
  <div className="w-[200px] p-3  ">
    <div className="text-sm text-gray-700 mb-1">
      - The plot is assumed to be <strong>rectangular</strong> in shape.
    </div>
    <div className="text-sm text-gray-700 mb-1">
      - It is <strong>aligned from the center</strong>, meaning all elements are
      plotted with respect to the center of the plot.
    </div>
  </div>
);
export const shadeAssumptions = (
  <div className="w-[200px]  p-3">
    <div className="text-sm text-gray-700 mb-1">
      - The shade is imported from a <strong>DXF file </strong>as a single
      rectangle.
    </div>
    <div className="text-sm text-gray-700">
      - It is <strong>aligned from the center</strong> to ensure proper
      positioning in the scene.
    </div>
  </div>
);

export const baseplateAssumptions = (
  <div className="w-[200px]  p-3">
    <div className="text-sm text-gray-700 mb-1">
      - Each corner always have a baseplate and it is placed at
      <strong>ideal distances</strong>.
    </div>
    <div className="text-sm text-gray-700">
      - The baseplates are rectangular, and the inner shade's center always
      aligns with a baseplate.
    </div>
  </div>
);

export const columnAssumptions = (
  <div className="w-[200px]  p-3">
    <div className="text-sm text-gray-700 mb-1">
      - The column is designed to fully{" "}
      <strong>cover the baseplate and the mullion column</strong>.
    </div>
    <div className="text-sm text-gray-700">
      - Its placement ensures seamless integration and structural support around
      these elements.
    </div>
  </div>
);

export const foundationAssumptions = (
  <div className="w-[200px]  p-3">
    <div className="text-sm text-gray-700 mb-1">
      - The foundation is derived from the center of the column.
    </div>
    <div className="text-sm text-gray-700 mb-1">
      - It always covers both the baseplate and the surrounding mullion column.
    </div>
    <div className="text-sm text-gray-700">
      - Its dimensions are based on RCC parameters: <strong>RccBf</strong> and{" "}
      <strong>rccLf</strong>.
    </div>
  </div>
);

export const mullionColumnAssumptions = (
  <div className="w-[200px]  p-3">
    <div className="text-sm text-gray-700 mb-1">
      The mullion column dimensions are determined based on the thickness of the
      wall. Adjust the wall thickness to modify the mullion size accordingly.
    </div>
  </div>
);

export const groundBeamAssumptions = (
  <div className="w-[200px]  p-3">
    <div className="text-sm text-gray-700 mb-1">
      The ground beam follows the same structure and dimensions as the shade.
    </div>
  </div>
);
