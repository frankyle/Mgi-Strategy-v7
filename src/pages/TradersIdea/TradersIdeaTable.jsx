// TradersIdeaTable.jsx
import React, { useState, useMemo } from "react";
import {
  Pencil,
  Trash2,
  Share2,
  FileText,
  EyeOff,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import toast from "react-hot-toast";
import ImageGalleryModal from "./ImageGalleryModal";
import ImagePreviewOnHover from "./ImagePreviewOnHover";
import PublishModal from "./PublishModal";
import { setIdeaPublished } from "./TradersIdeaService";
import { sendIdeaToReport } from "./TradersReportService";

function TradersIdeaTable({ ideas = [], onEdit, onDelete, onChange }) {
  const handleSendToReport = async (item) => {
    const msg =
      `Send ${item.pair} (${item.date}) to the Weekly Report?\n\n` +
      "It will be moved out of Traders Ideas into the report." +
      (item.is_published ? " It will also be removed from the Traders Blog." : "");
    if (!window.confirm(msg)) return;
    const res = await sendIdeaToReport(item);
    if (!res.success) {
      toast.error(res.error.message || "Could not send to report");
      return;
    }
    toast.success("Sent to Weekly Report");
    onChange && onChange();
  };

  const [publishTarget, setPublishTarget] = useState(null);

  const handleUnpublish = async (id) => {
    const result = await setIdeaPublished(id, false);
    if (!result.success) {
      toast.error(result.error.message || "Could not unpublish");
      return;
    }
    toast.success("Removed from Traders Blog");
    onChange?.();
  };
  /* =======================
     IMAGE GALLERY STATE
  ======================== */
  const [galleryState, setGalleryState] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
  });

  /* =======================
     PAIR SORT STATE
  ======================== */
  const [pairSort, setPairSort] = useState("none"); 
  // none | asc | desc

  const togglePairSort = () => {
    setPairSort((prev) =>
      prev === "none" ? "asc" : prev === "asc" ? "desc" : "none"
    );
  };

  /* =======================
     SORTED IDEAS
  ======================== */
  const sortedIdeas = useMemo(() => {
    if (pairSort === "none") return ideas;

    return [...ideas].sort((a, b) => {
      const pairA = (a.pair || "").toUpperCase();
      const pairB = (b.pair || "").toUpperCase();

      if (pairSort === "asc") return pairA.localeCompare(pairB);
      if (pairSort === "desc") return pairB.localeCompare(pairA);
      return 0;
    });
  }, [ideas, pairSort]);

  /* =======================
     HELPERS
  ======================== */
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const getSignalIcon = (signal) => {
    if (!signal) return null;
    return signal.toLowerCase() === "buy" ? (
      <TrendingUp className="w-5 h-5 text-green-600" />
    ) : (
      <TrendingDown className="w-5 h-5 text-red-600" />
    );
  };

  const weekly = [
    { key: "monday_image", day: "Monday" },
    { key: "tuesday_image", day: "Tuesday" },
    { key: "wednesday_image", day: "Wednesday" },
    { key: "thursday_image", day: "Thursday" },
    { key: "friday_image", day: "Friday" },
    { key: "saturday_image", day: "Saturday" },
    { key: "sunday_image", day: "Sunday" },
  ];

  const handleImageClick = (item, clickedKey) => {
    const imagesList = weekly
      .map(({ key, day }) => ({
        day,
        url: item[key],
      }))
      .filter((img) => img.url);

    const initialIndex = imagesList.findIndex(
      (img) => img.url === item[clickedKey]
    );

    setGalleryState({
      isOpen: true,
      images: imagesList,
      initialIndex: initialIndex > -1 ? initialIndex : 0,
    });
  };

  const closeModal = () => {
    setGalleryState({ isOpen: false, images: [], initialIndex: 0 });
  };

  const renderImageCell = (src, alt, dayKey, item) => {
    if (!src) return <span className="text-gray-400 text-xl">–</span>;

    return (
      <ImagePreviewOnHover
        src={src}
        alt={alt}
        onImageClick={() => handleImageClick(item, dayKey)}
      />
    );
  };

  /* =======================
     RENDER
  ======================== */
  return (
    <div className="w-full">
      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto rounded-2xl shadow-lg border border-gray-100">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-700 border-b">
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase w-[100px]">
                Date
              </th>

              {/* ✅ SORTABLE PAIR HEADER */}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                <button
                  onClick={togglePairSort}
                  className="flex items-center gap-1 hover:text-indigo-600 transition"
                >
                  Pair
                  <span className="text-xs">
                    {pairSort === "asc" && "▲"}
                    {pairSort === "desc" && "▼"}
                    {pairSort === "none" && "⇅"}
                  </span>
                </button>
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase w-[100px]">
                Signal
              </th>

              {weekly.map(({ key, day }) => (
                <th
                  key={key}
                  className="px-1 py-3 text-center text-xs font-semibold uppercase"
                >
                  {day.slice(0, 3)}
                </th>
              ))}

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase w-[80px]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {sortedIdeas.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="text-center py-12 text-gray-500 italic"
                >
                  No trader ideas yet.
                </td>
              </tr>
            ) : (
              sortedIdeas.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-3 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(item.date)}
                    </div>
                  </td>

                  <td className="px-4 py-3 font-medium text-sm">
                    {item.pair}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                        item.signal?.toLowerCase() === "buy"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {getSignalIcon(item.signal)}
                      {item.signal?.toUpperCase()}
                    </span>
                  </td>

                  {weekly.map(({ key, day }) => (
                    <td key={key} className="px-1 py-3 text-center">
                      {renderImageCell(item[key], day, key, item)}
                    </td>
                  ))}

                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-amber-600 hover:bg-amber-100 rounded-full"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      {item.is_published ? (
                        <button
                          onClick={() => handleUnpublish(item.id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full"
                          title="Published — click to remove from blog"
                        >
                          <EyeOff size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setPublishTarget(item)}
                          className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full"
                          title="Publish to Traders Blog"
                        >
                          <Share2 size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleSendToReport(item)}
                        className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-full"
                        title="Send to Weekly Report (moves it out of this list)"
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PHONE CARDS ================= */}
      <div className="md:hidden space-y-3">
        {sortedIdeas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-500">
            No trader ideas yet. Tap + to add one.
          </div>
        ) : (
          sortedIdeas.map((item) => {
            const isBuy = item.signal?.toLowerCase() === "buy";
            const imgs = weekly.filter(({ key }) => item[key]);
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden border-l-4 ${
                  isBuy ? "border-l-green-500" : "border-l-red-500"
                } border-gray-100`}
              >
                <div className="p-4 pb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-gray-900 truncate">{item.pair}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(item.date)}
                      {item.is_published && (
                        <span className="ml-2 text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full">
                          Published
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isBuy ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {getSignalIcon(item.signal)}
                    {item.signal?.toUpperCase()}
                  </span>
                </div>

                {/* chart thumbnails — tap to open */}
                <div className="px-4 pb-3">
                  {imgs.length === 0 ? (
                    <p className="text-xs text-gray-400">No charts added</p>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                      {imgs.map(({ key, day }) => (
                        <button
                          key={key}
                          onClick={() => handleImageClick(item, key)}
                          className="shrink-0 text-center"
                        >
                          <img
                            src={item[key]}
                            alt={`${item.pair} ${day}`}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <span className="block text-[10px] font-medium text-gray-500 mt-0.5">
                            {day.slice(0, 3)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* actions */}
                <div className="grid grid-cols-4 border-t border-gray-100 divide-x divide-gray-100 text-[11px] font-semibold">
                  <button
                    onClick={() => onEdit(item)}
                    className="flex flex-col items-center gap-1 py-3 text-amber-600 active:bg-amber-50"
                  >
                    <Pencil size={18} /> Edit
                  </button>
                  {item.is_published ? (
                    <button
                      onClick={() => handleUnpublish(item.id)}
                      className="flex flex-col items-center gap-1 py-3 text-indigo-600 active:bg-indigo-50"
                    >
                      <EyeOff size={18} /> Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={() => setPublishTarget(item)}
                      className="flex flex-col items-center gap-1 py-3 text-indigo-600 active:bg-indigo-50"
                    >
                      <Share2 size={18} /> Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleSendToReport(item)}
                    className="flex flex-col items-center gap-1 py-3 text-emerald-600 active:bg-emerald-50"
                  >
                    <FileText size={18} /> Report
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="flex flex-col items-center gap-1 py-3 text-red-600 active:bg-red-50"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= IMAGE GALLERY ================= */}
      {galleryState.isOpen && (
        <ImageGalleryModal
          images={galleryState.images}
          initialIndex={galleryState.initialIndex}
          onClose={closeModal}
        />
      )}

      {/* ================= PUBLISH MODAL ================= */}
      {publishTarget && (
        <PublishModal
          idea={publishTarget}
          onClose={() => setPublishTarget(null)}
          onPublished={() => {
            setPublishTarget(null);
            onChange?.();
          }}
        />
      )}
    </div>
  );
}

export default TradersIdeaTable;
