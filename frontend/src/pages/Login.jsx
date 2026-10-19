
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Star, Zap, Shield, Sparkles, ArrowUpRight } from "lucide-react";
import loginImage from "../assets/login image.jpg";
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
  { icon: <Star size={14} />, title: "Personal watchlist" },
  { icon: <Zap size={14} />, title: "Airing updates" },
  { icon: <Shield size={14} />, title: "Secure account" },
  { icon: <Sparkles size={14} />, title: "Discover gems" },
];

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (event) => {
    const value = event.target.value;

    setForm((current) => ({ ...current, [key]: value }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await login({
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to sign in. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading={"Welcome\nback."}
      sub="Pick up where you left off. Discover new favourites, keep track of your watchlist, and make every anime count."
      features={FEATURES}
      image={loginImage}
    >
      <AuthHeading
        title="Welcome back"
        sub="Sign in to continue your anime journey."
      />

      <ErrorAlert message={error} />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
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

        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          value={form.password}
          onChange={set("password")}
          placeholder="Enter your password"
          required
          labelAction={
            <Link
              to="/forgot-password"
              className="rounded text-xs font-semibold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              style={{ color: "var(--text-link, #818cf8)" }}
            >
              Forgot password?
            </Link>
          }
        />

        <div className="pt-1">
          <SubmitButton
            loading={loading}
            label="Sign in"
            loadingLabel="Signing you in..."
          />
        </div>
      </form>

      <SwitchPrompt
        text="New to AniFind?"
        linkText="Create a free account"
        to="/register"
      />

      <p
        className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs"
        style={{ color: "var(--text-subtle, #85899e)" }}
      >
        Your next favourite anime is waiting
        <ArrowUpRight size={13} aria-hidden="true" />
      </p>
    </AuthLayout>
  );
};

export default Login;
