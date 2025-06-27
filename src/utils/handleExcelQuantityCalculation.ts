import { handleBackFillingExcavatedEarthCalculation } from "./handleBackFillingExcavatedEarthCalculation";
import { handleBrickworkBelowPlinthCalculation } from "./handleBrickworkBelowPlinthCalculation";
import { handleColumnFromFootingToPlinthM25Calculation } from "./handleColumnFromFootingToPlinthM25Calculation";
import { handleExcavationCalculation } from "./handleExcavationCalculation";
import { handleFillingGoodSoilFromOutSide } from "./handleFillingGoodSoilFromOutSide";
import { handleFixingAnchorJBoltOnRccColumnCalculation } from "./handleFixingAnchorJBoltOnRccColumnCalculation";
import { handleGradeSlabM25WithTrimixCalculation } from "./handleGradeSlabM25WithTrimixCalculation";
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
  // back_filling_excavated_earth
  handleBackFillingExcavatedEarthCalculation();
  // fixing_anchor_jbolt_on_rcc_column
  handleFixingAnchorJBoltOnRccColumnCalculation();
  // grade_slab_m25_with_trimix
  handleFillingGoodSoilFromOutSide();
  handleGradeSlabM25WithTrimixCalculation();
};
