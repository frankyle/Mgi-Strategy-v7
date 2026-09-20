import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { Link2, Check, Lightbulb, ExternalLink } from "lucide-react";
import { getIdeas, setIdeaPublished } from "./TradersIdeaService";
import { supabase } from "../../supabaseClient";
import TraderIdeaCard from "./TraderIdeaCard";

function TradersBlog() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [copied, setCopied] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const result = await getIdeas();
    setLoading(false);

    if (!result.success) {
      toast.error(result.error.message || "Could not load ideas");
      return;
    }
    setIdeas(result.data);
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    init();
    refresh();
  }, []);

  const published = ideas.filter((i) => i.is_published);
  const unpublished = ideas.filter((i) => !i.is_published);

  const shareUrl = userId ? `${window.location.origin}/trader-blog/${userId}` : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Share link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — copy it manually from the box above.");
    }
  };

  const handleUnpublish = async (id) => {
    const result = await setIdeaPublished(id, false);
    if (!result.success) {
      toast.error(result.error.message || "Could not unpublish");
      return;
    }
    toast.success("Removed from Traders Blog");
    refresh();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Lightbulb className="text-indigo-600" size={22} /> Traders Blog
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Ideas you publish here show up on your public share link below — no login needed.
        </p>
      </div>

      {/* Share link */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wide mb-3">
          Your public share link
        </h3>
        {userId ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 min-w-0">
              <Link2 size={15} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-800 truncate font-mono">{shareUrl}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                {copied ? <Check size={15} /> : <Link2 size={15} />}
                {copied ? "Copied" : "Copy link"}
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-400 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <ExternalLink size={15} /> Preview
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sign in to get your share link.</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Anyone with this link sees only your published ideas below — nothing else in your
          journal is exposed.
        </p>
      </div>

      {/* Published ideas */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Published ({published.length})</h2>
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : published.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm text-gray-500">
            Nothing published yet. Head to Traders Ideas and hit "Publish" on an idea to share it
            here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {published.map((i) => (
              <TraderIdeaCard key={i.id} idea={i} onUnpublish={handleUnpublish} />
            ))}
          </div>
        )}
      </div>

      {/* Quick reminder of what's waiting to be shared */}
      {!loading && unpublished.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
          {unpublished.length} more idea{unpublished.length === 1 ? "" : "s"} logged but not
          published yet.{" "}
          <a href="/dashboard/tradersidea" className="font-medium text-indigo-600 underline">
            Go publish this week's idea
          </a>
        </div>
      )}
    </div>
  );
}

export default TradersBlog;
