import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuthProfile } from "../../hooks/useAuthProfile";

export default function MarketingNavbar() {
  const { session } = useAuthProfile();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const cta = session ? (
    <Link to="/dashboard" onClick={close} className="bg-long text-base px-5 py-2.5 rounded-xl font-semibold hover:bg-long/90 transition-colors text-center">
      Go to dashboard
    </Link>
  ) : (
    <Link to="/signup" onClick={close} className="bg-long text-base px-5 py-2.5 rounded-xl font-semibold hover:bg-long/90 transition-colors text-center">
      Get started
    </Link>
  );

  return (
    <header className="border-b border-line bg-base/85 backdrop-blur sticky top-0 z-30">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg tracking-tight text-ink">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-long to-steel flex items-center justify-center text-base text-sm font-bold">M</span>
          MGI <span className="text-long -ml-1">Strategy</span>
        </Link>

        {/* desktop */}
        <div className="hidden md:flex items-center gap-7 text-sm">
          <Link to="/pricing" className="text-muted hover:text-ink transition-colors">Pricing</Link>
          {!session && <Link to="/signin" className="text-muted hover:text-ink transition-colors">Log in</Link>}
          {cta}
        </div>

        {/* phone */}
        <button className="md:hidden p-2 -mr-2 text-ink" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-line bg-base px-4 pb-5 pt-3 flex flex-col gap-1 text-base">
          <Link to="/pricing" onClick={close} className="py-3 text-ink border-b border-line">Pricing</Link>
          {!session && <Link to="/signin" onClick={close} className="py-3 text-ink border-b border-line">Log in</Link>}
          <div className="mt-3 flex flex-col">{cta}</div>
        </div>
      )}
    </header>
  );
}
