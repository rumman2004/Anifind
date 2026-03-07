// Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, User, Eye, EyeOff, Tv, AlertCircle,
  ArrowLeft, CheckCircle2, Sparkles, Shield, Star,
  Zap, ChevronRight, Check, X as XIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* ══════════════════════════════════════════════════════════
   PASSWORD STRENGTH METER
══════════════════════════════════════════════════════════ */
const getStrength = (pw) => {
  let score = 0;
  const checks = [
    { pass: pw.length >= 8,            label: "At least 8 characters" },
    { pass: /[A-Z]/.test(pw),          label: "Uppercase letter"       },
    { pass: /[0-9]/.test(pw),          label: "Number"                 },
    { pass: /[^A-Za-z0-9]/.test(pw),   label: "Special character"      },
  ];
  checks.forEach((c) => { if (c.pass) score++; });
  return { score, checks };
};

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "#f87171", "#fbbf24", "#60a5fa", "#4ade80"];

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const { score, checks } = getStrength(password);
  const color = STRENGTH_COLORS[score];
  const label = STRENGTH_LABELS[score];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="mt-2.5 space-y-2">
        {/* bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{
                  background: s <= score ? color : "rgba(255,255,255,.08)",
                }}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold" style={{ color, width: 44, textAlign: "right" }}>
            {label}
          </span>
        </div>

        {/* checks */}
        <div className="grid grid-cols-2 gap-1">
          {checks.map((c, i) => (
            <div key={i} className="flex items-center gap-1">
              {c.pass
                ? <Check size={9} style={{ color: "#4ade80", flexShrink: 0 }} />
                : <XIcon size={9} style={{ color: "rgba(148,163,184,.30)", flexShrink: 0 }} />
              }
              <span
                className="text-[9px] font-medium"
                style={{ color: c.pass ? "rgba(74,222,128,.80)" : "rgba(148,163,184,.35)" }}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   SHARED INPUT (same as Login — copy or move to shared file)
══════════════════════════════════════════════════════════ */
const InputField = ({
  label, icon, type = "text", value, onChange,
  placeholder, required, rightEl,
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
          border:     `1px solid ${focused ? "rgba(99,102,241,.55)" : "rgba(255,255,255,.09)"}`,
          boxShadow:  focused ? "0 0 0 3px rgba(99,102,241,.10)" : "none",
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
               transition-all hover:scale-[1.02] active:scale-[0.98]
               disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
    style={{
      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
      boxShadow: loading ? "none" : "0 4px 24px rgba(99,102,241,.45)",
    }}
  >
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={loading ? "loading" : "idle"}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{   opacity: 0, y: -8 }}
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
   REGISTER
══════════════════════════════════════════════════════════ */
const Register = () => {
  const [form, setForm] = useState({
    username: "", email: "", password: "", confirm: "",
  });
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await register({ username: form.username, email: form.email, password: form.password });
      setSuccess(true);
      setTimeout(() => navigate("/"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const FEATURES = [
    { icon: <Star size={14} />,          text: "Track your anime history"       },
    { icon: <Sparkles size={14} />,      text: "Curated personal lists"         },
    { icon: <Shield size={14} />,        text: "Private & secure account"       },
    { icon: <Zap size={14} />,           text: "Instant airing notifications"   },
  ];

  /* success screen */
  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#0a0a14" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1     }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 14 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,rgba(74,222,128,.25),rgba(74,222,128,.10))",
              border:      "1px solid rgba(74,222,128,.35)",
              boxShadow:   "0 0 40px rgba(74,222,128,.20)",
            }}
          >
            <CheckCircle2 size={36} style={{ color: "#4ade80" }} />
          </motion.div>

          <div>
            <h2 className="font-black text-white text-2xl mb-1">Account Created!</h2>
            <p className="text-sm" style={{ color: "rgba(148,163,184,.55)" }}>
              Welcome aboard, <span style={{ color: "#a5b4fc" }}>{form.username}</span>.<br />
              Redirecting you home…
            </p>
          </div>

          <div
            className="w-48 h-1 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,.06)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.6, ease: "linear" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg,#6366f1,#4ade80)" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: "#0a0a14" }}
    >
      {/* bg glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: "absolute", top: "15%", right: "10%",
          width: 500, height: 500,
          background: "radial-gradient(circle,rgba(168,85,247,.09) 0%,transparent 70%)",
          filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", bottom: "5%", left: "5%",
          width: 400, height: 400,
          background: "radial-gradient(circle,rgba(99,102,241,.08) 0%,transparent 70%)",
          filter: "blur(60px)",
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, rotateY: 15, z: -80 }}
        animate={{ opacity: 1, rotateY: 0,  z: 0   }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: 1000, width: "100%", maxWidth: 960 }}
      >
        <div
          className="w-full grid lg:grid-cols-[1.1fr_1fr] rounded-3xl overflow-hidden"
          style={{
            background: "rgba(12,12,24,.95)",
            border:     "1px solid rgba(255,255,255,.09)",
            boxShadow:  "0 32px 80px rgba(0,0,0,.70), 0 0 0 1px rgba(99,102,241,.08)",
          }}
        >
          {/* ── LEFT FORM PANEL ── */}
          <div className="flex flex-col justify-center px-6 sm:px-10 py-10 relative order-2 lg:order-1">

            {/* back button */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1,  x: 0  }}
              transition={{ delay: 0.2 }}
              className="mb-7"
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
                    boxShadow:  "0 0 16px rgba(99,102,241,.45)",
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
              animate={{ opacity: 1, y: 0  }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <h1
                className="font-black text-white mb-1"
                style={{ fontSize: "clamp(22px,4vw,30px)", letterSpacing: "-0.025em" }}
              >
                Create Account
              </h1>
              <p className="text-sm" style={{ color: "rgba(148,163,184,.50)" }}>
                Already have one?{" "}
                <Link
                  to="/login"
                  className="font-semibold transition-colors hover:brightness-125"
                  style={{ color: "#a5b4fc" }}
                >
                  Sign in instead
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
              className="space-y-3.5"
            >
              <InputField
                label="Username"
                icon={<User size={15} />}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="coolotaku99"
                required
              />

              <InputField
                label="Email"
                icon={<Mail size={15} />}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
              />

              {/* password with strength */}
              <div>
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
                <AnimatePresence>
                  {form.password && <PasswordStrength password={form.password} />}
                </AnimatePresence>
              </div>

              <InputField
                label="Confirm Password"
                icon={<Lock size={15} />}
                type={showConfirm ? "text" : "password"}
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="••••••••"
                required
                rightEl={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="flex-shrink-0 transition-colors hover:brightness-125"
                    style={{ color: "rgba(148,163,184,.45)" }}
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />

              {/* match indicator */}
              <AnimatePresence>
                {form.confirm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{   opacity: 0, height: 0 }}
                    className="flex items-center gap-1.5 overflow-hidden"
                  >
                    {form.password === form.confirm ? (
                      <>
                        <Check size={10} style={{ color: "#4ade80" }} />
                        <span className="text-[10px] font-semibold" style={{ color: "#4ade80" }}>
                          Passwords match
                        </span>
                      </>
                    ) : (
                      <>
                        <XIcon size={10} style={{ color: "#f87171" }} />
                        <span className="text-[10px] font-semibold" style={{ color: "#f87171" }}>
                          Passwords don't match
                        </span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* terms */}
              <p className="text-[10px] leading-relaxed" style={{ color: "rgba(148,163,184,.35)" }}>
                By creating an account you agree to our{" "}
                <span style={{ color: "rgba(165,180,252,.55)", cursor: "pointer" }}>Terms</span>{" "}
                and{" "}
                <span style={{ color: "rgba(165,180,252,.55)", cursor: "pointer" }}>Privacy Policy</span>.
              </p>

              <div className="pt-1">
                <SubmitButton
                  loading={loading}
                  label="Create Account"
                  loadingLabel="Creating account…"
                />
              </div>
            </motion.form>

            {/* divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.07)" }} />
              <span className="text-[10px] uppercase tracking-widest font-semibold"
                    style={{ color: "rgba(148,163,184,.30)" }}>or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.07)" }} />
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Link
                to="/login"
                className="w-full h-11 rounded-2xl flex items-center justify-center gap-2
                           text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "rgba(99,102,241,.10)",
                  border:     "1px solid rgba(99,102,241,.22)",
                  color:      "#a5b4fc",
                }}
              >
                Already have an account? Sign in
              </Link>
            </motion.div>
          </div>

          {/* ── RIGHT BRAND PANEL ── */}
          <div
            className="hidden lg:flex flex-col justify-between p-10 xl:p-14 relative overflow-hidden order-1 lg:order-2"
            style={{ borderLeft: "1px solid rgba(255,255,255,.06)" }}
          >
            {/* blobs */}
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
                 style={{ background: "radial-gradient(circle,rgba(168,85,247,.25) 0%,transparent 70%)", filter: "blur(40px)" }} />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
                 style={{ background: "radial-gradient(circle,rgba(99,102,241,.20) 0%,transparent 70%)", filter: "blur(40px)" }} />

            {/* logo */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/" className="flex items-center gap-3 w-fit group">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center
                             transition-all group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow:  "0 0 20px rgba(99,102,241,.50)",
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
                Your anime journey starts here.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-sm leading-relaxed mb-8"
                style={{ color: "rgba(148,163,184,.60)", maxWidth: 300 }}
              >
                Join thousands of anime fans. Save favourites, track seasons, and discover hidden gems.
              </motion.p>

              <div className="flex flex-col gap-2.5">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0  }}
                    transition={{ delay: 0.30 + i * 0.08 }}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,.06)",
                      border:     "1px solid rgba(255,255,255,.10)",
                    }}
                  >
                    <span style={{ color: "#a5b4fc" }}>{f.icon}</span>
                    <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,.70)" }}>
                      {f.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="text-[11px] relative z-10"
              style={{ color: "rgba(148,163,184,.28)" }}
            >
              Powered by MyAnimeList · Jikan API v4
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* pull features array outside so it's in scope for the right panel */
const FEATURES = [
  { icon: <Star size={14} />,       text: "Track your anime history"     },
  { icon: <Sparkles size={14} />,   text: "Curated personal lists"       },
  { icon: <Shield size={14} />,     text: "Private & secure account"     },
  { icon: <Zap size={14} />,        text: "Instant airing notifications" },
];

export default Register;