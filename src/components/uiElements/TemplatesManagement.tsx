// TemplatesManagement.jsx
import { useState } from "react";
import { observer } from "mobx-react-lite";
import uiStore, { Template } from "../../stores/UIStore";
import AddTemplateModal from "./AddTemplateModal";
import { useNavigate } from "react-router-dom";
import { BiPencil } from "react-icons/bi";
import { AnimatePresence } from "framer-motion";

// Add templates functionality to UIStore if it doesn't exist
if (!("templates" in uiStore)) {
  const store = uiStore as any;
  store.templates = [];
  store.addTemplate = function (template: Omit<Template, "id" | "createdAt">) {
    this.templates.push({
      ...template,
      id: this.templates.length + 1,
      createdAt: new Date().toLocaleDateString(),
    });
  };

  store.editTemplate = function (
    id: number,
    updatedTemplate: Partial<Template>
  ) {
    const index = this.templates.findIndex((t: Template) => t.id === id);
    if (index !== -1) {
      this.templates[index] = { ...this.templates[index], ...updatedTemplate };
    }
  };
}

type TemplatesManagementProps = {
  onClose: () => void;
};

const TemplatesManagement = observer(
  ({ onClose }: TemplatesManagementProps) => {
    const navigate = useNavigate();
    const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(
      null
    );

    const handleEditTemplate = (template: Template) => {
      setEditingTemplate(template);
      setShowAddTemplateModal(true);
    };

    return (
      <div className=" w-full  bg-white  flex flex-col">
        <div className="p-6 flex-1 overflow-auto ">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">TEMPLATES</h1>
            <button
              onClick={() => setShowAddTemplateModal(true)}
              className="bg-gray-800 text-white px-4 py-2 cursor-pointer rounded hover:bg-gray-600"
            >
              ADD TEMPLATE
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 border text-left">Sr No</th>
                  <th className="py-3 px-4 border text-left">Template Name</th>
                  <th className="py-3 px-4 border text-left">Template Type</th>
                  <th className="py-3 px-4 border text-left">Created At</th>
                  <th className="py-3 px-4 border text-left">Actions </th>
                </tr>
              </thead>
              <tbody>
                {uiStore.templates &&
                  uiStore.templates.map((template, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">{template.id}</td>
                      <td className="py-2 px-4 border">{template.name}</td>
                      <td className="py-2 px-4 border">{template.type}</td>
                      <td className="py-2 px-4 border">{template.createdAt}</td>
                      <td className="py-2 px-4 border">
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="p-1 text-black hover:text-gray-500"
                          title="Edit Template"
                        >
                          <BiPencil size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                {(!uiStore.templates || uiStore.templates.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 px-4 border text-center text-gray-500"
                    >
                      No templates found. Add a template to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 border-t-1 bg-gray-50 flex justify-end">
          <button
            onClick={() => {
              navigate("/app/listView");
              {
                onClose();
              }
            }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>

        <AnimatePresence>
          {showAddTemplateModal && (
            <AddTemplateModal
              onClose={() => setShowAddTemplateModal(false)}
              templateToEdit={editingTemplate}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }
);

export default TemplatesManagement;
