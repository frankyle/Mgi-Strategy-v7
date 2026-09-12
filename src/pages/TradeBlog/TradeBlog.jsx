import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { Link2, Check, Newspaper, ExternalLink } from "lucide-react";
import { getSetups, setSetupPublished } from "../SetupMatchGrader/SetupMatchGraderService";
import { supabase } from "../../supabaseClient";
import TradeIdeaCard from "./TradeIdeaCard";

function TradeBlog() {
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [copied, setCopied] = useState(false);

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
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    init();
    refresh();
  }, []);

  const published = setups.filter((s) => s.is_published);
  const unpublished = setups.filter((s) => !s.is_published);

  const shareUrl = userId ? `${window.location.origin}/blog/${userId}` : "";

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
    const result = await setSetupPublished(id, false);
    if (!result.success) {
      toast.error(result.error.message || "Could not unpublish");
      return;
    }
    toast.success("Removed from Trade Blog");
    refresh();
  };

  return (
    <div className="-m-4 sm:-m-6 bg-base min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-6 space-y-6">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-2xl font-semibold text-ink flex items-center gap-2">
          <Newspaper className="text-long" size={22} /> Trade Blog
        </h1>
        <p className="text-sm text-muted mt-1">
          Setups you publish here show up on your public share link below, AND inside the app
          on every member's Signals page — no login needed for the share link.
        </p>
      </div>

      {/* Share link */}
      <div className="max-w-6xl mx-auto bg-panel border border-line p-5 sm:p-6">
        <h3 className="text-xs font-mono text-muted uppercase tracking-wide mb-3">
          Your public share link
        </h3>
        {userId ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 bg-panel2 border border-line px-3 py-2.5 min-w-0">
              <Link2 size={15} className="text-muted shrink-0" />
              <span className="text-sm text-ink truncate font-mono">{shareUrl}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 bg-long text-base text-sm font-medium px-4 py-2.5 hover:bg-long/90 transition-colors"
              >
                {copied ? <Check size={15} /> : <Link2 size={15} />}
                {copied ? "Copied" : "Copy link"}
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 border border-line text-muted hover:text-ink hover:border-muted text-sm font-medium px-4 py-2.5 transition-colors"
              >
                <ExternalLink size={15} /> Preview
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Sign in to get your share link.</p>
        )}
        <p className="text-xs text-muted mt-2">
          Anyone with this link sees only your published setups below — nothing else in your
          journal is exposed.
        </p>
      </div>

      {/* Published ideas */}
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-lg font-semibold text-ink mb-3">
          Published ({published.length})
        </h2>
        {loading ? (
          <div className="text-sm text-muted">Loading…</div>
        ) : published.length === 0 ? (
          <div className="bg-panel border border-line p-10 text-center text-sm text-muted">
            Nothing published yet. Head to Setup Match Grader and hit "Publish" on a graded setup
            to share it here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {published.map((s) => (
              <TradeIdeaCard key={s.id} setup={s} onUnpublish={handleUnpublish} />
            ))}
          </div>
        )}
      </div>

      {/* Quick reminder of what's waiting to be shared */}
      {!loading && unpublished.length > 0 && (
        <div className="max-w-6xl mx-auto bg-panel2 border border-steel/40 p-4 text-sm text-ink">
          {unpublished.length} more graded setup{unpublished.length === 1 ? "" : "s"} logged but not
          published yet.{" "}
          <a href="/dashboard/setup-match-grader" className="font-medium text-long underline">
            Go publish this week's idea
          </a>
        </div>
      )}
    </div>
  );
}

export default TradeBlog;
