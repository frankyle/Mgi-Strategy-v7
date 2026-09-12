import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function FundedTradeCharts({ trades }) {
  if (!trades || trades.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-6">
        No chart data available.
      </p>
    );
  }

  // Prepare chart data
  const chartDataUSD = trades
  .slice() // make a copy so we don't mutate original array
  .sort((a, b) => new Date(a.date) - new Date(b.date)) // oldest first
  .map((t) => ({
    date: t.date,
    gain: Number(t.gain_usd) || 0,
    risk: Number(t.risk_usd) || 0,
  }));


  const chartDataPips = trades
  .slice()
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .map((t) => ({
    date: t.date,
    gain: Number(t.gain_pips) || 0,
    risk: Number(t.risk_pips) || 0,
  }));


  return (
    <div className="mt-10 space-y-8">
      {/* Pips Chart */}
      <div>
        <h2 className="text-lg font-bold mb-4">Performance Chart (Pips)</h2>
        <div className="w-full h-72 bg-white p-4 rounded shadow">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartDataPips}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="gain"
                stroke="#16a34a" // green
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="risk"
                stroke="#dc2626" // red
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* USD Chart */}
      <div>
        <h2 className="text-lg font-bold mb-4">Performance Chart (USD)</h2>
        <div className="w-full h-72 bg-white p-4 rounded shadow">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartDataUSD}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="gain"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="risk"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default FundedTradeCharts;
