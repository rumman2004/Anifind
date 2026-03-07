// Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, Eye, EyeOff, Tv, AlertCircle,
  ArrowLeft, Sparkles, Shield, Star, Zap,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* ══════════════════════════════════════════════════════════
   SHARED ATOMS
══════════════════════════════════════════════════════════ */
const FloatingOrb = ({ style }) => (
  <div className="absolute rounded-full pointer-events-none" style={style} />
);

const FeaturePill = ({ icon, text, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
    style={{
      background: "rgba(255,255,255,.06)",
      border: "1px solid rgba(255,255,255,.10)",
    }}
  >
    <span style={{ color: "#a5b4fc" }}>{icon}</span>
    <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,.70)" }}>{text}</span>
  </motion.div>
);

const InputField = ({
  label, icon, type = "text", value, onChange,
  placeholder, required, rightEl, focusColor = "rgba(99,102,241,.55)",
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label
        className="block text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: "rgba(148,163,184,.55)" }}
      >
        {label}
      </label>
      <div
        className="flex items-center gap-2.5 px-3.5 rounded-2xl transition-all duration-200"
        style={{
          background: focused ? "rgba(99,102,241,.08)" : "rgba(255,255,255,.04)",
          border: `1px solid ${focused ? focusColor : "rgba(255,255,255,.09)"}`,
          boxShadow: focused ? `0 0 0 3px ${focusColor}22` : "none",
          height: 48,
        }}
      >
        <span style={{ color: focused ? "#a5b4fc" : "rgba(148,163,184,.45)", flexShrink: 0 }}>
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent outline-none text-sm text-white min-w-0"
          style={{ "::placeholder": { color: "rgba(148,163,184,.30)" } }}
        />
        {rightEl}
      </div>
    </div>
  );
};

const SubmitButton = ({ loading, label, loadingLabel }) => (
  <button
    type="submit"
    disabled={loading}
    className="relative w-full h-12 rounded-2xl font-bold text-sm text-white overflow-hidden
               transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70
               disabled:cursor-not-allowed disabled:scale-100"
    style={{
      background: "linear-gradient(135deg,#6366f1,#8b5cf6,#6366f1)",
      backgroundSize: "200% 100%",
      boxShadow: loading ? "none" : "0 4px 24px rgba(99,102,241,.45)",
    }}
  >
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={loading ? "loading" : "idle"}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
        className="flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div
              className="w-4 h-4 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "#fff", animation: "spin .7s linear infinite" }}
            />
            {loadingLabel}
          </>
        ) : (
          <>{label} <ChevronRight size={15} /></>
        )}
      </motion.span>
    </AnimatePresence>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </button>
);

/* ══════════════════════════════════════════════════════════
   LEFT PANEL  (shared branding sidebar)
══════════════════════════════════════════════════════════ */
const BrandPanel = ({ heading, sub, features }) => (
  <div className="hidden lg:flex flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
    {/* blobs */}
    <FloatingOrb style={{
      width: 320, height: 320,
      top: -80, left: -80,
      background: "radial-gradient(circle,rgba(99,102,241,.28) 0%,transparent 70%)",
      filter: "blur(40px)",
    }} />
    <FloatingOrb style={{
      width: 260, height: 260,
      bottom: -60, right: -60,
      background: "radial-gradient(circle,rgba(168,85,247,.22) 0%,transparent 70%)",
      filter: "blur(40px)",
    }} />

    {/* logo */}
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to="/" className="flex items-center gap-3 w-fit group">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all
                     group-hover:scale-110 group-hover:rotate-3"
          style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow: "0 0 20px rgba(99,102,241,.50)",
          }}
        >
          <Tv size={20} className="text-white" />
        </div>
        <span className="text-xl font-black text-white tracking-tight">
          Ani<span style={{ color: "#a5b4fc" }}>Find</span>
        </span>
      </Link>
    </motion.div>

    {/* headline */}
    <div className="relative z-10">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55 }}
        className="font-black text-white leading-tight mb-3"
        style={{ fontSize: "clamp(26px,3.5vw,36px)", letterSpacing: "-0.03em" }}
      >
        {heading}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-sm leading-relaxed mb-8"
        style={{ color: "rgba(148,163,184,.60)", maxWidth: 320 }}
      >
        {sub}
      </motion.p>

      <div className="flex flex-col gap-2.5">
        {features.map((f, i) => (
          <FeaturePill key={i} delay={0.30 + i * 0.08} icon={f.icon} text={f.text} />
        ))}
      </div>
    </div>

    {/* bottom quote */}
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="text-[11px] relative z-10"
      style={{ color: "rgba(148,163,184,.28)" }}
    >
      Powered by MyAnimeList · Jikan API v4
    </motion.p>
  </div>
);

/* ══════════════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════════════ */
const Login = () => {
  const [form,     setForm]     = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const FEATURES = [
    { icon: <Star size={14} />,    text: "Personalised anime favourites" },
    { icon: <Zap size={14} />,     text: "Real-time airing updates"       },
    { icon: <Shield size={14} />,  text: "Secure private account"         },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: "#0a0a14" }}
    >
      {/* bg glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: "absolute", top: "20%", left: "15%",
          width: 500, height: 500,
          background: "radial-gradient(circle,rgba(99,102,241,.09) 0%,transparent 70%)",
          filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "10%",
          width: 400, height: 400,
          background: "radial-gradient(circle,rgba(168,85,247,.07) 0%,transparent 70%)",
          filter: "blur(60px)",
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, rotateY: -15, z: -80 }}
        animate={{ opacity: 1, rotateY: 0,   z: 0   }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: 1000, width: "100%", maxWidth: 900 }}
      >
        <div
          className="w-full grid lg:grid-cols-[1fr_1.1fr] rounded-3xl overflow-hidden"
          style={{
            background: "rgba(12,12,24,.95)",
            border:     "1px solid rgba(255,255,255,.09)",
            boxShadow:  "0 32px 80px rgba(0,0,0,.70), 0 0 0 1px rgba(99,102,241,.08)",
          }}
        >
          {/* ── LEFT BRAND PANEL ── */}
          <BrandPanel
            heading={"Welcome\nback."}
            sub="Sign in to continue discovering, tracking, and saving your favourite anime."
            features={FEATURES}
          />

          {/* ── RIGHT FORM PANEL ── */}
          <div className="flex flex-col justify-center px-6 sm:px-10 py-10 relative">

            {/* back button */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1.5 text-xs font-semibold
                           transition-all hover:scale-105 active:scale-95 group w-fit"
                style={{ color: "rgba(148,163,184,.50)" }}
              >
                <ArrowLeft
                  size={13}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
                Back to Home
              </button>
            </motion.div>

            {/* mobile logo */}
            <div className="flex lg:hidden items-center justify-center mb-7">
              <Link to="/" className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow: "0 0 16px rgba(99,102,241,.45)",
                  }}
                >
                  <Tv size={17} className="text-white" />
                </div>
                <span className="text-lg font-black text-white">
                  Ani<span style={{ color: "#a5b4fc" }}>Find</span>
                </span>
              </Link>
            </div>

            {/* heading */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-7"
            >
              <h1
                className="font-black text-white mb-1"
                style={{ fontSize: "clamp(22px,4vw,30px)", letterSpacing: "-0.025em" }}
              >
                Sign In
              </h1>
              <p className="text-sm" style={{ color: "rgba(148,163,184,.50)" }}>
                New here?{" "}
                <Link
                  to="/register"
                  className="font-semibold transition-colors hover:brightness-125"
                  style={{ color: "#a5b4fc" }}
                >
                  Create a free account
                </Link>
              </p>
            </motion.div>

            {/* error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0,  height: "auto" }}
                  exit={{   opacity: 0, y: -8,  height: 0 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-5 text-sm overflow-hidden"
                  style={{
                    background: "rgba(239,68,68,.10)",
                    border:     "1px solid rgba(239,68,68,.28)",
                    color:      "#fca5a5",
                  }}
                >
                  <AlertCircle size={15} className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <InputField
                label="Email"
                icon={<Mail size={15} />}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
              />

              <InputField
                label="Password"
                icon={<Lock size={15} />}
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                rightEl={
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="flex-shrink-0 transition-colors hover:brightness-125"
                    style={{ color: "rgba(148,163,184,.45)" }}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />

              {/* forgot */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-semibold transition-colors hover:brightness-125"
                  style={{ color: "rgba(165,180,252,.55)" }}
                >
                  Forgot password?
                </button>
              </div>

              <div className="pt-1">
                <SubmitButton
                  loading={loading}
                  label="Sign In"
                  loadingLabel="Signing in…"
                />
              </div>
            </motion.form>

            {/* divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.07)" }} />
              <span className="text-[10px] uppercase tracking-widest font-semibold"
                    style={{ color: "rgba(148,163,184,.30)" }}>or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.07)" }} />
            </div>

            {/* register redirect */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            >
              <Link
                to="/register"
                className="w-full h-11 rounded-2xl flex items-center justify-center gap-2
                           text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "rgba(99,102,241,.10)",
                  border:     "1px solid rgba(99,102,241,.22)",
                  color:      "#a5b4fc",
                }}
              >
                <Sparkles size={14} />
                Create a new account
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;