import React, { useEffect, useState } from "react";
import {
  getIdeas,
  addIdea,
  updateIdea,
  deleteIdeaById,
} from "./TradersIdeaService";

import TradersIdeaModal from "./TradersIdeaModal";
import TradersIdeaTable from "./TradersIdeaTable";
import toast, { Toaster } from "react-hot-toast";

function TradersIdea() {
  const [ideas, setIdeas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdea, setEditIdea] = useState(null);

  // Load ideas on mount
  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    const response = await getIdeas();

    if (!response.success) {
      toast.error(`Failed to load ideas: ${response.error.message}`);
      return;
    }

    setIdeas(response.data || []);
  };

  // ADD NEW IDEA
  const handleAdd = async (idea) => {
    const response = await addIdea(idea);

    if (!response.success) {
      toast.error(`Failed to add idea: ${response.error.message}`);
      return;
    }

    toast.success("Idea added successfully!");
    setModalOpen(false);
    loadIdeas();
  };

  // UPDATE EXISTING IDEA
  const handleUpdate = async (idea) => {
    // Pass the existing idea to the service for proper image deletion logic
    const response = await updateIdea(editIdea.id, idea, editIdea); 

    if (!response.success) {
      toast.error(`Failed to update idea: ${response.error.message}`);
      return;
    }

    toast.success("Idea updated successfully!");
    setEditIdea(null);
    setModalOpen(false);
    loadIdeas();
  };

  // DELETE IDEA
  const handleDelete = async (idea) => {
    if (!window.confirm(`Delete ${idea.pair} (${idea.date}) permanently?`)) return;
    // Pass the whole idea object to the service to help with image path deletion
    const response = await deleteIdeaById(idea); 

    if (!response.success) {
      toast.error(`Failed to delete idea: ${response.error.message}`);
      return;
    }

    toast.success("Idea deleted successfully!");
    loadIdeas();
  };

  return (
    <div className="p-1 sm:p-6 max-w-6xl mx-auto space-y-5 sm:space-y-8 animate-fadeIn">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Traders Idea Images</h1>
          <p className="text-xs text-gray-500 mt-0.5">{ideas.length} idea{ideas.length === 1 ? "" : "s"}</p>
        </div>

        <button
          onClick={() => {
            setEditIdea(null);
            setModalOpen(true);
          }}
          className="hidden md:block bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow-md transition"
        >
          + Add Traders Idea
        </button>
      </div>

      {/* Table */}
        <TradersIdeaTable
          ideas={ideas}
          onEdit={(idea) => {
            setEditIdea(idea);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
          onChange={loadIdeas}
        />
      

      {/* Phone: floating add button (sits above the bottom bar) */}
      <button
        onClick={() => {
          setEditIdea(null);
          setModalOpen(true);
        }}
        aria-label="Add Traders Idea"
        className="md:hidden fixed right-4 z-20 h-14 w-14 rounded-full bg-green-600 text-white text-3xl leading-none shadow-lg active:bg-green-700 flex items-center justify-center"
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        +
      </button>

      {/* Modal */}
      {modalOpen && (
        <TradersIdeaModal
          initialData={editIdea}
          onSave={editIdea ? handleUpdate : handleAdd}
          onClose={() => {
            setModalOpen(false);
            setEditIdea(null);
          }}
        />
      )}
    </div>
  );
}

export default TradersIdea;