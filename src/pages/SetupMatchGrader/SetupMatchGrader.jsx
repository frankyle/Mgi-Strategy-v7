import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { getSetups } from "./SetupMatchGraderService";
import SetupMatchGraderForm from "./SetupMatchGraderForm";
import SetupMatchGraderStats from "./SetupMatchGraderStats";
import SetupMatchGraderTable from "./SetupMatchGraderTable";

function SetupMatchGrader() {
  const [setups, setSetups] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const result = await getSetups();
    setLoading(false);

    if (!result.success) {
      toast.error(result.error.message || "Could not load setups");
      return;
    }
    setSetups(result.data);
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered =
    filter === "all" ? setups : setups.filter((s) => s.grade === filter);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">🎯 Setup Match Grader</h1>
        <p className="text-sm text-gray-500 mt-1">
          Log your Daily/4H reversal read (Phase 1) against your 15m continuation
          trigger (Phase 2). The grade tells you whether they actually lined up —
          the indicator can't do that part.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <SetupMatchGraderForm onSaved={refresh} />
        <SetupMatchGraderStats setups={setups} filter={filter} onFilterChange={setFilter} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Logged Setups</h2>
        {loading ? (
          <div className="text-sm text-gray-400">Loading…</div>
        ) : (
          <SetupMatchGraderTable setups={filtered} onChange={refresh} />
        )}
      </div>
    </div>
  );
}

export default SetupMatchGrader;
