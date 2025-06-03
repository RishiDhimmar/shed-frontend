import Layout from "../threeenv/inputs/Layout";
import ShadeCanvas from "../threeenv/ShadeCanvas";
import { Import } from "../../utils/Import";
import Save from "../../utils/Save";
import Upload from "../../utils/Upload";
import { Assumptions } from "../threeenv/Helpers/Assumptions";
import Info from "../../utils/Info";
// import Sidebar from "./Sidebar";
import ExportDxf from "./ExportDxf";
import GetLayerDxf from "./GetLayerDxf";
import CanvasSpace from "../threeenv/Helpers/CanvasSpace";
import CanvasTest from "../canvas2d/CanvasTest";
import Canvas from "../konvaCanvas/Canvas";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import wallStore from "../../stores/WallStore";
import dxfStore from "../../stores/DxfStore";
import { convertToPointObjects } from "../../utils/PolygonUtils";
import baseplateStore from "../../stores/BasePlateStore";
import columnStore from "../../stores/ColumnStore";
import foundationStore from "../../stores/FoundationStore";
import mullionColumnStore from "../../stores/MullianColumnStore";
import uiStore from "../../stores/UIStore";

function ProjectStructure() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => {
    const getDataForProject = () => {
      if (!id) return;
      console.log(id);
      fetch(`http://localhost:3000/projects/${id}`)
        .then((res) => res.json())
        .then((data) => {
          const jsonData = data.data;

          wallStore.wallThickness = jsonData.wall.wallThickness;
          dxfStore.externalWallPolygon = jsonData.wall.externalWallPoints;
          dxfStore.externalWallPoints = convertToPointObjects(
            jsonData.wall.externalWallPoints
          );
          dxfStore.internalWallPolygon = jsonData.wall.internalWallPoints;

          baseplateStore.groups = jsonData.baseplate.groups;
          // baseplateStore.basePlates = jsonData.baseplate.basePlates;
          baseplateStore.basePlates = jsonData.baseplate.groups.flatMap(
            (group) => group.basePlates
          );

          columnStore.columnInputs = jsonData.column.columnInputs;
          columnStore.polygons = jsonData.column.polygons;
          // columnStore.columns = jsonData.column.columns;
          columnStore.columns = jsonData.column.polygons.flatMap(
            (group) => group.columns
          );

          foundationStore.foundationInputs =
            jsonData.foundation.foundationInputs;
          // foundationStore.foundations = jsonData.foundation.foundations;
          foundationStore.foundations = jsonData.foundation.groups.flatMap(
            (group) => group.foundations
          );
          foundationStore.groups = jsonData.foundation.groups;
          foundationStore.generateFoundations();

          mullionColumnStore.polygons = jsonData.mullionColumn.polygons;

          uiStore.setProjectName(jsonData.projectName);
          console.log(jsonData);
        });
    };
    getDataForProject();
  }, []);
  return (
    <>
      {/* <Sidebar /> */}
      <Layout />

      <div className=" flex-1 w-80">
        {/*<ShadeCanvas /> */}
        <Canvas />
      </div>

      <div className="  bg-white px-2 py-2 mr-2.5 flex flex-col items-center w-60 h-[calc(100vh-40px)] gap-2 z-10 ">
        <div className="flex flex-col gap-2">
          <Import />
          <div className=" flex gap-2">
            <Save />
            <Upload />
          </div>
          <Assumptions />
          <ExportDxf />
          <GetLayerDxf />
        </div>
        <Info />
      </div>
    </>
  );
}

export default ProjectStructure;
