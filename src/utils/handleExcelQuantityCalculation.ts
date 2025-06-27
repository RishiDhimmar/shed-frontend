import { handleBrickworkBelowPlinthCalculation } from "./handleBrickworkBelowPlinthCalculation";
import { handleColumnFromFootingToPlinthM25Calculation } from "./handleColumnFromFootingToPlinthM25Calculation";
import { handleExcavationCalculation } from "./handleExcavationCalculation";
import { handleFillingGoodSoilFromOutSide } from "./handleFillingGoodSoilFromOutSide";
import { handlePccCalculation } from "./handlePccCalculation";
import { handlePileRunningCalculation } from "./handlePileRunningCalculation";
import { handleRccBelowNGLCalculation } from "./handleRccBelowNGLCalculation";
import { handleRubbleSoilingCalculation } from "./handleRubbleSoilingCalculation";

export const handleExcelQuantityCalculation = () => {
  handleExcavationCalculation();
  handleRubbleSoilingCalculation();
  // handlePileRunningCalculation();
  handlePccCalculation();
  handleRccBelowNGLCalculation();
  // brickwork_below_plinth
  handleBrickworkBelowPlinthCalculation();
  // column_from_footing_to_plinth_m25
  handleColumnFromFootingToPlinthM25Calculation();
  handleFillingGoodSoilFromOutSide();
};
