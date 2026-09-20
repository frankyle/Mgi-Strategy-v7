import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/authentication/ProtectedRoute";
import PublicLayout from "./layouts/PublicLayout";

// Public / marketing pages
import RootRoute from "./pages/RootRoute";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import SignUp from "./components/authentication/SignUp";
import SignIn from "./components/authentication/SignIn";

// App (signed-in) pages
import HomeRoute from "./pages/HomeRoute";
import FundedAccount from "./pages/FundedAccount/FundedAccount";
import PersonalAccount from "./pages/PersonalAccount/PersonalAccount";
import TradersIdea from "./pages/TradersIdea/TradersIdea";
import SetupMatchGrader from "./pages/SetupMatchGrader/SetupMatchGrader";
import FinanceTracker from "./pages/FinanceTracker/FinanceTracker";
import TradeBlog from "./pages/TradeBlog/TradeBlog";
import PublicTradeBlog from "./pages/TradeBlog/PublicTradeBlog";
import TradersBlog from "./pages/TradersIdea/TradersBlog";
import PublicTradersBlog from "./pages/TradersIdea/PublicTradersBlog";
import SignalsFeed from "./pages/SignalsFeed/SignalsFeed";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
};

function App() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50"
    >
      <Routes>
        {/* 🌍 PUBLIC MARKETING SITE — this is what a fresh link to MGI Strategy
            opens to. No login wall: "/" shows the homepage when signed out,
            and sends signed-in visitors straight to /dashboard instead
            (see RootRoute). */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/pricing" element={<PublicLayout />}>
          <Route index element={<Pricing />} />
        </Route>

        {/* 🔓 AUTH — also public, these ARE the "log in" / "create account" pages */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* 🌍 PUBLIC SHARE LINKS — no login needed, this is what friends open */}
        <Route path="/blog/:userId" element={<PublicTradeBlog />} />
        <Route path="/trader-blog/:userId" element={<PublicTradersBlog />} />

        {/* 🔒 PROTECTED ROUTES — signed in required for everything below.
            Lives under /dashboard now (used to be "/"), so the bare root URL
            is free to be the public homepage above. Admin sees the full
            journal; everyone else only ever reaches "signals" (HomeRoute
            sends "/dashboard" there too, and AppSidebar never links to the
            admin-only ones for a non-admin) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeRoute />} />
          <Route path="signals" element={<SignalsFeed />} />
          <Route
            path="personal"
            element={<ProtectedRoute adminOnly><PersonalAccount /></ProtectedRoute>}
          />
          <Route
            path="funded"
            element={<ProtectedRoute adminOnly><FundedAccount /></ProtectedRoute>}
          />
          <Route
            path="tradersidea"
            element={<ProtectedRoute adminOnly><TradersIdea /></ProtectedRoute>}
          />
          <Route
            path="setup-match-grader"
            element={<ProtectedRoute adminOnly><SetupMatchGrader /></ProtectedRoute>}
          />
          <Route
            path="trade-blog"
            element={<ProtectedRoute adminOnly><TradeBlog /></ProtectedRoute>}
          />
          <Route
            path="traders-blog"
            element={<ProtectedRoute adminOnly><TradersBlog /></ProtectedRoute>}
          />
          <Route
            path="finance"
            element={<ProtectedRoute adminOnly><FinanceTracker /></ProtectedRoute>}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#fff",
            borderRadius: "8px",
            padding: "12px 16px",
          },
        }}
      />
    </motion.div>
  );
}

export default App;
export { toast };
