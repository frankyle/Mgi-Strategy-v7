import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Lightbulb, Newspaper } from "lucide-react";
import { getPublishedIdeasForUser } from "./TradersIdeaService";
import TraderIdeaCard from "./TraderIdeaCard";

// This route is intentionally OUTSIDE the DashboardLayout/ProtectedRoute
// tree in App.js — same pattern as TradeBlog/PublicTradeBlog.jsx — so a
// friend with just the link, and no account, can open it and see the
// published ideas.
export default function PublicTradersBlog() {
  const { userId } = useParams();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await getPublishedIdeasForUser(userId);
      setLoading(false);
      if (!result.success) {
        setErrorMsg(result.error.message || "Could not load this traders blog.");
        return;
      }
      setIdeas(result.data);
    };
    load();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Lightbulb size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Traders Ideas</h1>
            <p className="text-xs text-gray-500">Daily/weekly image calls from the journal</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {loading ? (
          <div className="text-center text-sm text-gray-500 py-16">Loading trade ideas…</div>
        ) : errorMsg ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
            <p className="text-sm text-red-600 font-medium mb-1">Couldn't load this page</p>
            <p className="text-xs text-gray-500">{errorMsg}</p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <Newspaper className="mx-auto text-gray-400 mb-3" size={32} />
            <p className="text-sm text-gray-500">No trader ideas published yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ideas.map((i) => (
              <TraderIdeaCard key={i.id} idea={i} readOnly />
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center text-xs text-gray-500">
        These are trade ideas, not financial advice — always do your own analysis.
      </footer>
    </div>
  );
}
