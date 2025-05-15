import { toJS } from "mobx";
import foundationStore from "../../stores/FoundationStore";
import FrustumMesh from "./FrustumMesh";
import { floor } from "three/tsl";
import RCCRenderer from "./RCCRenderer";
import { Shed3DConfig } from "../../Constants";

// Updated FoundationsRenderer using FrustumMesh
function FoundationsRenderer({ centerOffset, scale = 0.1 }) {
    const foundations = toJS(foundationStore.foundations);
    return foundations.map((f, i) => {
      // Adjust outer and inner points with center offset and scale
      const outerPoints = (f.outerFoundationPoints || []).map((p) => ({
        x: -(p.x / 1000 - centerOffset[0]) * scale, // Three.js x
        y: -(p.y / 1000 - centerOffset[2]) * scale, // Three.js z
      }));
      const innerPoints = (f.innerFoundationPoints || []).map((p) => ({
        x: -(p.x / 1000 - centerOffset[0]) * scale, // Three.js x
        y: -(p.y / 1000 - centerOffset[2]) * scale, // Three.js z
      }));

      return (
        <>
          <FrustumMesh
            key={i}
            bottomPoints={outerPoints} // At y=0
            topPoints={innerPoints} // At y=-0.6 meters (600 mm)
            floorY={Shed3DConfig.heights.RCC}
            
          />
          <RCCRenderer bottomPoints={outerPoints} />
        </>
      );
    });
}

export default FoundationsRenderer;
