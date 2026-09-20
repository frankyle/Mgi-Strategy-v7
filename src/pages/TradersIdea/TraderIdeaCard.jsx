import React, { useState } from "react";
import { Calendar, EyeOff, TrendingUp, TrendingDown } from "lucide-react";

export const PACKAGE_META = {
  starter: { label: "Starter", cls: "text-gray-600 border-gray-300 bg-gray-100" },
  pro: { label: "Pro", cls: "text-indigo-700 border-indigo-300 bg-indigo-50" },
  mentorship: { label: "Mentorship", cls: "text-amber-700 border-amber-300 bg-amber-50" },
};

const WEEKLY = [
  { key: "monday_image", day: "Mon" },
  { key: "tuesday_image", day: "Tue" },
  { key: "wednesday_image", day: "Wed" },
  { key: "thursday_image", day: "Thu" },
  { key: "friday_image", day: "Fri" },
  { key: "saturday_image", day: "Sat" },
  { key: "sunday_image", day: "Sun" },
];

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TraderIdeaCard({ idea, onUnpublish, readOnly = false }) {
  const [zoomImg, setZoomImg] = useState(null);
  const isBuy = idea.signal?.toLowerCase() === "buy";
  const pkgMeta = idea.package ? PACKAGE_META[idea.package] : null;
  const images = WEEKLY.map(({ key, day }) => ({ day, url: idea[key] })).filter((i) => i.url);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">{idea.pair}</h3>
              <span
                className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                  isBuy ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {isBuy ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {idea.signal?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5">
              <Calendar size={12} />
              {formatDate(idea.published_at || idea.date)}
            </div>
          </div>
          {pkgMeta && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${pkgMeta.cls}`}>
              {pkgMeta.label}
            </span>
          )}
        </div>

        {idea.caption && (
          <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-3 mb-4 leading-relaxed">
            {idea.caption}
          </p>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((img) => (
              <button key={img.day} onClick={() => setZoomImg(img.url)} className="block group">
                <img
                  src={img.url}
                  alt={`${idea.pair} ${img.day}`}
                  className="w-full h-20 sm:h-24 object-cover rounded-lg border border-gray-100 group-hover:border-gray-300 transition-colors"
                />
                <span className="text-[10px] text-gray-400 mt-1 block text-center">{img.day}</span>
              </button>
            ))}
          </div>
        )}

        {!readOnly && (
          <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => onUnpublish?.(idea.id)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
            >
              <EyeOff size={13} /> Remove from blog
            </button>
          </div>
        )}
      </div>

      {zoomImg && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setZoomImg(null)}
        >
          <img src={zoomImg} alt="Zoomed chart" className="max-h-[85vh] max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
