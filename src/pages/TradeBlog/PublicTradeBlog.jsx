import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TrendingUp, Newspaper } from "lucide-react";
import { getPublishedSetupsForUser } from "../SetupMatchGrader/SetupMatchGraderService";
import TradeIdeaCard from "./TradeIdeaCard";

// This route is intentionally OUTSIDE the DashboardLayout/ProtectedRoute
// tree in App.js — it renders its own minimal page so a friend with just
// the link, and no account, can open it and see the published ideas.
export default function PublicTradeBlog() {
  const { userId } = useParams();
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await getPublishedSetupsForUser(userId);
      setLoading(false);
      if (!result.success) {
        setErrorMsg(result.error.message || "Could not load this trade blog.");
        return;
      }
      setSetups(result.data);
    };
    load();
  }, [userId]);

  return (
    <div className="min-h-screen bg-base">
      <header className="border-b border-line bg-base/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-sm bg-long/10 border border-long/40 flex items-center justify-center text-long">
            <TrendingUp size={18} />
          </div>
          <div>
            <h1 className="font-display text-base font-semibold text-ink leading-tight">
              Trade Ideas This Week
            </h1>
            <p className="text-xs text-muted">Setups called from Daily/4H reversal reads</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {loading ? (
          <div className="text-center text-sm text-muted py-16">Loading trade ideas…</div>
        ) : errorMsg ? (
          <div className="bg-panel border border-line p-10 text-center">
            <p className="text-sm text-short font-medium mb-1">Couldn't load this page</p>
            <p className="text-xs text-muted">{errorMsg}</p>
          </div>
        ) : setups.length === 0 ? (
          <div className="bg-panel border border-line p-12 text-center">
            <Newspaper className="mx-auto text-muted mb-3" size={32} />
            <p className="text-sm text-muted">
              No trade ideas published yet — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {setups.map((s) => (
              <TradeIdeaCard key={s.id} setup={s} readOnly />
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center text-xs text-muted">
        These are trade ideas, not financial advice — always do your own analysis.
      </footer>
    </div>
  );
}
