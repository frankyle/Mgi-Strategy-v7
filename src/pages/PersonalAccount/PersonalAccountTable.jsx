// PersonalAccountTable.jsx (Updated with Mobile Card View)
import { Pencil, Trash2 } from "lucide-react";

function PersonalAccountTable({ trades, onEdit, onDelete }) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-5 text-gray-500 italic">
        No Personal Trades Yet.
      </div>
    );
  }

  // --- Mobile Card Component ---
  const MobileTradeCard = ({ trade }) => {
    // Calculate Net USD for display
    const netProfit = (parseFloat(trade.gain_usd) || 0) - (parseFloat(trade.risk_usd) || 0);

    return (
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 space-y-3">
        
        {/* Header: Pair and Signal */}
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-lg font-bold text-gray-800">{trade.pair}</span>
          <span
            className={`font-semibold px-3 py-1 rounded-full text-xs ${
              trade.signal.toLowerCase() === "buy"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {trade.signal}
          </span>
        </div>

        {/* Trade Details Grid (2 columns) */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
          {/* Row 1: Date/Day (Content reduced for mobile) */}
          <div className="flex justify-between col-span-2 border-b pb-1">
            <span className="text-gray-500 font-medium">Date:</span>
            <span className="font-semibold text-gray-700">
              {trade.date} ({trade.day})
            </span>
          </div>

          {/* Row 2: Net USD */}
          <div className="flex justify-between">
            <span className="text-gray-500">Net USD:</span>
            <span 
              className={`font-bold ${netProfit > 0 ? "text-green-600" : netProfit < 0 ? "text-red-600" : "text-gray-600"}`}
            >
              ${netProfit.toFixed(2)}
            </span>
          </div>
          
          {/* Row 3: Total Gain/Loss USD */}
          <div className="flex justify-between">
            <span className="text-gray-500">Gain Pips:</span>
            <span className="font-medium">{trade.gain_pips}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Risk:</span>
            <span className="font-medium text-red-500">${trade.risk_usd}</span>
          </div>

          {/* Row 4: Pips */}
          <div className="flex justify-between">
            <span className="text-gray-500">Risk Pips:</span>
            <span className="font-medium">{trade.risk_pips}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Gross Gain:</span>
            <span className="font-medium text-green-500">${trade.gain_usd}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t">
          <button
            onClick={() => onEdit(trade)}
            className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-full text-xs transition shadow-sm"
          >
            <Pencil size={14} />
            Edit
          </button>

          <button
            onClick={() => onDelete(trade.id)}
            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs transition shadow-sm"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    );
  };
  // --- End Mobile Card Component ---


  return (
    <>
      {/* 1. Desktop/Tablet Table View (md: breakpoint and up) */}
      {/* This uses the standard table structure and is visible only on wider screens */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="min-w-full bg-white rounded-2xl shadow-md overflow-hidden text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Day</th>
              <th className="px-4 py-3 text-left">Pair</th>
              <th className="px-4 py-3 text-left">Signal</th>
              <th className="px-4 py-3 text-left">Risk (USD)</th>
              <th className="px-4 py-3 text-left">Gain (USD)</th>
              <th className="px-4 py-3 text-left">Risk (Pips)</th>
              <th className="px-4 py-3 text-left">Gain (Pips)</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {trades.map((trade) => (
              <tr
                key={trade.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">{trade.date}</td>
                <td className="px-4 py-3">{trade.day}</td>
                <td className="px-4 py-3 font-medium">{trade.pair}</td>

                <td
                  className={`px-4 py-3 font-semibold ${
                    trade.signal.toLowerCase() === "buy"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {trade.signal}
                </td>

                <td className="px-4 py-3 font-mono">${trade.risk_usd}</td>
                <td className="px-4 py-3 font-mono">${trade.gain_usd}</td>
                <td className="px-4 py-3 font-mono">{trade.risk_pips}</td>
                <td className="px-4 py-3 font-mono">{trade.gain_pips}</td>

                <td className="px-4 py-3 flex gap-2 justify-center">
                  <button
                    onClick={() => onEdit(trade)}
                    className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-xl transition text-xs"
                    aria-label={`Edit trade for ${trade.pair}`}
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => onDelete(trade.id)}
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition text-xs"
                    aria-label={`Delete trade for ${trade.pair}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Card View (Below md breakpoint) */}
      {/* This uses the MobileTradeCard component and is visible only on mobile screens */}
      <div className="md:hidden space-y-4">
        {trades.map((trade) => (
          <MobileTradeCard key={trade.id} trade={trade} />
        ))}
      </div>
    </>
  );
}

export default PersonalAccountTable;