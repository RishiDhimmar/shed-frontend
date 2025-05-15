// import { observer } from "mobx-react-lite";
// import layerStore from "../../../stores/LayerStore";
// import LineVisualizer from "../Helpers/LineVisualizerProps";
// import uiStore from "../../../stores/UIStore";
// import { pointArrayToArrayLowerCase } from "../../../utils/ConversionUtils";

// const SCALE_FACTOR = 1 / 1000;

// const scalePoint = ([x, y]: number[]): [number, number, number] => [
//   x * SCALE_FACTOR,
//   y * SCALE_FACTOR,
//   0,
// ];

// const LayerEntitiesVisualizer = observer(() => {
//   return (
//     <>
//       {layerStore.entities.map((entity, index) => {
//         // LINE entity
//         if (entity.type === "LINE" && entity.vertices?.length === 2) {
//           const flatPoints = pointArrayToArrayLowerCase(entity.vertices).map(scalePoint);

//           return (
//             <LineVisualizer
//               key={`line-${index}`}
//               points={flatPoints}
//               color="blue"
//               dashed={false}
//             />
//           );
//         }

//         // LWPOLYLINE entity
//         if (entity.type === "LWPOLYLINE" && entity.vertices?.length > 1) {
//           const flatPoints = pointArrayToArrayLowerCase(entity.vertices).map(scalePoint);

//           const segments = [];

//           for (let i = 0; i < flatPoints.length - 1; i++) {
//             segments.push(
//               <LineVisualizer
//                 key={`polyline-${index}-${i}`}
//                 points={[flatPoints[i], flatPoints[i + 1]]}
//                 color="green"
//                 dashed={false}
//               />
//             );
//           }

//           if (entity.shape === true || entity.closed === true) {
//             segments.push(
//               <LineVisualizer
//                 key={`polyline-${index}-closing`}
//                 points={[flatPoints[flatPoints.length - 1], flatPoints[0]]}
//                 color="green"
//                 dashed={false}
//               />
//             );
//           }

//           return <>{segments}</>;
//         }

//         return null;
//       })}
//     </>
//   );
// });

// export default LayerEntitiesVisualizer;

import { observer } from "mobx-react-lite";
import layerStore from "../../../stores/LayerStore";
import LineVisualizer from "../Helpers/LineVisualizerProps";
import { pointArrayToArrayLowerCase } from "../../../utils/ConversionUtils";

const SCALE = 1 / 1000;

const scalePoint = ([x, y]: number[]): [number, number, number] => [
  x * SCALE,
  y * SCALE,
  0,
];

const LayerEntitiesVisualizer = observer(() => {
  return (
    <>
      {layerStore.entities.map((entity, index) => {
        // LINE
        if (entity.type === "LINE" && entity.vertices?.length === 2) {
          const points = pointArrayToArrayLowerCase(entity.vertices).map(
            scalePoint,
          );
          return (
            <LineVisualizer
              key={`line-${index}`}
              points={points}
              color="blue"
              //   dashed={false}
            />
          );
        }

        // LWPOLYLINE
        if (entity.type === "LWPOLYLINE" && entity.vertices?.length > 1) {
          const points = pointArrayToArrayLowerCase(entity.vertices).map(
            scalePoint,
          );
          const segments = [];

          for (let i = 0; i < points.length - 1; i++) {
            segments.push(
              <LineVisualizer
                key={`polyline-${index}-${i}`}
                points={[points[i], points[i + 1]]}
                color="green"
                // dashed={false}
              />,
            );
          }

          if (entity.closed || entity.shape) {
            segments.push(
              <LineVisualizer
                key={`polyline-${index}-closing`}
                points={[points[points.length - 1], points[0]]}
                color="green"
                // dashed={false}
              />,
            );
          }

          return <>{segments}</>;
        }

        // CIRCLE
        if (entity.type === "CIRCLE" && entity.center && entity.radius) {
          const points: [number, number, number][] = [];
          const steps = 32;
          const r = entity.radius * SCALE;
          const cx = entity.center.x * SCALE;
          const cy = entity.center.y * SCALE;

          for (let i = 0; i <= steps; i++) {
            const angle = (i / steps) * Math.PI * 2;
            points.push([
              cx + r * Math.cos(angle),
              cy + r * Math.sin(angle),
              0,
            ]);
          }

          const segments = [];
          for (let i = 0; i < points.length - 1; i++) {
            segments.push(
              <LineVisualizer
                key={`circle-${index}-${i}`}
                points={[points[i], points[i + 1]]}
                color="orange"
                // dashed={false}
              />,
            );
          }

          return <>{segments}</>;
        }

        // ARC
        if (entity.type === "ARC" && entity.center && entity.radius != null) {
          const points: [number, number, number][] = [];
          const steps = 32;
          const r = entity.radius * SCALE;
          const cx = entity.center.x * SCALE;
          const cy = entity.center.y * SCALE;
          const start = (entity.startAngle * Math.PI) / 180;
          const end = (entity.endAngle * Math.PI) / 180;

          for (let i = 0; i <= steps; i++) {
            const angle = start + (i / steps) * (end - start);
            points.push([
              cx + r * Math.cos(angle),
              cy + r * Math.sin(angle),
              0,
            ]);
          }

          const segments = [];
          for (let i = 0; i < points.length - 1; i++) {
            segments.push(
              <LineVisualizer
                key={`arc-${index}-${i}`}
                points={[points[i], points[i + 1]]}
                color="purple"
                // dashed={false}
              />,
            );
          }

          return <>{segments}</>;
        }

        // POINT
        if (entity.type === "POINT" && entity.position) {
          const x = entity.position.x * SCALE;
          const y = entity.position.y * SCALE;
          const size = 0.3;
          return (
            <LineVisualizer
              key={`point-${index}`}
              points={[
                [x - size, y - size, 0],
                [x + size, y + size, 0],
              ]}
              color="red"
              //   dashed={false}
            />
          );
        }

        return null;
      })}
    </>
  );
});

export default LayerEntitiesVisualizer;
