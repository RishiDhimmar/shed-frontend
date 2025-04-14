// import { createBrowserRouter, Outlet } from "react-router-dom";
// import ProjectStructure from "./components/uiElements/ProjectStructure";
// import ListView from "./components/uiElements/ListView";
// import LoginPage from "./components/uiElements/LoginPage";
// import Navbar from "./components/uiElements/Navbar";
// import TemplatesManagement from "./components/uiElements/TemplatesManagement";

// // Layout component that includes the Navbar
// const MainLayout = () => (
//   <div className="flex flex-col h-screen">
//     <Navbar />
//     <div className="flex overflow-hidden">
//       <Outlet />
//     </div>
//   </div>
// );

// const Router = createBrowserRouter([
//   {
//     path: "/",
//     element: <LoginPage />,
//   },
//   {
//     path: "/listView",
//     element: <MainLayout />,
//     children: [
//       {
//         path: "",
//         element: <ListView />,
//       },
//       {
//         path: "templates",
//         element: <TemplatesManagement />,
//       },
//     ],
//   },
//   {
//     path: "/project",
//     element: <MainLayout />,
//     children: [
//       {
//         path: "",
//         element: <ProjectStructure />,
//       },
//     ],
//   },
// ]);

// export default Router;
import { createBrowserRouter, Outlet } from "react-router-dom";
import ProjectStructure from "./components/uiElements/ProjectStructure";
import ListView from "./components/uiElements/ListView";
import LoginPage from "./components/uiElements/LoginPage";
import Navbar from "./components/uiElements/Navbar";
import Sidebar from "./components/uiElements/Sidebar";
import TemplatesManagement from "./components/uiElements/TemplatesManagement";

// Layout component that includes the Navbar
const MainLayout = () => (
  <div className="flex flex-col h-screen">
    <Navbar />
    <div className="flex w-full h-full overflow-hidden relative">
      <Sidebar />
      <div className="ml-12 flex w-full">
        <Outlet />
      </div>
    </div>
  </div>
);

const Router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
    children: [],
  },
  {
    path: "/app",
    element: <MainLayout />,
    children: [
      { path: "listView", element: <ListView /> },
      { path: "project", element: <ProjectStructure /> },
      {
        path: "templates",
        element: (
          <TemplatesManagement
            onClose={() => console.log("Templates management closed")}
          />
        ),
      },
    ],
  },
]);

export default Router;
