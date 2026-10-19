
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  User,
  CheckCircle2,
  Sparkles,
  Shield,
  Star,
  Zap,
  Check,
  X as XIcon,
} from "lucide-react";
import signupImage from "../assets/Signup image.jpg";
import { useAuth } from "../context/AuthContext";
import {
  AuthLayout,
  AuthHeading,
  ErrorAlert,
  InputField,
  PasswordField,
  SubmitButton,
  SwitchPrompt,
} from "../components/auth/AuthShared";

const FEATURES = [
  { icon: <Star size={14} />, title: "Track your history" },
  { icon: <Sparkles size={14} />, title: "Curated lists" },
  { icon: <Shield size={14} />, title: "Private & secure" },
  { icon: <Zap size={14} />, title: "Airing alerts" },
];

const getStrength = (password) => {
  const checks = [
    { pass: password.length >= 8, label: "8+ characters" },
    { pass: /[A-Z]/.test(password), label: "Uppercase letter" },
    { pass: /[0-9]/.test(password), label: "Number" },
    { pass: /[^A-Za-z0-9]/.test(password), label: "Special character" },
  ];

  return {
    checks,
    score: checks.filter((item) => item.pass).length,
  };
};

const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = [
  "#ef4444",
  "#f87171",
  "#fbbf24",
  "#60a5fa",
  "#22c55e",
];

const PasswordStrength = ({ password }) => {
  const { checks, score } = getStrength(password);
  const color = STRENGTH_COLORS[score];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="space-y-2.5 pt-3">
        <div className="flex items-center gap-3">
          <div
            className="flex flex-1 gap-1.5"
            role="progressbar"
            aria-label="Password strength"
            aria-valuemin={0}
            aria-valuemax={4}
            aria-valuenow={score}
          >
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{
                  background:
                    step <= score
                      ? color
                      : "var(--border-subtle, rgba(128,128,160,.18))",
                }}
              />
            ))}
          </div>

          <span
            className="w-[68px] text-right text-xs font-semibold"
            style={{ color }}
          >
            {password.length === 0 ? "" : STRENGTH_LABELS[score]}
          </span>
        </div>

        <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
          {checks.map((item) => (
            <li
              key={item.label}
              className="flex min-w-0 items-center gap-1.5"
            >
              {item.pass ? (
                <Check size={13} className="shrink-0 text-green-500" />
              ) : (
                <XIcon
                  size={13}
                  className="shrink-0"
                  style={{ color: "var(--text-subtle, #85899e)" }}
                />
              )}

              <span
                className="text-[11px] leading-4 sm:text-xs"
                style={{
                  color: item.pass
                    ? "var(--success-text, #16a34a)"
                    : "var(--text-muted, #85899e)",
                }}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const SuccessScreen = ({ username }) => (
  <div
    className="flex min-h-screen w-full items-center justify-center px-5 transition-colors duration-300"
    style={{
      background: "var(--bg-main, #fafaff)",
      color: "var(--text-heading, #18182b)",
    }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="flex w-full max-w-md flex-col items-center gap-6 text-center"
    >
      <div
        className="flex h-20 w-20 items-center justify-center rounded-3xl"
        style={{
          background: "rgba(34,197,94,.10)",
          border: "1px solid rgba(34,197,94,.25)",
          boxShadow: "0 0 40px rgba(34,197,94,.10)",
        }}
      >
        <CheckCircle2 size={38} className="text-green-500" />
      </div>

      <div>
        <h1 className="text-3xl font-black tracking-tight">
          Account created!
        </h1>

        <p
          className="mt-3 text-sm leading-6"
          style={{ color: "var(--text-muted, #777b91)" }}
        >
          Welcome to AniFind,{" "}
          <span className="font-bold" style={{ color: "var(--text-link, #818cf8)" }}>
            {username}
          </span>
          . Your anime journey starts now.
        </p>
      </div>

      <div
        className="h-1 w-52 overflow-hidden rounded-full"
        style={{ background: "var(--border-subtle, rgba(128,128,160,.15))" }}
      >
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.6, ease: "linear" }}
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg,#6366f1,#22c55e)",
          }}
        />
      </div>

      <p
        className="text-xs"
        style={{ color: "var(--text-muted, #777b91)" }}
      >
        Taking you to AniFind...
      </p>
    </motion.div>
  </div>
);

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (event) => {
    const value = event.target.value;

    setForm((current) => ({ ...current, [key]: value }));

    if (error) setError("");
  };

  const mismatch =
    form.confirm.length > 0 && form.password !== form.confirm;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    const username = form.username.trim();
    const email = form.email.trim();

    if (!username) {
      setError("Please enter a username.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (form.password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register({
        username,
        email,
        password: form.password,
      });

      setSuccess(true);

      // Keep the success screen visible before navigating.
      window.setTimeout(() => {
        navigate("/", { replace: true });
      }, 1800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <SuccessScreen username={form.username.trim()} />;
  }

  return (
    <AuthLayout
      reverse
      heading={"Your anime journey\nstarts here."}
      sub="Discover new favourites, organise your watchlist, and keep every season in one place."
      features={FEATURES}
      image={signupImage}
    >
      <AuthHeading
        title="Create your account"
        sub="Join AniFind. It only takes a minute."
      />

      <ErrorAlert message={error} />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Username"
          name="username"
          icon={<User size={17} />}
          autoComplete="username"
          value={form.username}
          onChange={set("username")}
          placeholder="Choose a username"
          required
          maxLength={50}
        />

        <InputField
          label="Email address"
          name="email"
          icon={<Mail size={17} />}
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set("email")}
          placeholder="you@example.com"
          required
          maxLength={254}
        />

        <div>
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            placeholder="Create a strong password"
            required
            maxLength={128}
          />

          <AnimatePresence initial={false}>
            {form.password && (
              <PasswordStrength password={form.password} />
            )}
          </AnimatePresence>
        </div>

        <div>
          <PasswordField
            label="Confirm password"
            name="confirm"
            autoComplete="new-password"
            value={form.confirm}
            onChange={set("confirm")}
            placeholder="Enter your password again"
            invalid={mismatch}
            required
            maxLength={128}
          />

          <AnimatePresence initial={false}>
            {form.confirm && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <span
                  className="flex items-center gap-1.5 pt-2 text-xs font-semibold"
                  style={{
                    color: mismatch
                      ? "var(--error-text, #dc4545)"
                      : "var(--success-text, #16a34a)",
                  }}
                >
                  {mismatch ? (
                    <XIcon size={13} />
                  ) : (
                    <Check size={13} />
                  )}
                  {mismatch
                    ? "Passwords don't match"
                    : "Passwords match"}
                </span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <p
          className="pt-1 text-xs leading-5"
          style={{ color: "var(--text-muted, #777b91)" }}
        >
          By creating an account, you agree to our{" "}
          <a
            href="/terms"
            className="font-semibold hover:underline"
            style={{ color: "var(--text-link, #818cf8)" }}
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="font-semibold hover:underline"
            style={{ color: "var(--text-link, #818cf8)" }}
          >
            Privacy Policy
          </a>
          .
        </p>

        <div className="pt-1">
          <SubmitButton
            loading={loading}
            label="Create account"
            loadingLabel="Creating your account..."
          />
        </div>
      </form>

      <SwitchPrompt
        text="Already have an account?"
        linkText="Sign in"
        to="/login"
      />
    </AuthLayout>
  );
};

export default Register;
