// WeeklyReport.jsx
// Ideas sent from Traders Ideas live in trader_idea_reports, grouped by trading week (Mon–Sun).
import React, { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  Trash2,
  Pencil,
  AlertCircle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { getReports, deleteReport } from "./TradersReportService";
import ImageGalleryModal from "./ImageGalleryModal";
import ReportReviewModal from "./ReportReviewModal";
import { groupByWeek, ideaFacts, summarizeWeek, currentWeekKey } from "./weekUtils";

const DAYS = [
  { key: "monday_image", day: "Monday" },
  { key: "tuesday_image", day: "Tuesday" },
  { key: "wednesday_image", day: "Wednesday" },
  { key: "thursday_image", day: "Thursday" },
  { key: "friday_image", day: "Friday" },
  { key: "saturday_image", day: "Saturday" },
  { key: "sunday_image", day: "Sunday" },
];

const fmtR = (r) => (r === null || r === undefined ? "–" : `${r > 0 ? "+" : ""}${r}R`);
const rColor = (r) =>
  r === null ? "text-gray-400" : r > 0 ? "text-green-600" : r < 0 ? "text-red-600" : "text-gray-600";

const fmtDate = (s) =>
  s
    ? new Date(`${String(s).slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "-";

/* ---------- exports ---------- */

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const downloadBlob = (name, blob) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

const exportCsv = (weeks, filename) => {
  const head = [
    "Week", "Date", "Pair", "Signal", "Caption",
    "A-checks passed", "Mood", "Followed plan", "Result (R)", "Notes",
  ];
  const rows = [];
  weeks.forEach((w) =>
    w.ideas.forEach((i) => {
      const f = ideaFacts(i);
      rows.push([
        w.label,
        i.date,
        i.pair,
        i.signal,
        i.caption || "",
        f.checksPassed === null ? "" : `${f.checksPassed}/${f.checksTotal}`,
        f.mood || "",
        f.followedPlan === null ? "" : f.followedPlan ? "Yes" : "No",
        f.resultR === null ? "" : f.resultR,
        f.notes,
      ]);
    })
  );
  const csv = [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  downloadBlob(filename, new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }));
};

const exportWeekPdf = (week) => {
  const doc = new jsPDF();
  const W = 180;
  let y = 18;
  const line = (text, size = 10, bold = false) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.splitTextToSize(String(text), W).forEach((l) => {
      if (y > 280) {
        doc.addPage();
        y = 18;
      }
      doc.text(l, 15, y);
      y += size * 0.5 + 2;
    });
  };

  const s = week.summary;
  line("MGI Weekly Trading Report", 16, true);
  line(week.label, 12);
  y += 2;
  line(
    `${s.count} idea${s.count === 1 ? "" : "s"} | ${s.buys} Buy / ${s.sells} Sell | ` +
      `A setups: ${s.aSetups} | Plan followed: ${s.planPct === null ? "-" : s.planPct + "%"} | ` +
      `Result: ${fmtR(s.totalR)}`
  );
  line(`Pairs: ${s.pairs.join(", ") || "-"}`);
  y += 4;

  week.ideas.forEach((i) => {
    const f = ideaFacts(i);
    line(`${i.date}  ${i.pair}  ${i.signal?.toUpperCase()}  ${fmtR(f.resultR)}`, 11, true);
    line(
      `A-checks: ${f.checksPassed === null ? "-" : `${f.checksPassed}/${f.checksTotal}`}   ` +
        `Mood: ${f.mood || "-"}   Followed plan: ${f.followedPlan === null ? "-" : f.followedPlan ? "Yes" : "No"}`
    );
    if (i.caption) line(`Idea: ${i.caption}`);
    if (f.notes) line(`Notes: ${f.notes}`);
    y += 3;
  });

  doc.save(`weekly-report-${week.key}.pdf`);
};

/* ---------- small pieces ---------- */

function Tile({ label, value, sub, tone = "text-gray-900" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-[11px] font-mono uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${tone}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function IdeaRow({ idea, onOpenImages, onDelete, onEdit }) {
  const f = ideaFacts(idea);
  const hl = f.needsReview ? "bg-amber-50" : "";
  const isBuy = idea.signal?.toLowerCase() === "buy";
  const images = DAYS.map(({ key, day }) => ({ day, url: idea[key] })).filter((i) => i.url);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-3 text-sm whitespace-nowrap">{fmtDate(idea.date)}</td>
      <td className="px-3 py-3 text-sm font-semibold">{idea.pair}</td>
      <td className="px-3 py-3">
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            isBuy ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isBuy ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {idea.signal?.toUpperCase()}
        </span>
      </td>
      {/* Review fields — amber while they still need filling in */}
      <td className={`px-3 py-3 text-sm text-center ${hl}`}>
        {f.checksPassed === null ? (
          <span className="text-gray-400">–</span>
        ) : (
          <span className={f.isASetup ? "font-bold text-green-700" : "text-gray-700"}>
            {f.checksPassed}/{f.checksTotal}
          </span>
        )}
      </td>
      <td className={`px-3 py-3 text-sm text-gray-700 ${hl}`}>{f.mood || "–"}</td>
      <td className={`px-3 py-3 text-sm text-center ${hl}`}>
        {f.followedPlan === null ? "–" : f.followedPlan ? "Yes" : "No"}
      </td>
      <td className={`px-3 py-3 text-sm font-semibold text-center ${hl} ${rColor(f.resultR)}`}>
        {f.needsReview ? (
          <button
            onClick={() => onEdit(idea)}
            className="text-xs font-bold text-amber-800 bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded-full whitespace-nowrap"
          >
            Fill in
          </button>
        ) : (
          fmtR(f.resultR)
        )}
      </td>
      <td className="px-3 py-3 text-center whitespace-nowrap">
        <button
          onClick={() => onEdit(idea)}
          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-full"
          title="Edit A-checks, mood, plan, result"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(idea)}
          className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
          title="Delete from report"
        >
          <Trash2 size={15} />
        </button>
      </td>
      <td className="px-3 py-3">
        {images.length === 0 ? (
          <span className="text-gray-300">–</span>
        ) : (
          <div className="flex gap-1">
            {images.map((img, idx) => (
              <button
                key={img.day}
                onClick={() => onOpenImages(images, idx)}
                title={img.day}
                className="shrink-0"
              >
                <img
                  src={img.url}
                  alt={`${idea.pair} ${img.day}`}
                  className="w-10 h-10 object-cover rounded border border-gray-200 hover:border-indigo-400"
                />
              </button>
            ))}
          </div>
        )}
      </td>
    </tr>
  );
}

function IdeaCard({ idea, onOpenImages, onDelete, onEdit }) {
  const f = ideaFacts(idea);
  const isBuy = idea.signal?.toLowerCase() === "buy";
  const images = DAYS.map(({ key, day }) => ({ day, url: idea[key] })).filter((i) => i.url);

  return (
    <div className={`p-4 border-l-4 ${isBuy ? "border-l-green-500" : "border-l-red-500"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-gray-900">{idea.pair}</p>
          <p className="text-xs text-gray-500">{fmtDate(idea.date)}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            isBuy ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isBuy ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {idea.signal?.toUpperCase()}
        </span>
      </div>

      {/* the four fields you fill in */}
      <div
        className={`mt-3 grid grid-cols-4 gap-2 rounded-xl p-2.5 text-center ${
          f.needsReview ? "bg-amber-50 border border-amber-200" : "bg-gray-50"
        }`}
      >
        <div>
          <p className="text-[10px] uppercase text-gray-400">A-checks</p>
          <p className={`text-sm font-semibold ${f.isASetup ? "text-green-700" : "text-gray-700"}`}>
            {f.checksPassed === null ? "–" : `${f.checksPassed}/${f.checksTotal}`}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-gray-400">Mood</p>
          <p className="text-sm font-semibold text-gray-700 truncate">{f.mood || "–"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-gray-400">Plan</p>
          <p className="text-sm font-semibold text-gray-700">
            {f.followedPlan === null ? "–" : f.followedPlan ? "Yes" : "No"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-gray-400">Result</p>
          <p className={`text-sm font-bold ${rColor(f.resultR)}`}>
            {f.needsReview ? "Fill in" : fmtR(f.resultR)}
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mt-3 pb-1">
          {images.map((img, idx) => (
            <button key={img.day} onClick={() => onOpenImages(images, idx)} className="shrink-0 text-center">
              <img
                src={img.url}
                alt={`${idea.pair} ${img.day}`}
                className="w-14 h-14 object-cover rounded-lg border border-gray-200"
              />
              <span className="block text-[10px] text-gray-500 mt-0.5">{img.day.slice(0, 3)}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onEdit(idea)}
          className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-xl ${
            f.needsReview ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700"
          }`}
        >
          <Pencil size={15} /> {f.needsReview ? "Fill in review" : "Edit review"}
        </button>
        <button
          onClick={() => onDelete(idea)}
          className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600"
          aria-label="Delete from report"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

function WeeklyReport() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("all"); // all | 4 | 12
  const [open, setOpen] = useState({});
  const [gallery, setGallery] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await getReports();
    setLoading(false);
    if (!res.success) {
      toast.error(res.error.message || "Could not load report");
      return;
    }
    setIdeas(res.data || []);
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (idea) => {
    if (!window.confirm(`Delete ${idea.pair} (${idea.date}) from the report permanently?`)) return;
    const res = await deleteReport(idea);
    if (!res.success) {
      toast.error(res.error.message || "Could not delete");
      return;
    }
    toast.success("Deleted from report");
    load();
  };

  const weeks = useMemo(() => {
    const q = search.trim().toUpperCase();
    const filtered = q ? ideas.filter((i) => (i.pair || "").toUpperCase().includes(q)) : ideas;
    let grouped = groupByWeek(filtered);
    if (range !== "all") grouped = grouped.slice(0, Number(range));
    return grouped;
  }, [ideas, search, range]);

  // open the newest week by default
  useEffect(() => {
    if (weeks.length && Object.keys(open).length === 0) {
      setOpen({ [weeks[0].key]: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeks]);

  const overall = useMemo(() => summarizeWeek(weeks.flatMap((w) => w.ideas)), [weeks]);
  const thisWeek = currentWeekKey();

  const toggle = (key) => setOpen((o) => ({ ...o, [key]: !o[key] }));
  const allOpen = weeks.length > 0 && weeks.every((w) => open[w.key]);
  const setAll = (v) => setOpen(Object.fromEntries(weeks.map((w) => [w.key, v])));

  return (
    <div className="p-1 sm:p-6 max-w-6xl mx-auto space-y-5 sm:space-y-6 animate-fadeIn">
      <Toaster position="top-center" />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-indigo-600" size={22} /> Weekly Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ideas you send here from Traders Ideas are moved into this report and kept by week
            (Mon–Sun), so the Traders Ideas list stays clear for new ideas.
          </p>
        </div>
        <button
          disabled={weeks.length === 0}
          onClick={() => exportCsv(weeks, `weekly-report-${new Date().toISOString().slice(0, 10)}.csv`)}
          className="flex items-center justify-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
        >
          <Download size={15} /> Export all (CSV)
        </button>
      </div>

      {/* What still needs your input */}
      {overall.needsReview > 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-bold">
              {overall.needsReview} idea{overall.needsReview === 1 ? "" : "s"} still need your review
            </p>
            <p className="mt-0.5">
              The highlighted columns (<b>A-checks, Mood, Plan, Result</b>) are yours to fill in.
              Click <b>Fill in</b> or the pencil on a row. An idea counts as done once you enter its
              Result (R), even if it is 0.
            </p>
          </div>
        </div>
      ) : (
        weeks.length > 0 && (
          <p className="text-xs text-gray-500">
            The ✎ columns (A-checks, Mood, Plan, Result) are editable. Use the pencil on any row.
          </p>
        )
      )}

      {/* Totals for what's currently shown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile label="Weeks logged" value={weeks.length} />
        <Tile
          label="Ideas"
          value={overall.count}
          sub={`${overall.buys} buy / ${overall.sells} sell · ${overall.aSetups} A setups`}
        />
        <Tile
          label="Total result"
          value={fmtR(overall.totalR)}
          tone={rColor(overall.totalR)}
          sub={overall.rCount ? `${overall.wins}W / ${overall.losses}L` : "no results logged yet"}
        />
        <Tile
          label="Plan followed"
          value={overall.planPct === null ? "–" : `${overall.planPct}%`}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by pair (e.g. XAUUSD)"
            className="w-full border border-gray-300 rounded-xl py-2.5 pl-9 pr-3 text-sm bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border border-gray-300 rounded-xl py-2.5 px-3 text-sm bg-white"
        >
          <option value="all">All weeks</option>
          <option value="4">Last 4 weeks</option>
          <option value="12">Last 12 weeks</option>
        </select>
        {weeks.length > 1 && (
          <button
            onClick={() => setAll(!allOpen)}
            className="border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        )}
      </div>

      {/* Weeks */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : weeks.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm text-gray-500">
          {ideas.length === 0
            ? "Nothing here yet. Use the report button on a row in Traders Ideas to send it here."
            : "No ideas match that filter."}
        </div>
      ) : (
        <div className="space-y-4">
          {weeks.map((w) => {
            const s = w.summary;
            const isOpen = !!open[w.key];
            return (
              <div key={w.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 p-4 sm:p-5">
                  <button
                    onClick={() => toggle(w.key)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                  >
                    {isOpen ? <ChevronDown size={18} className="shrink-0 text-gray-400" /> : <ChevronRight size={18} className="shrink-0 text-gray-400" />}
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                        {w.label}
                        {w.key === thisWeek && (
                          <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                            This week
                          </span>
                        )}
                      </p>
                      {(s.needsReview > 0 || s.totalR !== null) && (
                        <p className="sm:hidden text-xs font-semibold mt-0.5">
                          {s.totalR !== null && <span className={rColor(s.totalR)}>{fmtR(s.totalR)} </span>}
                          {s.needsReview > 0 && <span className="text-amber-700">· {s.needsReview} to review</span>}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {s.count} idea{s.count === 1 ? "" : "s"} · {s.buys} buy / {s.sells} sell ·{" "}
                        {s.pairs.join(", ")}
                      </p>
                    </div>
                  </button>
                  {s.needsReview > 0 && (
                    <span className="hidden sm:inline text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-1 rounded-full whitespace-nowrap">
                      {s.needsReview} to review
                    </span>
                  )}
                  <div className="hidden sm:block text-right mr-2">
                    <p className={`text-lg font-bold ${rColor(s.totalR)}`}>{fmtR(s.totalR)}</p>
                    <p className="text-[11px] text-gray-400">
                      plan {s.planPct === null ? "–" : `${s.planPct}%`} · {s.aSetups} A
                    </p>
                  </div>
                  <button
                    onClick={() => exportCsv([w], `weekly-report-${w.key}.csv`)}
                    className="text-xs font-medium text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-lg px-2.5 py-1.5"
                    title="Download this week as CSV"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => exportWeekPdf(w)}
                    className="text-xs font-medium text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-lg px-2.5 py-1.5"
                    title="Download this week as PDF"
                  >
                    PDF
                  </button>
                </div>

                {isOpen && (
                  <>
                  <div className="md:hidden border-t border-gray-100 divide-y divide-gray-100">
                    {w.ideas.map((i) => (
                      <IdeaCard
                        key={i.id}
                        idea={i}
                        onOpenImages={(images, idx) => setGallery({ images, idx })}
                        onDelete={handleDelete}
                        onEdit={setEditing}
                      />
                    ))}
                  </div>
                  <div className="hidden md:block overflow-x-auto border-t border-gray-100">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase">
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">Pair</th>
                          <th className="px-3 py-2 text-left">Signal</th>
                          <th className="px-3 py-2 text-center bg-amber-100 text-amber-800">✎ A-checks</th>
                          <th className="px-3 py-2 text-left bg-amber-100 text-amber-800">✎ Mood</th>
                          <th className="px-3 py-2 text-center bg-amber-100 text-amber-800">✎ Plan</th>
                          <th className="px-3 py-2 text-center bg-amber-100 text-amber-800">✎ Result</th>
                          <th className="px-3 py-2 text-center"></th>
                          <th className="px-3 py-2 text-left">Charts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {w.ideas.map((i) => (
                          <IdeaRow
                            key={i.id}
                            idea={i}
                            onOpenImages={(images, idx) => setGallery({ images, idx })}
                            onDelete={handleDelete}
                            onEdit={setEditing}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <ReportReviewModal
          report={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {gallery && (
        <ImageGalleryModal
          images={gallery.images}
          initialIndex={gallery.idx}
          onClose={() => setGallery(null)}
        />
      )}
    </div>
  );
}

export default WeeklyReport;
