import React from "react";
import { items } from "../../../utils/sheetItems";
import { toJS } from "mobx";
import columnStore from "../../../stores/ColumnStore";

const ExcelPreview = () => {
  // Sort items by itemNo to match Excel export order
  const sortedItems = Object.entries(items).sort(
    ([, a], [, b]) => a.itemNo - b.itemNo
  );

  return (
    <div className="p-4 max-w-1xl mx-5 ">
      {sortedItems.map(([key, item]) => (
        <div
          key={key}
          className="mb-8 border rounded-lg shadow-md p-4 bg-white"
        >
          {/* Header Section */}
          <div className="text-center font-bold text-lg mb-2">CPWA-1</div>
          <div className="text-right font-bold mb-2">
            Page No :-{" "}
            {item.itemNo <= 3 ? "02" : item.itemNo <= 6 ? "04" : "05"}
          </div>
          <div className="text-left font-bold mb-4">{item.date}</div>

          {/* Table */}
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th
                  className="border border-gray-300 p-2 w-2/5 font-bold text-center"
                  rowSpan="2"
                >
                  Particulars
                </th>
                <th
                  className="border border-gray-300 p-2 font-bold text-center"
                  colSpan="4"
                >
                  Details of Actual Measurement
                </th>
                <th
                  className="border border-gray-300 p-2 w-1/6 font-bold text-center"
                  rowSpan="2"
                >
                  Content/Area
                </th>
                <th
                  className="border border-gray-300 p-2 w-1/6 font-bold text-center"
                  rowSpan="2"
                >
                  Unit
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 font-bold text-center">
                  No.
                </th>
                <th className="border border-gray-300 p-2 font-bold text-center">
                  Length
                </th>
                <th className="border border-gray-300 p-2 font-bold text-center">
                  Breadth
                </th>
                <th className="border border-gray-300 p-2 font-bold text-center">
                  Depth
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  className="border border-gray-300 p-2 font-bold"
                  colSpan="6"
                >
                  Item No :- {item.itemNo},
                </td>
                <td className="border border-gray-300 p-2 font-bold text-center">
                  {item.unit}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-bold">
                  {item.particulars}
                </td>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2"></td>
              </tr>
              {item.measurements.map((m, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">
                    {m.description || ""}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {m.nos || ""}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {m.length || ""}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {m.breadth || ""}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {m.depth || ""}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {m.area || ""}
                  </td>
                  <td className="border border-gray-300 p-2 text-center"></td>
                </tr>
              ))}
              <tr>
                <td className="border border-gray-300 p-2" colSpan="3"></td>
                <td
                  className="border border-gray-300 p-2 font-bold text-center"
                  colSpan="2"
                >
                  Total
                </td>
                <td className="border border-gray-300 p-2 font-bold text-right">
                  {item.total}
                </td>
                <td className="border border-gray-300 p-2 font-bold text-center">
                  {item.unit}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signature Section */}
          <div className="mt-4 text-left">
            <div>Measurement Recorded by Contractor</div>
            <div>or Authorised Representative with dated sign</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExcelPreview;
