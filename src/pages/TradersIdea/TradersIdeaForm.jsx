// TradersIdeaForm.jsx
import React, { useState, useEffect } from "react";
import { Upload, X, Calendar, DollarSign, BarChart2 } from 'lucide-react'; 

// Array defining the days and their corresponding keys
const DAY_FIELDS = [
  { key: "monday_image", label: "Monday" },
  { key: "tuesday_image", label: "Tuesday" },
  { key: "wednesday_image", label: "Wednesday" },
  { key: "thursday_image", label: "Thursday" },
  { key: "friday_image", label: "Friday" },
  { key: "saturday_image", label: "Saturday (Optional)" },
  { key: "sunday_image", label: "Sunday (Optional)" },
];

function TradersIdeaForm({ initialData, onSubmit, onClose }) {
  const today = new Date().toISOString().split("T")[0];

  // Helper to safely extract image keys from initialData
  const getInitialImageState = (data) => {
    return DAY_FIELDS.reduce((acc, field) => {
      acc[field.key] = data?.[field.key] || null;
      return acc;
    }, {});
  };

  const initialImageState = getInitialImageState(initialData);

  const [form, setForm] = useState({
    date: initialData?.date || today,
    pair: initialData?.pair || "",
    signal: initialData?.signal || "Buy",
    ...initialImageState,
  });

  const [previews, setPreviews] = useState({
    ...initialImageState,
  });

  useEffect(() => {
    if (initialData) {
      setForm((f) => ({
        ...f,
        date: initialData.date || today,
        pair: initialData.pair || "",
        signal: initialData.signal || "Buy",
        ...getInitialImageState(initialData),
      }));

      setPreviews(getInitialImageState(initialData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    
    setForm((prev) => ({ ...prev, [name]: file })); 

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prevState) => ({ ...prevState, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews((prevState) => ({ ...prevState, [name]: null }));
    }
  };
  
  const clearImage = (name) => {
    setPreviews((prevState) => ({ ...prevState, [name]: null }));
    setForm((prev) => ({ ...prev, [name]: null }));
  };


  const handleSubmit = () => {
    if (!form.pair?.trim()) {
      alert("Please enter a valid currency pair (e.g. XAUUSD).");
      return;
    }
    if (!form.date) {
      alert("Please select a date.");
      return;
    }

    onSubmit(form);
  };

  // --- ImageInput Component with Professional Design ---
  const ImageInput = ({ label, name }) => (
    // Adjusted padding for better mobile fit
    <div className="flex flex-col items-center gap-2 group p-1 sm:p-2 rounded-lg transition-all duration-200 hover:bg-blue-50/50">
      <p className="text-sm font-semibold text-gray-700 text-center leading-tight">
        {label}
      </p>

      {/* Reduced size for better mobile fit */}
      <div className="w-full max-w-[100px] h-[100px] sm:max-w-[120px] sm:h-[120px] border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex items-center justify-center bg-white relative shadow-inner transition-all group-hover:border-blue-500">
        {previews[name] ? (
          <>
            <img 
              src={previews[name]} 
              alt={`${label} Preview`} 
              className="w-full h-full object-cover" 
            />
            {/* Clear Button */}
            <button
              type="button"
              onClick={() => clearImage(name)}
              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition shadow-lg z-10"
              aria-label={`Clear ${label} image`}
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center text-gray-400 p-2">
            <Upload size={20} className="mb-1 text-blue-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-xs font-medium">Upload Chart</span>
          </div>
        )}
      </div>

      <input 
        type="file" 
        accept="image/*" 
        name={name} 
        onChange={handleImage} 
        className="text-xs w-full mt-1 cursor-pointer 
                   file:mr-2 file:py-1 file:px-2 file:rounded-md 
                   file:border-0 file:text-xs file:font-medium 
                   file:bg-blue-100 file:text-blue-700 
                   hover:file:bg-blue-200" 
      />
    </div>
  );
  // --- End ImageInput Component ---


  return (
    // Main container now has minimal internal styling, relying on the Modal for context
    <div className="w-full max-w-full mx-auto space-y-6 sm:space-y-8"> 
      
      {/* Header */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center pb-4 border-b-4 border-blue-600/10">
        <BarChart2 className="inline-block mr-2 sm:mr-3 text-blue-600" size={24} />
        {initialData ? "Edit Weekly Trading Idea" : "New Weekly Trading Idea"}
      </h2>

      {/* Primary Inputs */}
      {/* Uses smaller gap on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"> 
        
        {/* Date Input */}
        <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="date" 
              name="date" 
              value={form.date} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-xl p-3 pl-10 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-gray-700" 
              aria-label="Trade Date"
            />
        </div>

        {/* Pair Input */}
        <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              name="pair" 
              value={form.pair} 
              onChange={handleChange} 
              placeholder="Pair (e.g. XAUUSD)" 
              className="w-full border border-gray-300 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm" 
              aria-label="Currency Pair"
            />
        </div>

        {/* Signal Select */}
        <div className="relative">
            <select 
              name="signal" 
              value={form.signal} 
              onChange={handleChange} 
              className={`w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white shadow-sm font-semibold transition-colors 
                ${form.signal === 'Buy' ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}`}
              aria-label="Trade Signal"
            >
              <option value="Buy">BUY Signal (Long) ↑</option>
              <option value="Sell">SELL Signal (Short) ↓</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                {/* Custom chevron or arrow */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
      </div>

      {/* Chart Image Inputs: Weekly Grid */}
      <div className="space-y-4 pt-4">
        <p className="text-lg font-bold text-gray-800 border-t pt-4">📅 Daily Chart Analysis</p>
        
        {/* REVISED GRID: 2 cols on smallest mobile, 3 on small, 4 on medium, 7 on large desktop */}
        {/* Note: If you don't have 'xs:grid-cols-3' in your Tailwind config, change 'xs:' to 'sm:' */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 justify-center">
          {DAY_FIELDS.map(({ key, label }) => ( 
            <ImageInput 
              key={key} 
              label={label} 
              name={key}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
        <button 
          onClick={onClose} 
          className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors border border-gray-300 w-full sm:w-auto order-2 sm:order-1"
        >
          Cancel
        </button>

        <button 
          onClick={handleSubmit} 
          className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold transition-colors shadow-md hover:shadow-lg w-full sm:w-auto order-1 sm:order-2"
        >
          Save Idea
        </button>
      </div>
    </div>
  );
}

export default TradersIdeaForm;