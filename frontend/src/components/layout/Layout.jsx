import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PullCord from "../common/PullCord";
import { useTheme } from "../../context/ThemeContext";

/* ══════════════════════════════════════════════════════════
   PAGES THAT GET NO FOOTER
══════════════════════════════════════════════════════════ */
const NO_FOOTER_ROUTES = ["/login", "/register"];
const NO_NAV_ROUTES    = ["/login", "/register"];

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
  const isAuthPage   = NO_NAV_ROUTES.includes(pathname);
  const showNavbar   = !isAuthPage;
  const showFooter   = !NO_FOOTER_ROUTES.includes(pathname);
  const { isLight, toggleTheme } = useTheme();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-main, #0a0a14)" }}
    >
      <ScrollToTop />

      {/* ── FeralUI Ceiling Pull-Cord Theme Toggle ── */}
      <PullCord
        onPull={toggleTheme}
        pulled={isLight}
        style={isAuthPage ? { top: 0 } : undefined}
        ariaLabel={isLight ? "Pull to switch to dark mode" : "Pull to switch to light mode"}
      />

      {/* ── fixed navbar spacer (hidden on auth pages) ── */}
      {showNavbar && (
        <>
          <Navbar />
          <div style={{ height: 64, flexShrink: 0 }} aria-hidden />
        </>
      )}

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