// App.jsx
import { Routes, Route } from "react-router-dom";
import { AuthProvider }      from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import Layout      from "./components/layout/Layout";
import Home        from "./pages/Home";
import About       from "./pages/About";
import Login       from "./pages/Login";
import Register    from "./pages/Register";
import Profile     from "./pages/Profile";
import Favorites   from "./pages/Favorites";
import SearchPage  from "./pages/SearchPage";
import AnimeDetail from "./pages/AnimeDetail";
import Movies      from "./pages/Movies";
import Series      from "./pages/Series";
import Kids        from "./pages/Kids";

const App = () => (
  <AuthProvider>
    <FavoritesProvider>
      <Layout>
        <Routes>
          {/* core */}
          <Route path="/"          element={<Home />}        />
          <Route path="/about"     element={<About />}       />
          <Route path="/search"    element={<SearchPage />}  />
          <Route path="/anime/:id" element={<AnimeDetail />} />

          {/* content pages */}
          <Route path="/movies"    element={<Movies />}      />
          <Route path="/series"    element={<Series />}      />
          <Route path="/kids"      element={<Kids />}        />

          {/* user */}
          <Route path="/login"     element={<Login />}       />
          <Route path="/register"  element={<Register />}    />
          <Route path="/profile"   element={<Profile />}     />
          <Route path="/favorites" element={<Favorites />}   />

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </FavoritesProvider>
  </AuthProvider>
);

/* ── inline 404 so no extra file needed ── */
import { motion } from "framer-motion";
import { Link }   from "react-router-dom";
import { Home as HomeIcon, Compass } from "lucide-react";

const NotFound = () => (
  <div
    className="min-h-screen flex flex-col items-center justify-center text-center px-4"
    style={{ background: "#0a0a14" }}
  >
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.5  }}
      className="flex flex-col items-center gap-6"
    >
      {/* glowing 404 */}
      <div
        className="text-center font-black leading-none select-none"
        style={{
          fontSize:              "clamp(80px,20vw,160px)",
          background:            "linear-gradient(135deg,rgba(99,102,241,.35),rgba(168,85,247,.20))",
          WebkitBackgroundClip:  "text",
          WebkitTextFillColor:   "transparent",
          filter:                "drop-shadow(0 0 32px rgba(99,102,241,.25))",
        }}
      >
        404
      </div>

      <div>
        <h1 className="font-black text-white mb-2"
            style={{ fontSize: "clamp(20px,4vw,28px)" }}>
          Page Not Found
        </h1>
        <p className="text-sm" style={{ color: "rgba(148,163,184,.50)", maxWidth: 340 }}>
          This page doesn't exist or was moved. Head back home to keep exploring.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold
                     text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow:  "0 4px 20px rgba(99,102,241,.35)",
          }}
        >
          <HomeIcon size={14} /> Go Home
        </Link>
        <Link
          to="/search"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold
                     transition-all hover:scale-105 active:scale-95"
          style={{
            background: "rgba(255,255,255,.06)",
            color:       "rgba(255,255,255,.70)",
            border:      "1px solid rgba(255,255,255,.10)",
          }}
        >
          <Compass size={14} /> Explore
        </Link>
      </div>
    </motion.div>
  </div>
);

export default App;