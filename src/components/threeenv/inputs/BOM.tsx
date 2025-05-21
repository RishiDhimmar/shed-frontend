import React, { useState } from "react";
import columnStore from "../../../stores/ColumnStore";
import configStore from "../../../stores/ConfigStore";
import foundationStore from "../../../stores/FoundationStore";
import { toJS } from "mobx";

function BOM() {
  // Get column height from configStore
  const columnHeight = configStore.shed3D.heights.COLUMNS;

  // State for columns
  const [visibleColumns, setVisibleColumns] = useState({});
  const [showAllColumns, setShowAllColumns] = useState(true);

  // State for foundations
  const [visibleFoundations, setVisibleFoundations] = useState({});
  const [showAllFoundations, setShowAllFoundations] = useState(true);

  // Toggle visibility for wire details
  const toggleWireVisibility = (columnId) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  // Toggle visibility for all columns
  const toggleAllColumns = () => {
    setShowAllColumns((prev) => !prev);
  };

  // Toggle visibility for rod details
  const toggleRodVisibility = (foundationId) => {
    setVisibleFoundations((prev) => ({
      ...prev,
      [foundationId]: !prev[foundationId],
    }));
  };

  // Toggle visibility for all foundations
  const toggleAllFoundations = () => {
    setShowAllFoundations((prev) => !prev);
  };

  // Group wires by column and calculate totals
  const columnData = columnStore.polygons.flatMap((group) =>
    group.columns.map((column) => {
      const wires = toJS(column.wireData).map((wire, wireIndex) => {
        const radius = Number(wire.radius.toFixed(5)) || 0;
        return {
          wireId: wireIndex + 1,
          length: columnHeight,
          radius: radius / 1000, // Convert to millimeters
          volume: radius
            ? Math.PI * (radius / 1000) * (radius / 1000) * columnHeight
            : 0,
        };
      });
      const totalLength = wires.length * columnHeight;
      const totalVolume = wires.reduce((sum, wire) => sum + wire.volume, 0);
      return {
        columnId: column.label || `Column ${columnData.length + 1}`,
        wires,
        totalLength,
        totalVolume,
      };
    })
  );

  // Group rods by foundation and calculate totals
  const foundationData = foundationStore.foundations.map((foundation) => {
    const rods = toJS(foundation.rodData).map((rod, rodIndex) => {
      const radius =
        Number(
          (
            rod.circle1?.radius ||
            rod.circle2?.radius ||
            rod.radius ||
            0
          ).toFixed(5)
        ) || 16;
      const [x1, y1, x2, y2] = rod.line1 || [0, 0, 0, 0]; // Fallback if line1 is missing
      const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      return {
        rodId: rodIndex + 1,
        length: length / 1000 || 0, // Fallback to 0 if calculation fails
        radius: radius / 1000, // Convert to millimeters
        volume:
          radius && length
            ? Math.PI * (radius / 1000) * (radius / 1000) * (length/1000)
            : 0,
        orientation: rod.isHorizontal ? "Horizontal" : "Vertical",
      };
    });
    const totalLength = rods.reduce((sum, rod) => sum + rod.length, 0) ;
    const totalVolume = rods.reduce((sum, rod) => sum + rod.volume, 0);
    return {
      foundationId:
        foundation.label || `Foundation ${foundationData.length + 1}`,
      rods,
      totalLength,
      totalVolume,
    };
  });

  // Calculate running totals
  const runningTotalLengthColumns = columnData.reduce(
    (sum, column) => sum + column.totalLength,
    0
  );
  const runningTotalVolumeColumns = columnData.reduce(
    (sum, column) => sum + column.totalVolume,
    0
  );
  const runningTotalLengthFoundations = foundationData.reduce(
    (sum, foundation) => sum + foundation.totalLength,
    0
  );
  const runningTotalVolumeFoundations = foundationData.reduce(
    (sum, foundation) => sum + foundation.totalVolume,
    0
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Bill of Materials (BOM)
        </h2>
        <p className="text-gray-600 mb-4">
          Column Height:{" "}
          <span className="font-medium">{columnHeight.toFixed(5)} meters</span>
        </p>

        {/* Columns Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Columns</h3>
          <button
            onClick={toggleAllColumns}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
            aria-label={
              showAllColumns ? "Hide all columns" : "Show all columns"
            }
          >
            {showAllColumns ? "Hide All Columns" : "Show All Columns"}
          </button>
        </div>
        <div className="overflow-x-auto mb-8">
          <table
            className="w-full border-collapse"
            role="grid"
            aria-label="Columns Bill of Materials Table"
          >
            <thead>
              <tr className="bg-blue-100 text-blue-800">
                <th className="py-3 px-4 text-left font-semibold border-b border-blue-200 w-32">
                  Column ID
                </th>
                <th className="py-3 px-4 text-left font-semibold border-b border-blue-200 w-32">
                  Total Length (meters)
                </th>
                <th className="py-3 px-4 text-left font-semibold border-b border-blue-200 w-32">
                  Total Volume (cubic meters)
                </th>
                <th className="py-3 px-4 text-left font-semibold border-b border-blue-200">
                  Wires
                </th>
              </tr>
            </thead>
            <tbody>
              {showAllColumns &&
                columnData.map((column) => (
                  <tr
                    key={column.columnId}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="py-4 px-4 border-b border-gray-200 font-medium text-gray-700 align-top">
                      {column.columnId}
                    </td>
                    <td className="py-4 px-4 border-b border-gray-200 text-gray-600 align-top">
                      {column.totalLength.toFixed(5)}
                    </td>
                    <td className="py-4 px-4 border-b border-gray-200 text-gray-600 align-top">
                      {column.totalVolume.toFixed(5)}
                    </td>
                    <td className="py-4 px-4 border-b border-gray-200">
                      <button
                        onClick={() => toggleWireVisibility(column.columnId)}
                        className="mb-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
                        aria-expanded={!!visibleColumns[column.columnId]}
                        aria-controls={`wire-table-${column.columnId}`}
                      >
                        {visibleColumns[column.columnId]
                          ? "Hide Wires"
                          : "Show Wires"}
                      </button>
                      {visibleColumns[column.columnId] && (
                        <table
                          id={`wire-table-${column.columnId}`}
                          className="w-full border-collapse"
                        >
                          <thead>
                            <tr className="bg-gray-100 text-gray-700">
                              <th className="py-2 px-3 text-left text-sm font-semibold border-b border-gray-200">
                                Wire ID
                              </th>
                              <th className="py-2 px-3 text-left text-sm font-semibold border-b border-gray-200">
                                Length (meters)
                              </th>
                              <th className="py-2 px-3 text-left text-sm font-semibold border-b border-gray-200">
                                Radius (meters)
                              </th>
                              <th className="py-2 px-3 text-left text-sm font-semibold border-b border-gray-200">
                                Volume (cubic meters)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {column.wires.map((wire) => (
                              <tr
                                key={wire.wireId}
                                className="hover:bg-blue-50 transition-colors duration-200"
                              >
                                <td className="py-2 px-3 text-sm text-gray-600 border-b border-gray-200">
                                  {wire.wireId}
                                </td>
                                <td className="py-2 px-3 text-sm text-gray-600 border-b border-gray-200">
                                  {wire.length.toFixed(5)}
                                </td>
                                <td className="py-2 px-3 text-sm text-gray-600 border-b border-gray-200">
                                  {wire.radius.toFixed(5)}
                                </td>
                                <td className="py-2 px-3 text-sm text-gray-600 border-b border-gray-200">
                                  {wire.volume.toFixed(5)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                ))}
              <tr className="bg-blue-200 text-blue-900 font-semibold">
                <td className="py-3 px-4 border-t border-blue-300">Total</td>
                <td className="py-3 px-4 border-t border-blue-300">
                  {runningTotalLengthColumns.toFixed(5)}
                </td>
                <td className="py-3 px-4 border-t border-blue-300">
                  {runningTotalVolumeColumns.toFixed(5)}
                </td>
                <td className="py-3 px-4 border-t border-blue-300"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Foundations Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Foundations
          </h3>
          <button
            onClick={toggleAllFoundations}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
            aria-label={
              showAllFoundations
                ? "Hide all foundations"
                : "Show all foundations"
            }
          >
            {showAllFoundations
              ? "Hide All Foundations"
              : "Show All Foundations"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse"
            role="grid"
            aria-label="Foundations Bill of Materials Table"
          >
            <thead>
              <tr className="bg-blue-100 text-blue-800">
                <th className="py-3 px-4 text-left font-semibold border-b border-blue-200 w-32">
                  Foundation ID
                </th>
                <th className="py-3 px-4 text-left font-semibold border-b border-blue-200 w-32">
                  Total Length (meters)
                </th>
                <th className="py-3 px-4 text-left font-semibold border-b border-blue-200 w-32">
                  Total Volume (cubic meters)
                </th>
                <th className="py-3 px-4 text-left font-semibold border-b border-blue-200">
                  Rods
                </th>
              </tr>
            </thead>
            <tbody>
              {showAllFoundations &&
                foundationData.map((foundation) => (
                  <tr
                    key={foundation.foundationId}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="py-4 px-4 border-b border-gray-200 font-medium text-gray-700 align-top">
                      {foundation.foundationId}
                    </td>
                    <td className="py-4 px-4 border-b border-gray-200 text-gray-600 align-top">
                      {foundation.totalLength.toFixed(5)}
                    </td>
                    <td className="py-4 px-4 border-b border-gray-200 text-gray-600 align-top">
                      {foundation.totalVolume.toFixed(5)}
                    </td>
                    <td className="py-4 px-4 border-b border-gray-200">
                      <button
                        onClick={() =>
                          toggleRodVisibility(foundation.foundationId)
                        }
                        className="mb-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
                        aria-expanded={
                          !!visibleFoundations[foundation.foundationId]
                        }
                        aria-controls={`rod-table-${foundation.foundationId}`}
                      >
                        {visibleFoundations[foundation.foundationId]
                          ? "Hide Rods"
                          : "Show Rods"}
                      </button>
                      {visibleFoundations[foundation.foundationId] && (
                        <table
                          id={`rod-table-${foundation.foundationId}`}
                          className="w-full border-collapse"
                        >
                          <thead>
                            <tr className="bg-gray-100 text-gray-700">
                              <th className="py-2 px-3 text-left text-sm font-semibold border-b border-gray-200">
                                Rod ID
                              </th>
                              <th className="py-2 px-3 text-left text-sm font-semibold border-b border-gray-200">
                                Length (meters)
                              </th>
                              <th className="py-2 px-3 text-left text-sm font-semibold border-b border-gray-200">
                                Radius (meters)
                              </th>
                              <th className="py-2 px-3 text-left text-sm font-semibold border-b border-gray-200">
                                Volume (cubic meters)
                              </th>
                              <th className="py-2 px-3 text-left text-sm font-semibold border-b border-gray-200">
                              Orientation
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {foundation.rods.map((rod) => (
                              <tr
                                key={rod.rodId}
                                className="hover:bg-gray-50 transition-colors duration-200"
                              >
                                <td className="py-2 px-3 text-sm text-gray-600 border-b border-gray-200">
                                  {rod.rodId}
                                </td>
                                <td className="py-2 px-3 text-sm text-gray-600 border-b border-gray-200">
                                  {rod.length.toFixed(5)}
                                </td>
                                <td className="py-2 px-3 text-sm text-gray-600 border-b border-gray-200">
                                  {rod.radius.toFixed(5)}
                                </td>
                                <td className="py-2 px-3 text-sm text-gray-600 border-b border-gray-200">
                                  {rod.volume.toFixed(5)}
                                </td>
                                <td className="py-2 px-3 text-sm text-gray-600 border-b border-gray-200">
                                  {rod.orientation}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                ))}
              <tr className="bg-blue-200 text-blue-900 font-semibold">
                <td className="py-3 px-4 border-t border-blue-300">Total</td>
                <td className="py-3 px-4 border-t border-blue-300">
                  {runningTotalLengthFoundations.toFixed(5)}
                </td>
                <td className="py-3 px-4 border-t border-blue-300">
                  {runningTotalVolumeFoundations.toFixed(5)}
                </td>
                <td className="py-3 px-4 border-t border-blue-300"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BOM;
