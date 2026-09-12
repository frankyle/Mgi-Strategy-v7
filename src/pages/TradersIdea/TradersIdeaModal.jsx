// TradersIdeaModal.jsx
import TradersIdeaForm from "./TradersIdeaForm";
import { X } from 'lucide-react'; // Added missing X import

function TradersIdeaModal({ initialData, onSave, onClose }) {
  return (
    // REVISION: Full-screen background with improved backdrop, starts at the top of the screen
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      
      {/* REVISION: Modal Container uses full height/width on mobile, scrolls well */}
      <div className="bg-white w-full max-w-6xl h-full sm:h-auto sm:max-h-[95vh] mt-0 sm:mt-8 rounded-none sm:rounded-2xl shadow-xl p-4 sm:p-6 animate-scaleIn relative overflow-y-auto">

        {/* Close Button: Absolute positioned, styled for visibility */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors z-10 p-2 rounded-full bg-white/70 hover:bg-white border border-gray-200 shadow-md"
          aria-label="Close Modal"
        >
          <X size={20} />
        </button>

        {/* Form is rendered here */}
        <TradersIdeaForm
          initialData={initialData}
          onSubmit={onSave}
          onClose={onClose}
        />

      </div>
    </div>
  );
}

export default TradersIdeaModal;