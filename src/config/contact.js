// Contact details used across the site and the signed-in app.
// Tanzania mobile 0785 575 779 -> international format 255785575779 (no "+", needed by wa.me).
export const WHATSAPP_DISPLAY = "0785 575 779";
export const WHATSAPP_INTL = "255785575779";

export const whatsappLink = (text = "Hello MGI Strategy, I'd like to know more.") =>
  `https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(text)}`;
