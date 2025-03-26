import ShadeCanvas from "./components/threeenv/ShadeCanvas";
import { Layout } from "./components/threeenv/inputs/Layout";

function App() {
  return (
    <div className="flex">
      <Layout />
      <ShadeCanvas />
    </div>
  );
}

export default App;
