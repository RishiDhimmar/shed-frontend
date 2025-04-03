// import { observer } from "mobx-react-lite";
// import { Line } from "@react-three/drei";
// import { getClosedPoints } from "../../../utils/GeometryUtils";
// import foundationStore from "../../../stores/FoundationStore";

// const FoundationVisualizer = observer(() => {
//   return (
//     <>
//       {foundationStore.foundations.map((foundation) => (
//         <>
//         <Line
//           key={foundation.id}
//           points={
//             getClosedPoints(foundation.points) as [number, number, number][]
//           }
//           color="#ff00ff"
//           lineWidth={1.5}
//         />
//         </>
//       ))}
//     </>
//   );
// });

// export default FoundationVisualizer;



import { observer } from "mobx-react-lite";
import foundationStore from "../../../stores/FoundationStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";

const FoundationVisualizer = observer(() => {
  return (
    <>
      {foundationStore.foundations.map((foundation) => (
        <LineVisualizer key={foundation.id} points={foundation.points} color="#ff00ff" />
      ))}
    </>
  );
});

export default FoundationVisualizer;
