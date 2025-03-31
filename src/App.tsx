import ShadeCanvas from "./components/threeenv/ShadeCanvas";
import { Layout } from "./components/threeenv/inputs/Layout";
import { Import } from "./utils/Import";

function App() {
  return (
    <div className="flex">
      <Layout />
      <ShadeCanvas />
      <Import />
    </div>
  );
}

export default App;
