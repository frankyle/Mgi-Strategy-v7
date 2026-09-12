import PersonalAccountForm from "./PersonalAccountForm";

function PersonalAccountModal({ initialData, onSave, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 animate-scaleIn">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {initialData ? "Edit Personal Trade" : "Add Personal Trade"}
        </h2>

        <PersonalAccountForm
          initialData={initialData}
          onSubmit={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

export default PersonalAccountModal;
