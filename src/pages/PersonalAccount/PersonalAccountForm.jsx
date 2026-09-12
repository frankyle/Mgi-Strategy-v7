import { useState } from "react";

function PersonalAccountForm({ initialData, onSubmit, onClose }) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState(
    initialData || {
      date: today,
      pair: "",
      signal: "Buy",
      risk_usd: 2,
      gain_usd: 4,
      risk_pips: 20,
      gain_pips: 40,
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        {initialData ? "Edit Trade" : "New Personal Trade"}
      </h2>

      {/* Date */}
      <input
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        className="w-full border rounded-xl p-2 focus:ring focus:ring-blue-300"
      />

      {/* Pair */}
      <input
        name="pair"
        value={form.pair}
        onChange={handleChange}
        className="w-full border rounded-xl p-2"
        placeholder="Example: XAUUSD, EURUSD..."
      />

      {/* Signal Dropdown */}
      <select
        name="signal"
        value={form.signal}
        onChange={handleChange}
        className="w-full border rounded-xl p-2 bg-white"
      >
        <option value="Buy">Buy</option>
        <option value="Sell">Sell</option>
      </select>

      {/* USD Risk */}
      <input
        name="risk_usd"
        type="number"
        value={form.risk_usd}
        onChange={handleChange}
        className="w-full border rounded-xl p-2"
        placeholder="Risk in USD"
      />

      {/* USD Gain */}
      <input
        name="gain_usd"
        type="number"
        value={form.gain_usd}
        onChange={handleChange}
        className="w-full border rounded-xl p-2"
        placeholder="Gain in USD"
      />

      {/* Pips Risk */}
      <input
        name="risk_pips"
        type="number"
        value={form.risk_pips}
        onChange={handleChange}
        className="w-full border rounded-xl p-2"
        placeholder="Risk in pips"
      />

      {/* Pips Gain */}
      <input
        name="gain_pips"
        type="number"
        value={form.gain_pips}
        onChange={handleChange}
        className="w-full border rounded-xl p-2"
        placeholder="Gain in pips"
      />

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default PersonalAccountForm;
