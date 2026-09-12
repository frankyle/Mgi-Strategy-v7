import React, { useEffect, useState } from "react";
import { getTrades, addTrade, updateTrade, deleteTradeById } from "./PersonalAccountService";
import PersonalAccountModal from "./PersonalAccountModal";
import PersonalAccountTable from "./PersonalAccountTable";
import PersonalAccountCharts from "./PersonalAccountCharts";
import PersonalTradeStatistics from "./PersonalTradeStatistics"; // <-- NEW IMPORT
import { supabase } from "../../supabaseClient";
import toast, { Toaster } from "react-hot-toast";

function PersonalAccount() {
  const [trades, setTrades] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTrade, setEditTrade] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Load trades when user is ready
  useEffect(() => {
    if (user) loadTrades();
  }, [user]);

  const loadTrades = async () => {
    const response = await getTrades();
    if (response.success) {
      setTrades(response.data || []);
    } else {
      toast.error(`Failed to load trades: ${response.error.message}`);
    }
  };

  const handleAdd = async (trade) => {
    const response = await addTrade(trade);

    if (!response.success) {
      toast.error(
        `Failed to add trade: ${response.error.message} ${
          response.error.details ? "- " + response.error.details : ""
        }`
      );
      return;
    }

    toast.success("Trade added successfully!");
    setModalOpen(false);
    loadTrades();
  };

  const handleUpdate = async (trade) => {
    const response = await updateTrade(editTrade.id, trade);

    if (!response.success) {
      toast.error(
        `Failed to update trade: ${response.error.message} ${
          response.error.details ? "- " + response.error.details : ""
        }`
      );
      return;
    }

    toast.success("Trade updated successfully!");
    setEditTrade(null);
    setModalOpen(false);
    loadTrades();
  };

  const handleDelete = async (id) => {
    const response = await deleteTradeById(id);

    if (!response.success) {
      toast.error(
        `Failed to delete trade: ${response.error.message} ${
          response.error.details ? "- " + response.error.details : ""
        }`
      );
      return;
    }

    toast.success("Trade deleted successfully!");
    loadTrades();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Toast container */}
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Personal Account Trades</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow-md transition"
        >
          + Add Personal Trade
        </button>
      </div>

      {/* --- NEW STATISTICS WIDGET AREA --- */}
      {/* This dashboard provides a quick summary of trade performance */}
      <PersonalTradeStatistics trades={trades} />
      {/* ---------------------------------- */}


      {/* Table Card */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <PersonalAccountTable
          trades={trades}
          onEdit={(trade) => {
            setEditTrade(trade);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      {/* Charts Card */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <PersonalAccountCharts trades={trades} />
      </div>

      {/* Modal */}
      {modalOpen && (
        <PersonalAccountModal
          initialData={editTrade}
          onSave={editTrade ? handleUpdate : handleAdd}
          onClose={() => {
            setModalOpen(false);
            setEditTrade(null);
          }}
        />
      )}
    </div>
  );
}

export default PersonalAccount;
