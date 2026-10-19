
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import logo from "../../assets/logo.png";

const ACCENT = "var(--accent-glow, #a5b4fc)";

/* Reusable AniFind brand */
export const Logo = ({ className = "", size = 42 }) => (
  <Link
    to="/"
    aria-label="AniFind home"
    className={`group inline-flex w-fit items-center gap-3 ${className}`}
  >
    <img
      src={logo}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
      style={{
        width: size,
        height: size,
        filter: "drop-shadow(0 3px 12px var(--logo-glow, rgba(99,102,241,.25)))",
      }}
    />
    <span
      className="text-xl font-black tracking-tight"
      style={{
        color: "var(--logo-text, var(--text-heading, #18182b))",
        fontFamily: "var(--font-heading, sans-serif)",
      }}
    >
      Ani
      <span style={{ color: "var(--logo-accent, #818cf8)" }}>Find</span>
    </span>
  </Link>
);

/* Cinematic image panel */
const BrandPanel = ({
  heading,
  sub,
  features = [],
  image,
  className = "",
}) => (
  <aside
    className={`auth-brand-panel relative hidden min-h-screen flex-col justify-between overflow-hidden p-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start xl:p-8 2xl:p-10 ${className}`}
    style={{
      background: "#0c0d14",
      borderColor: "var(--border-subtle, rgba(128,128,160,.15))",
    }}
  >
    {image ? (
      <motion.img
        src={image}
        alt=""
        aria-hidden="true"
        draggable={false}
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 h-full w-full object-cover object-[center_10%]"
      />
    ) : (
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, rgba(129,140,248,.3), transparent 42%), #0c0d14",
        }}
      />
    )}

    {/* Soft cinematic vignette — keeps artwork vibrant while guaranteeing card contrast */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: [
          "linear-gradient(to bottom, rgba(10,10,20,0.25) 0%, transparent 20%, transparent 60%, rgba(10,10,20,0.30) 100%)",
          "radial-gradient(circle at 50% 35%, transparent 55%, rgba(10,10,20,0.20) 100%)",
        ].join(","),
      }}
    />

    {/* Top: Brand Logo inside sleek frosted glass capsule */}
    <motion.div
      className="relative z-10"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="liquid-glass-logo inline-flex items-center px-4 py-2 rounded-2xl">
        <Logo size={32} className="[--logo-text:#ffffff] [--logo-accent:#a5b4fc]" />
      </div>
    </motion.div>

    {/* Bottom: Modern Glassmorphic Liquid Glass Showcase Card */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass-card relative z-10 w-full max-w-lg mt-auto rounded-3xl p-6 xl:p-7"
    >
      {/* Pill Badge */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="liquid-glass-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-indigo-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AniFind Platform
        </span>
        <span className="text-[11px] font-medium" style={{ color: "rgba(226, 232, 240, 0.75)" }}>
          40k+ Anime Hub
        </span>
      </div>

      {/* Heading */}
      <h2
        className="font-black leading-tight drop-shadow-md text-2xl xl:text-3xl tracking-tight whitespace-pre-line"
        style={{ color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}
      >
        {heading}
      </h2>

      {/* Subtitle */}
      {sub && (
        <p className="mt-2 text-xs xl:text-sm leading-relaxed" style={{ color: "rgba(241, 245, 249, 0.85)", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
          {sub}
        </p>
      )}

      {/* Feature Micro-Grid (2x2) */}
      {features?.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/15">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.05, duration: 0.3 }}
              className="liquid-glass-pill flex items-center gap-2.5 px-3 py-2.5 rounded-2xl cursor-default"
            >
              <span
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs"
                style={{
                  background: "rgba(99, 102, 241, 0.25)",
                  border: "1px solid rgba(165, 180, 252, 0.35)",
                  color: "#c7d2fe",
                  boxShadow: "0 0 10px rgba(99, 102, 241, 0.3)",
                }}
              >
                {feature.icon}
              </span>
              <span className="text-xs font-semibold truncate" style={{ color: "#f8fafc", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                {feature.title}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Card Micro Footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]" style={{ color: "rgba(203, 213, 225, 0.75)" }}>
        <span>Powered by MyAnimeList · Jikan API</span>
        <span className="text-indigo-300 font-semibold">Free & Open</span>
      </div>
    </motion.div>
  </aside>
);

/* Shared responsive split-screen layout */
export const AuthLayout = ({
  heading,
  sub,
  features = [],
  image,
  reverse = false,
  children,
}) => (
  <div
    className="grid min-h-screen w-full lg:grid-cols-2"
    style={{
      background: "var(--bg-main, #fafaff)",
      color: "var(--text-heading, #18182b)",
    }}
  >
    <BrandPanel
      heading={heading}
      sub={sub}
      features={features}
      image={image}
      className={reverse ? "lg:order-2" : ""}
    />

    <main
      className={`relative flex min-h-screen min-w-0 flex-col ${
        reverse ? "lg:order-1" : ""
      }`}
    >
      {/* Ambient accent, intentionally behind the form. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 lg:hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%,var(--glow-radial,rgba(99,102,241,.13)),transparent 72%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between gap-4 px-5 pt-6 sm:px-9 lg:px-10 xl:px-14">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          style={{ color: "var(--text-muted, #777b91)" }}
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to home
        </Link>

        <Logo className="lg:hidden" size={34} />
      </header>

      <div className="relative z-10 flex flex-1 items-center px-5 py-8 sm:px-9 lg:px-10 lg:py-10 xl:px-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[440px]"
        >
          {children}
        </motion.div>
      </div>

      <footer
        className="relative z-10 px-5 pb-5 text-center text-xs lg:hidden"
        style={{ color: "var(--text-subtle, #85899e)" }}
      >
        Powered by MyAnimeList · Jikan API v4
      </footer>
    </main>
  </div>
);

/* Heading used by both authentication forms */
export const AuthHeading = ({ title, sub }) => (
  <div className="mb-7">
    <h1
      className="text-3xl font-black leading-tight tracking-tight sm:text-[34px]"
      style={{
        color: "var(--text-heading, #18182b)",
        letterSpacing: "-0.035em",
      }}
    >
      {title}
    </h1>

    {sub && (
      <p
        className="mt-2.5 text-sm leading-6 sm:text-[15px]"
        style={{ color: "var(--text-muted, #777b91)" }}
      >
        {sub}
      </p>
    )}
  </div>
);

/* Accessible animated error message */
export const ErrorAlert = ({ message }) => (
  <AnimatePresence initial={false}>
    {message && (
      <motion.div
        role="alert"
        aria-live="polite"
        initial={{ opacity: 0, height: 0, y: -4 }}
        animate={{ opacity: 1, height: "auto", y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div
          className="mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
          style={{
            background: "var(--error-bg, rgba(239,68,68,.09))",
            border: "1px solid var(--error-border, rgba(239,68,68,.25))",
            color: "var(--error-text, #dc4545)",
          }}
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{message}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* Reusable, theme-aware text input */
export const InputField = ({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  rightEl,
  labelAction,
  autoComplete,
  name,
  invalid = false,
  maxLength,
}) => {
  const id = useId();

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="text-xs font-bold uppercase tracking-[0.09em]"
          style={{ color: "var(--text-muted, #777b91)" }}
        >
          {label}
        </label>
        {labelAction}
      </div>

      <div
        className="group flex h-[50px] items-center gap-3 rounded-xl border px-3.5 transition-all duration-200 focus-within:ring-4"
        style={{
          background: invalid
            ? "var(--input-error-bg, rgba(239,68,68,.05))"
            : "var(--input-bg, var(--nav-btn-bg, rgba(128,128,160,.06)))",
          borderColor: invalid
            ? "var(--error-border, #ef4444)"
            : "var(--input-border, var(--border-subtle, rgba(128,128,160,.22)))",
          "--tw-ring-color": invalid
            ? "rgba(239,68,68,.12)"
            : "rgba(99,102,241,.13)",
        }}
      >
        {icon && (
          <span
            aria-hidden="true"
            className="shrink-0 transition-colors"
            style={{ color: "var(--text-muted, #85899e)" }}
          >
            {icon}
          </span>
        )}

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          aria-invalid={invalid || undefined}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-60"
          style={{ color: "var(--text-heading, #18182b)" }}
        />

        {rightEl}
      </div>
    </div>
  );
};

/* Password field with show/hide toggle */
export const PasswordField = ({ label = "Password", ...rest }) => {
  const [show, setShow] = useState(false);

  return (
    <InputField
      {...rest}
      label={label}
      type={show ? "text" : "password"}
      icon={<Lock size={17} />}
      rightEl={
        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="shrink-0 rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          style={{ color: "var(--text-muted, #85899e)" }}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      }
    />
  );
};

/* Primary action button */
export const SubmitButton = ({
  loading,
  label,
  loadingLabel,
  disabled = false,
}) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="flex h-[50px] w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:brightness-110 active:scale-[.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
    style={{
      background: "linear-gradient(120deg,#6366f1 0%,#8057ed 55%,#955cf6 100%)",
      boxShadow: loading ? "none" : "0 8px 24px rgba(99,102,241,.24)",
    }}
  >
    {loading ? (
      <>
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
        />
        {loadingLabel}
      </>
    ) : (
      <>
        {label}
        <ChevronRight size={17} />
      </>
    )}
  </button>
);

/* Link between login and registration */
export const SwitchPrompt = ({ text, linkText, to }) => (
  <p
    className="mt-7 border-t pt-6 text-center text-sm leading-6"
    style={{
      borderColor: "var(--border-subtle, rgba(128,128,160,.18))",
      color: "var(--text-muted, #777b91)",
    }}
  >
    {text}{" "}
    <Link
      to={to}
      className="font-bold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      style={{ color: ACCENT }}
    >
      {linkText}
    </Link>
  </p>
);
