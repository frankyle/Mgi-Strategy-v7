// ImagePreviewOnHover.jsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';

function ImagePreviewOnHover({ src, alt, onImageClick }) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="relative inline-block" // Essential for positioning the tooltip
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* 1. The main clickable image/button */}
      <button 
        onClick={onImageClick}
        className="block mx-auto group relative" 
        aria-label={`View image for ${alt}`}
      >
        <img 
          src={src} 
          alt={alt} 
          className="w-14 h-14 mx-auto object-cover rounded-lg border-2 border-gray-200 shadow-sm transition-transform cursor-pointer group-hover:scale-[1.05]" 
        />
        {/* Hover Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <Search className="w-6 h-6 text-white" />
        </div>
      </button>

      {/* 2. The Pop-up/Magnified Preview */}
      {isHovering && (
        <div
          // Position the pop-up (adjust top/left/transform for best placement)
          className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-full mt-4 p-1 bg-white rounded-lg shadow-xl border border-gray-100 animate-zoomIn pointer-events-none"
          style={{ width: '200px', height: '200px' }} // Define a fixed preview size
        >
          <img
            src={src}
            alt={`Preview of ${alt}`}
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
}

export default ImagePreviewOnHover;