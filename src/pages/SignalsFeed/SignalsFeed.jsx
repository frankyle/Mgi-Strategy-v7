import React, { useEffect, useState } from "react";
import { Radio, ShieldAlert } from "lucide-react";
import { getPublishedSetupsForUser } from "../SetupMatchGrader/SetupMatchGraderService";
import TradeIdeaCard from "../TradeBlog/TradeIdeaCard";

const ADMIN_USER_ID = process.env.REACT_APP_ADMIN_USER_ID;

// This is what every non-admin member lands on — the same published
// setups as the public /blog/:userId link, but inside the app, restyled,
// and without needing to know a share link. Read-only: no publish/
// unpublish controls here, those stay on the admin's Trade Blog page.
export default function SignalsFeed() {
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!ADMIN_USER_ID) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const result = await getPublishedSetupsForUser(ADMIN_USER_ID);
      setLoading(false);
      if (!result.success) {
        setErrorMsg(result.error.message || "Could not load signals.");
        return;
      }
      setSetups(result.data);
    };
    load();
  }, []);

  const activeCount = setups.filter((s) => !s.outcome_status || s.outcome_status === "pending").length;
  const longCount = setups.filter((s) => s.ltf_direction === "long").length;

  if (!ADMIN_USER_ID) {
    return (
      <div className="bg-panel border border-line p-8 max-w-xl mx-auto mt-10 text-center">
        <ShieldAlert className="mx-auto text-muted mb-3" size={28} />
        <h2 className="font-display text-lg font-semibold text-ink mb-2">
          Signals feed isn't wired up yet
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          Set <code className="text-ink bg-panel2 px-1.5 py-0.5">REACT_APP_ADMIN_USER_ID</code> in
          your environment variables to the admin account's user id, then redeploy.
        </p>
      </div>
    );
  }

  return (
    <div className="-m-4 sm:-m-6 bg-base min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Radio className="text-long" size={22} />
          <h1 className="font-display text-2xl font-semibold text-ink">Signals</h1>
        </div>
        <p className="text-sm text-muted mb-8 max-w-xl">
          Forex and stock setups called from Daily/4H reversal reads — entry
          logic, charts, and outcomes, updated as trades play out.
        </p>

        <div className="flex gap-6 mb-8 font-mono text-sm">
          <div>
            <span className="text-2xl text-ink">{setups.length}</span>
            <span className="text-muted ml-1.5">published</span>
          </div>
          <div>
            <span className="text-2xl text-long">{activeCount}</span>
            <span className="text-muted ml-1.5">active</span>
          </div>
          <div>
            <span className="text-2xl text-ink">{longCount}/{setups.length - longCount}</span>
            <span className="text-muted ml-1.5">long/short</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-sm text-muted py-16">Loading signals…</div>
        ) : errorMsg ? (
          <div className="bg-panel border border-line p-10 text-center">
            <p className="text-sm text-short font-medium mb-1">Couldn't load signals</p>
            <p className="text-xs text-muted">{errorMsg}</p>
          </div>
        ) : setups.length === 0 ? (
          <div className="bg-panel border border-line p-12 text-center">
            <Radio className="mx-auto text-muted mb-3" size={28} />
            <p className="text-sm text-muted">No signals published yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {setups.map((s) => (
              <TradeIdeaCard key={s.id} setup={s} readOnly />
            ))}
          </div>
        )}

        <p className="text-xs text-muted mt-10 text-center">
          These are trade ideas, not financial advice — always do your own analysis.
        </p>
      </div>
    </div>
  );
}
