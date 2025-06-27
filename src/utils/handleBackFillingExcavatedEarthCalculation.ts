import { handleColumnFromFootingToPlinthM25Calculation } from "./handleColumnFromFootingToPlinthM25Calculation";
import { handleExcavationCalculation } from "./handleExcavationCalculation";
import { handlePccCalculation } from "./handlePccCalculation";
import { handleRccBelowNGLCalculation } from "./handleRccBelowNGLCalculation";
import { handleRubbleSoilingCalculation } from "./handleRubbleSoilingCalculation";
import { items } from "./sheetItems";

export const handleBackFillingExcavatedEarthCalculation = () => {
  const { fullVolume: excavationVolume } = handleExcavationCalculation();
  const { fullVolume: rubbleVolume } = handleRubbleSoilingCalculation();
  const { fullVolume: pccVolume } = handlePccCalculation();
  const { fullVolume: rccVolume } = handleRccBelowNGLCalculation();
  const { totalVolume: columnVolume } =
    handleColumnFromFootingToPlinthM25Calculation();

  const totalDeductions = rubbleVolume + pccVolume + rccVolume + columnVolume;
  const backfillingVolume = parseFloat(
    (excavationVolume - totalDeductions).toFixed(3)
  );

  // Create detailed measurement entries
  const measurements = [
    {
      id: "backfill-excavation",
      description: "Total Excavation Volume",
      nos: 1,
      length: 0,
      breadth: 0,
      depth: 0,
      area: excavationVolume,
    },
    {
      id: "backfill-rubble",
      description: "Deduction: Rubble Soling",
      nos: 1,
      length: 0,
      breadth: 0,
      depth: 0,
      area: rubbleVolume,
    },
    {
      id: "backfill-pcc",
      description: "Deduction: P.C.C",
      nos: 1,
      length: 0,
      breadth: 0,
      depth: 0,
      area: pccVolume,
    },
    {
      id: "backfill-rcc",
      description: "Deduction: R.C.C Below NGL",
      nos: 1,
      length: 0,
      breadth: 0,
      depth: 0,
      area: rccVolume,
    },
    {
      id: "backfill-column",
      description: "Deduction: Column Concrete (Footing to Plinth)",
      nos: 1,
      length: 0,
      breadth: 0,
      depth: 0,
      area: columnVolume,
    },
    {
      id: "backfill-net",
      description: "Net Backfilling Volume",
      nos: 1,
      length: 0,
      breadth: 0,
      depth: 0,
      area: backfillingVolume,
    },
  ];

  items.back_filling_excavated_earth.measurements = measurements;
  items.back_filling_excavated_earth.total = backfillingVolume;

  return {
    excavationVolume,
    rubbleVolume,
    pccVolume,
    rccVolume,
    columnVolume,
    backfillingVolume,
    measurements,
  };
};
