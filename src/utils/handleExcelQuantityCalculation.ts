import { handleBackFillingExcavatedEarthCalculation } from "./handleBackFillingExcavatedEarthCalculation";
import handleBrickworkAbovePlinthCalculation from "./handleBrickworkAbovePlinthCalculation";
import { handleBrickworkBelowPlinthCalculation } from "./handleBrickworkBelowPlinthCalculation";
import { handleColumnFromFootingToPlinthM25Calculation } from "./handleColumnFromFootingToPlinthM25Calculation";
import { handleExcavationCalculation } from "./handleExcavationCalculation";
import { handleFillingGoodSoilFromOutSide } from "./handleFillingGoodSoilFromOutSide";
import { handleFixingAnchorJBoltOnRccColumnCalculation } from "./handleFixingAnchorJBoltOnRccColumnCalculation";
import { handleGradeSlabM25WithTrimixCalculation } from "./handleGradeSlabM25WithTrimixCalculation";
import { handlePccCalculation } from "./handlePccCalculation";
import handlePccGroundBeamM25Calculation from "./handlePccGroundBeamM25Calculation";
import handlePccMullionColumnCalculation from "./handlePccMullionColumnCalculation";
import { handlePileRunningCalculation } from "./handlePileRunningCalculation";
import handlePlaster12mmCementMortarCalculation from "./handlePlaster12mmCementMortarCalculation";
import { handleRccBelowNGLCalculation } from "./handleRccBelowNGLCalculation";
import handleRccLintelBeamCopingCalculation from "./handleRccLintelBeamCopingCalculation";
import { handleRubbleSoilingCalculation } from "./handleRubbleSoilingCalculation";
import handleTrimixGrooveCuttingCalculation from "./handleTrimixGrooveCuttingCalculation";
import handleTrimixHardenerSpreadingCalculation from "./handleTrimixHardenerSpreadingCalculation";

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
  // pcc_ground_beam_m25
  handlePccGroundBeamM25Calculation();
  // back_filling_excavated_earth
  handleBackFillingExcavatedEarthCalculation();
  // fixing_anchor_jbolt_on_rcc_column
  handleFixingAnchorJBoltOnRccColumnCalculation();
  // grade_slab_m25_with_trimix
  handleFillingGoodSoilFromOutSide();
  // trimix_hardener_spreading
  handleTrimixHardenerSpreadingCalculation();
  // trimix_groove_cutting
  handleTrimixGrooveCuttingCalculation();
  // brickwork_above_plinth
  handleBrickworkAbovePlinthCalculation();
  //pcc_mullion_column
  handlePccMullionColumnCalculation();
  // rcc_lintel_beam_coping
  handleRccLintelBeamCopingCalculation();
  // plaster_12mm_cement_mortar
  handlePlaster12mmCementMortarCalculation();
  handleGradeSlabM25WithTrimixCalculation();
};
