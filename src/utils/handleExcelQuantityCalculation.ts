import { handleExcavationCalculation } from "./handleExcavationCalculation";
import { handleFillingGoodSoilFromOutSide } from "./handleFillingGoodSoilFromOutSide";
import { handlePccCalculation } from "./handlePccCalculation";
import { handlePileRunningCalculation } from "./handlePileRunningCalculation";
import { handleRubbleSoilingCalculation } from "./handleRubbleSoilingCalculation";

export const handleExcelQuantityCalculation = () => {
  handleExcavationCalculation();
  handleRubbleSoilingCalculation();
  handlePileRunningCalculation();
  handlePccCalculation();
  handleFillingGoodSoilFromOutSide();
};
