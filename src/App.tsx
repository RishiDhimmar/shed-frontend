import ShadeCanvas from "./components/threeenv/ShadeCanvas";
import { Layout } from "./components/threeenv/inputs/Layout";
import { Import } from "./utils/Import";
import Info from "./utils/Info";

function App() {
  return (
    <div className="flex relative">
      <Layout />
      <ShadeCanvas />
      <Import />
      <Info />
    </div>
  );
}

export default App;
