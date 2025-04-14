import Layout from "../threeenv/inputs/Layout";
import ShadeCanvas from "../threeenv/ShadeCanvas";
import { Import } from "../../utils/Import";
import Save from "../../utils/Save";
import Upload from "../../utils/Upload";
import { Assumptions } from "../threeenv/Helpers/Assumptions";
import Info from "../../utils/Info";
import Sidebar from "./Sidebar";
import ExportDxf from "./ExportDxf";
import GetLayerDxf from "./GetLayerDxf";

function ProjectStructure() {
  return (
    <>
      <Sidebar />
      <Layout />

      <div className=" flex-1">
        <ShadeCanvas />
      </div>

      <div className="  bg-white px-2 py-2 mr-2.5 flex flex-col items-center w-60 h-[calc(100vh-64px)] gap-2 ">
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
