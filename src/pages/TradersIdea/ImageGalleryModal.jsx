// ImageGalleryModal.jsx (FIXED)
import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

function ImageGalleryModal({ images = [], initialIndex = 0, onClose }) {
  
  // 1. Hook Call: useState (MUST COME FIRST)
  // Filter out null/empty images inside the render function
  const validImages = images.filter(img => img.url);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // 2. Hook Call: useEffect (Initial Index Check)
  useEffect(() => {
    if (initialIndex >= validImages.length) {
        setCurrentIndex(0);
    } else {
        setCurrentIndex(initialIndex);
    }
  }, [validImages.length, initialIndex]);

  // 3. Hook Call: useEffect (Keyboard Navigation)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validImages.length]);

  // 4. Conditional Exit (MUST COME AFTER ALL HOOKS)
  if (validImages.length === 0) {
    onClose();
    return null;
  }

  // --- Logic Functions ---
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? validImages.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === validImages.length - 1 ? 0 : prevIndex + 1));
  };
  
  const currentImage = validImages[currentIndex];


  // --- Render ---
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      {/* ... rest of the component content ... */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-50 p-2 rounded-full bg-black/50"
        aria-label="Close image gallery"
      >
        <X size={28} />
      </button>

      <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center">

        {/* Previous Button */}
        {validImages.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-0 lg:left-[-60px] text-white hover:text-gray-300 transition z-40 p-3 lg:p-4 rounded-full bg-black/50 hover:bg-black/70 ml-2"
              aria-label="Previous image"
            >
              <ChevronLeft size={36} />
            </button>
        )}

        {/* Image Container */}
        <div className="w-full h-full flex items-center justify-center">
            <img 
              src={currentImage.url} 
              alt={`Trading Idea - ${currentImage.day}`} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
            />
        </div>
        
        {/* Next Button */}
        {validImages.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-0 lg:right-[-60px] text-white hover:text-gray-300 transition z-40 p-3 lg:p-4 rounded-full bg-black/50 hover:bg-black/70 mr-2"
              aria-label="Next image"
            >
              <ChevronRight size={36} />
            </button>
        )}

        {/* Image Counter */}
        {validImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-1.5 rounded-full text-sm font-medium">
              {currentIndex + 1} / {validImages.length} ({currentImage.day})
            </div>
        )}

      </div>
    </div>
  );
}

export default ImageGalleryModal;