import React, { useEffect, useState } from "react";
import { getTrades, addTrade, updateTrade, deleteTradeById } from "./FundedTradeService";
import FundedTradeModal from "./FundedTradeModal";
import FundedTradeTable from "./FundedTradeTable";
import FundedTradeCharts from "./FundedTradeCharts";
import FundedTradeStatistics from "./FundedTradeStatistics"; // <-- NEW IMPORT!
import { supabase } from "../../supabaseClient";
import toast, { Toaster } from "react-hot-toast";

function FundedAccount() {
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
      // Ensure trades are in the format expected by the statistics calculator
      // e.g., converting string numbers to floats if needed before setting state
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
        <h1 className="text-2xl font-bold text-gray-800">Funded Account Trades</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow-md transition"
        >
          + Add Funded Trade
        </button>
      </div>

      {/* --- NEW STATISTICS WIDGET AREA --- */}
      <FundedTradeStatistics trades={trades} /> 
      {/* ---------------------------------- */}


      {/* Table Card */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <FundedTradeTable
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
        <FundedTradeCharts trades={trades} />
      </div>

      {/* Modal */}
      {modalOpen && (
        <FundedTradeModal
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

export default FundedAccount;