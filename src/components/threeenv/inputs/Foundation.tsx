// import { observer } from "mobx-react-lite";
// import InputNumber from "../Helpers/InputNumber";
// import foundationStore, {
//   FoundationType,
// } from "../../../stores/FoundationStore";

// const Foundation = observer(() => {
//   const { values, setParameter } = foundationStore;

//   return (
//     <div className="bg-white p-8 rounded shadow-xl w-full max-w-3xl mx-auto overflow-y-scroll h-[calc(100vh-100px)]">
//       <h1 className="text-2xl font-bold mb-6">Foundation Parameters</h1>

//       <form className="space-y-3 ">
//         {Object.entries(values).map(([type, params]) => (
//           <div key={type} className="">
//             <h2 className="text-2xl font-semibold mb-5 mt-8">
//               {type.charAt(0).toUpperCase() + type.slice(1)} Foundation
//             </h2>

//             {Object.keys(params).map((key) => (
//               <InputNumber
//                 key={key}
//                 label={key}
//                 value={params[key as keyof typeof params]}
//                 onChange={(v) =>
//                   setParameter(
//                     type as FoundationType,
//                     key as keyof typeof params,
//                     v
//                   )
//                 }
//               />
//             ))}
//           </div>
//         ))}
//       </form>
//     </div>
//   );
// });

// export default Foundation;

import { observer } from "mobx-react-lite";
import InputNumber from "../Helpers/InputNumber";
import foundationStore, {
  FoundationType,
} from "../../../stores/FoundationStore";

const Foundation = observer(() => {
  return (
    <div className="bg-white p-8 rounded shadow-xl w-[300px] max-w-md  ml-2 overflow-y-scroll h-[calc(100vh-100px)]">
      <h1 className="text-2xl font-bold mb-6">Foundation Parameters</h1>
      <form className="space-y-3 ">
        {Object.entries(foundationStore.values).map(([type, params]) => (
          <div key={type} className="">
            <h2 className="text-2xl font-semibold mb-5 mt-6">
              {type.charAt(0).toUpperCase() + type.slice(1)} Foundation
            </h2>
            {Object.keys(params).map((key) => (
              <InputNumber
                key={key}
                label={key}
                value={params[key as keyof typeof params]}
                onChange={(v) =>
                  foundationStore.setParameter(
                    type as FoundationType,
                    key as keyof typeof params,
                    v
                  )
                }
              />
            ))}
          </div>
        ))}
      </form>
    </div>
  );
});

export default Foundation;
