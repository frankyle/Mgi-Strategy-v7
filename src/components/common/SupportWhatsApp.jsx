// SupportWhatsApp.jsx — customer-support WhatsApp, shown ONLY inside the signed-in app.
// It is loaded with React.lazy from DashboardLayout / AppSidebar, so the number lives in
// its own chunk that the public website never downloads.
import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { WHATSAPP_DISPLAY, whatsappLink } from "../../config/contact";

const MESSAGE = "Hello MGI Strategy support, I need help.";

export default function SupportWhatsApp({ variant = "floating", collapsed = false }) {
  if (variant === "sidebar") {
    return (
      <a
        href={whatsappLink(MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        title={collapsed ? `Customer support ${WHATSAPP_DISPLAY}` : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#25D366]/10 text-[#128C4A] hover:bg-[#25D366]/20 transition-colors ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <FaWhatsapp className="w-5 h-5 shrink-0" />
        {!collapsed && (
          <span className="leading-tight">
            <span className="block text-[10px] uppercase tracking-wide opacity-80">Customer support</span>
            <span className="block text-sm font-bold">{WHATSAPP_DISPLAY}</span>
          </span>
        )}
      </a>
    );
  }

  return (
    <a
      href={whatsappLink(MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Customer support on WhatsApp ${WHATSAPP_DISPLAY}`}
      className="fixed z-30 left-4 lg:left-auto lg:right-6 lg:bottom-6 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))]
        flex items-center justify-center gap-3 h-14 w-14 lg:w-auto lg:pl-4 lg:pr-5 rounded-full bg-[#25D366] text-white
        shadow-[0_8px_30px_rgba(37,211,102,0.45)] hover:bg-[#1ebe5b] active:scale-95 transition"
    >
      <span className="relative flex items-center justify-center">
        <span className="pulse-ring absolute h-9 w-9 rounded-full bg-white/50" />
        <FaWhatsapp className="relative" size={30} />
      </span>
      <span className="hidden lg:flex flex-col leading-tight text-left">
        <span className="text-[10px] uppercase tracking-wide opacity-90">Customer support</span>
        <span className="text-sm font-bold">{WHATSAPP_DISPLAY}</span>
      </span>
    </a>
  );
}
