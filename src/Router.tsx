import { createBrowserRouter, Outlet } from "react-router-dom";
import ProjectStructure from "./components/uiElements/ProjectStructure";
import ListView from "./components/uiElements/ListView";
import LoginPage from "./components/uiElements/LoginPage";
import Navbar from "./components/uiElements/Navbar";

// Layout component that includes the Navbar
const MainLayout = () => (
  <div className="flex flex-col h-screen">
    <Navbar />
    <div className="flex overflow-hidden">
      <Outlet />
    </div>
  </div>
);

const Router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/listView",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <ListView />,
      },
    ],
  },
  {
    path: "/project",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <ProjectStructure />,
      },
    ],
  },
]);

export default Router;
