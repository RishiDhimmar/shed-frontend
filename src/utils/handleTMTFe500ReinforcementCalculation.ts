import { toJS } from "mobx";
import columnStore from "../stores/ColumnStore";
import configStore from "../stores/ConfigStore";
import { items } from "./sheetItems";
import foundationStore from "../stores/FoundationStore";
import mullionColumnStore from "../stores/MullianColumnStore";
import baseplateStore from "../stores/BasePlateStore";
import wallStore from "../stores/WallStore";

const getDistance = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
};

const handleTMTFe500ReinforcementCalculation = () => {
  const measurements = [];
  columnStore.polygons.map((grp) => {
    const nos =
      grp.columns.length * (grp.hEdgeWires * 2 + (grp.vEdgeWires - 2) * 2);

    const length = configStore.shed3D.heights.COLUMNS + 0.45;
    console.log(toJS(grp));

    measurements.push({
      id: "wireData",
      description:
        "Column " +
        grp.columns.length +
        " X (" +
        grp.hEdgeWires +
        " + " +
        (grp.vEdgeWires - 2) +
        ") X 2",
      nos: nos,
      length: length,
      breadth: 0,
      depth: 0,
      area: nos * length,
    });
  });

  measurements.push({
    id: "empty",
    description: "",
    nos: 0,
    length: 0,
    breadth: 0,
    depth: 0,
    area: 0,
  });
  measurements.push({
    id: "column-rings",
    description: "Column Rings",
    nos: 1,
    length: columnStore.totalRingLength,
    breadth: 0,
    depth: 0,
    area: columnStore.totalRingLength,
  });

  //total foundation length
  console.log(toJS(foundationStore.foundations));
  let totalFoundationLength = 0;

  foundationStore.foundations.map((f) => {
    f.rodData.map((rod) => {
      //   console.log(toJS(rod.circle1), toJS(rod.circle2));
      totalFoundationLength += getDistance(rod.circle1, rod.circle2) + 75;
    });
  });

  totalFoundationLength = Number((totalFoundationLength / 1000).toFixed(3));
  measurements.push({
    id: "foundation-net",
    description: "Foundation Net",
    nos: 1,
    length: totalFoundationLength,
    breadth: 0,
    depth: 0,
    area: totalFoundationLength,
  });

  //mullion column rods
  const noMC =
    baseplateStore.cornerBasePlates.length +
    baseplateStore.edgeBasePlates.length;
  const lengthMC = configStore.shed3D.heights.MULLION_COLUMNS_Z_HEIGHT * 4;

  measurements.push({
    id: "mullion-column-rods",
    description: "Mullion Column Rods (" + noMC + " X " + "4)",
    nos: noMC,
    length: lengthMC,
    breadth: 0,
    depth: 0,
    area: noMC * lengthMC,
  });

  // mullion column rings length

  measurements.push({
    id: "mullion-column-rings",
    description: "Mullion Column Rings",
    nos: 1,
    length: mullionColumnStore.totalRingLength,
    breadth: 0,
    depth: 0,
    area: mullionColumnStore.totalRingLength,
  });

  //groundBeam
  const groundBeamLength = wallStore.beamTotalLength;
  measurements.push({
    id: "ground-beam",
    description: "Ground Beam",
    nos: 1,
    length: groundBeamLength,
    breadth: 0,
    depth: 0,
    area: groundBeamLength,
  });

  //coping beam
  const copingBeamLength = wallStore.copingBeamLength;
  measurements.push({
    id: "coping-beam",
    description: "Coping Beam",
    nos: 1,
    length: copingBeamLength,
    breadth: 0,
    depth: 0,
    area: copingBeamLength,
  });

  items.tmt_fe500_reinforcement.measurements = measurements;
  items.tmt_fe500_reinforcement.total = measurements
    .reduce((sum, m) => sum + m.area, 0)
    .toFixed(3);
};

export default handleTMTFe500ReinforcementCalculation;
