import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

/* ══════════════════════════════════════════════════════════
   PAGES THAT GET NO FOOTER
══════════════════════════════════════════════════════════ */
const NO_FOOTER_ROUTES = ["/login", "/register"];

/* ══════════════════════════════════════════════════════════
   SCROLL TO TOP ON ROUTE CHANGE
══════════════════════════════════════════════════════════ */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};

/* ══════════════════════════════════════════════════════════
   LAYOUT
══════════════════════════════════════════════════════════ */
const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const showFooter   = !NO_FOOTER_ROUTES.includes(pathname);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0a0a14" }}
    >
      <ScrollToTop />

      {/* ── fixed navbar spacer ── */}
      <Navbar />
      <div style={{ height: 64, flexShrink: 0 }} aria-hidden />

      {/* ── page content ── */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* ── footer (hidden on auth pages) ── */}
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;