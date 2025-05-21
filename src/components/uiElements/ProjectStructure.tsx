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

function ProjectStructure() {
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
