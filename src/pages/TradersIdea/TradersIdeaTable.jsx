// TradersIdeaTable.jsx
import React, { useState, useMemo } from "react";
import {
  Pencil,
  Trash2,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import ImageGalleryModal from "./ImageGalleryModal";
import ImagePreviewOnHover from "./ImagePreviewOnHover";

function TradersIdeaTable({ ideas = [], onEdit, onDelete }) {
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
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full"
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

      {/* ================= IMAGE GALLERY ================= */}
      {galleryState.isOpen && (
        <ImageGalleryModal
          images={galleryState.images}
          initialIndex={galleryState.initialIndex}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default TradersIdeaTable;
