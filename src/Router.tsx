import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ListView from "./components/uiElements/ListView";
import ProjectStructure from "./components/uiElements/ProjectStructure";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "listing",
        element: <ListView />,
      },
      {
        path: "project",
        element: <ProjectStructure />,
      },
    ],
  },
  {
    path: "/about",
    element: <div>About</div>,
  },
]);

export default Router;
