import { FaRegStar } from "react-icons/fa6";
import { useState } from "react";
import CreateProjectPopup from "./CreateProjectPopup";

function ListView() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const projects = Array(5)
    .fill(undefined)
    .map((_, i) => ({
      id: i + 1,
      name: "Project Name",
      lastEdited: "2 days ago",
      logo: "abc",
    }));
  return (
    <div className=" min-h-screen w-full">
      <div className="p-6 h-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Projects</h1>
          <button
            className="bg-gray-800 hover:bg-gray-600 text-white py-2 px-4 rounded"
            onClick={() => setIsModalOpen(true)}
          >
            Create Project
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">
          <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="relative border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="relative h-40">
                  <img
                    src="/assets/resolute-logo.png"
                    alt={project.name}
                    className="w-full h-full object-contain"
                  />
                  <button className="absolute top-2 right-2 text-white">
                    <FaRegStar size={24} />
                  </button>
                </div>

                <div className="p-3 flex items-center">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs">
                    {project.logo}
                  </div>
                  <div className="ml-2">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs text-gray-500">
                      Last edited {project.lastEdited}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <CreateProjectPopup isOpen={isModalOpen} onClose={handleModalClose} />
      </div>
    </div>
  );
}

export default ListView;
