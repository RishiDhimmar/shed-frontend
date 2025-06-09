import ExcelJS from "exceljs";
import { items } from "./sheetItems";
import { handleExcelQuantityCalculation } from "./handleExcelQuantityCalculation";

export const exportXLSX = async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");

  handleExcelQuantityCalculation();

  // Set column widths
  sheet.getColumn(1).width = 40; // Particulars
  sheet.getColumn(2).width = 10; // Nos
  sheet.getColumn(3).width = 10; // Length
  sheet.getColumn(4).width = 10; // Breadth
  sheet.getColumn(5).width = 10; // Depth
  sheet.getColumn(6).width = 15; // Content/Area
  sheet.getColumn(7).width = 10; // Unit

  let rowIndex = 1;

  // Helper function to add item section
  const addItemSection = (
    itemNo,
    date,
    particulars,
    measurements,
    total,
    unit
  ) => {
    // Header
    sheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
    const headerCell = sheet.getCell(`A${rowIndex}`);
    headerCell.value = "CPWA-1";
    headerCell.font = { bold: true, size: 10 };
    headerCell.alignment = { horizontal: "center" };
    rowIndex++;

    sheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
    const pageCell = sheet.getCell(`A${rowIndex}`);
    pageCell.value = `Page No :- ${
      itemNo <= 3 ? "02" : itemNo <= 6 ? "04" : "05"
    }`;
    pageCell.font = { bold: true };
    pageCell.alignment = { horizontal: "right" };
    rowIndex++;

    const dateCell = sheet.getCell(`A${rowIndex}`);
    dateCell.value = date;
    dateCell.font = { bold: true };
    dateCell.alignment = { horizontal: "left" };
    rowIndex++;

    sheet.mergeCells(`A${rowIndex}:A${rowIndex + 1}`);
    const particularsHeader = sheet.getCell(`A${rowIndex}`);
    particularsHeader.value = "Particulars";
    particularsHeader.font = { bold: true };
    particularsHeader.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    sheet.mergeCells(`B${rowIndex}:E${rowIndex}`);
    const detailHeader = sheet.getCell(`B${rowIndex}`);
    detailHeader.value = "Details of Actual Measurement";
    detailHeader.font = { bold: true };
    detailHeader.alignment = { horizontal: "center", vertical: "middle" };

    sheet.mergeCells(`F${rowIndex}:F${rowIndex + 1}`);
    const areaHeader = sheet.getCell(`F${rowIndex}`);
    areaHeader.value = "Content/Area";
    areaHeader.font = { bold: true };
    areaHeader.alignment = { horizontal: "center", vertical: "middle" };

    sheet.mergeCells(`G${rowIndex}:G${rowIndex + 1}`);
    const unitHeader = sheet.getCell(`G${rowIndex}`);
    unitHeader.value = "Unit";
    unitHeader.font = { bold: true };
    unitHeader.alignment = { horizontal: "center", vertical: "middle" };
    rowIndex++;

    sheet.getCell(`B${rowIndex}`).value = "No.";
    sheet.getCell(`C${rowIndex}`).value = "Length";
    sheet.getCell(`D${rowIndex}`).value = "Breadth";
    sheet.getCell(`E${rowIndex}`).value = "Depth";
    [
      sheet.getCell(`B${rowIndex}`),
      sheet.getCell(`C${rowIndex}`),
      sheet.getCell(`D${rowIndex}`),
      sheet.getCell(`E${rowIndex}`),
    ].forEach((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    rowIndex++;

    sheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
    const itemCell = sheet.getCell(`A${rowIndex}`);
    itemCell.value = `Item No :- ${itemNo},`;
    itemCell.font = { bold: true };
    itemCell.alignment = { horizontal: "left", vertical: "middle" };
    sheet.getCell(`G${rowIndex}`).value = unit;
    sheet.getCell(`G${rowIndex}`).font = { bold: true };
    sheet.getCell(`G${rowIndex}`).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    rowIndex++;

    // Add particulars description
    sheet.getCell(`A${rowIndex}`).value = particulars;
    sheet.getCell(`A${rowIndex}`).font = { bold: true };
    rowIndex++;

    // Add measurement rows
    measurements.forEach((m) => {
      sheet.getCell(`A${rowIndex}`).value = m.description || "";
      sheet.getCell(`B${rowIndex}`).value = m.nos || "";
      sheet.getCell(`C${rowIndex}`).value = m.length || "";
      sheet.getCell(`D${rowIndex}`).value = m.breadth || "";
      sheet.getCell(`E${rowIndex}`).value = m.depth || "";
      sheet.getCell(`F${rowIndex}`).value = m.area || "";
      rowIndex++;
    });

    // Add empty row
    rowIndex++;

    // Add total row
    sheet.mergeCells(`D${rowIndex}:E${rowIndex}`);
    const totalLabelCell = sheet.getCell(`D${rowIndex}`);
    totalLabelCell.value = "Total";
    totalLabelCell.font = { bold: true };
    totalLabelCell.alignment = { horizontal: "center", vertical: "middle" };

    const totalValueCell = sheet.getCell(`F${rowIndex}`);
    totalValueCell.value = total;
    totalValueCell.font = { bold: true };
    totalValueCell.alignment = { horizontal: "right", vertical: "middle" };

    const unitCell = sheet.getCell(`G${rowIndex}`);
    unitCell.value = unit;
    unitCell.font = { bold: true };
    unitCell.alignment = { horizontal: "center", vertical: "middle" };
    rowIndex++;

    // Add signature row
    const signCell = sheet.getCell(`A${rowIndex}`);
    signCell.value = "Measurement Recorded by Contractor";
    signCell.alignment = { horizontal: "left" };
    rowIndex += 1;
    const signCell2 = sheet.getCell(`A${rowIndex}`);
    signCell2.value = "or Authorised Representative with dated sign";
    signCell2.alignment = { horizontal: "left" };
    rowIndex += 3
  };

  // Add all items to the sheet in original order (by itemNo)
  Object.entries(items)
    .sort(([, a], [, b]) => a.itemNo - b.itemNo)
    .forEach(([key, item]) => {
      addItemSection(
        item.itemNo,
        item.date,
        item.particulars,
        item.measurements,
        item.total,
        item.unit
      );
    });

  // Export to blob
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "CPWA-1_Measurements.xlsx";
  a.click();
  window.URL.revokeObjectURL(url);
};
