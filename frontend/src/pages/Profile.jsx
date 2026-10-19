// src/pages/Profile.jsx
import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, LogOut, Heart, Edit3, Check, X, Lock, Shield, Camera, Sparkles,
  BookMarked, Star, Tv, AlertCircle, CheckCircle2, Eye, EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { userService } from "../services/userService";
import ScrollRope from "../components/ui/ScrollRope";

const ACCENT = "#8b93ff";
const C = "https://res.cloudinary.com/ddil24vfs/image/upload/";
const AVATARS = [
  "v1772890186/avatar_1_wmuasd.jpg","v1772890186/avatar_2_qu5pna.jpg","v1772890186/avatar_3_jhjvi4.jpg",
  "v1772890186/avatar_4_ppbmxx.jpg","v1772890186/avatar_5_j7xuaq.jpg","v1772890186/avatar_6_p40p0t.jpg",
  "v1772890187/avatar_7_c74srt.jpg","v1772890187/avatar_8_ygtlnl.jpg","v1772890187/avatar_9_cox5an.jpg",
  "v1772890187/avatar_10_jq1gzi.jpg","v1772904245/avatar_15_fvytbc.jpg","v1772891277/avatar_12_qjlhbq.jpg",
  "v1772891279/avatar_11_kr5eze.jpg","v1772891436/avatar_13_ssss1t.jpg","v1772891437/avatar_14_edkskb.jpg",
  "v1772904424/avatar_16_j8tqht.jpg","v1772904425/avatar_17_uvfujc.jpg","v1772904426/avatar_18_t2oi9s.jpg",
  "v1772904429/avatar_20_gm8avg.jpg","v1772904463/avatar_19_pu7g2f.jpg",
].map((p) => C + p);

const panel = { background: "var(--bg-card, rgba(16,16,32,.85))", border: "1px solid var(--border-subtle, rgba(255,255,255,.07))" };

const Card = ({ title, icon, children, className = "" }) => (
  <section className={`rounded-2xl p-5 sm:p-6 ${className}`} style={panel}>
    {title && (
      <h2 className="flex items-center gap-2 text-base font-bold mb-4" style={{ color: "var(--text-heading, #fff)" }}>
        <span style={{ color: ACCENT }}>{icon}</span>{title}
      </h2>
    )}
    {children}
  </section>
);

const Toast = ({ msg, type }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} role="status"
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold backdrop-blur-xl"
    style={{
      background: type === "error" ? "rgba(239,68,68,.18)" : "rgba(74,222,128,.16)",
      border: `1px solid ${type === "error" ? "rgba(239,68,68,.4)" : "rgba(74,222,128,.4)"}`,
      color: type === "error" ? "#fca5a5" : "#86efac",
    }}>
    {type === "error" ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}{msg}
  </motion.div>
);

const Stat = ({ icon, label, value, color }) => (
  <div className="rounded-xl p-4" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}><span style={{ color }}>{icon}</span>{label}</div>
    <p className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color: "var(--text-heading, #fff)" }}>{value}</p>
  </div>
);

/* ── score distribution graph (SVG, line draws on scroll into view) ── */
const ScoreGraph = ({ favorites }) => {
  const bins = useMemo(() => {
    const b = Array.from({ length: 6 }, (_, i) => ({ label: `${i + 5}`, n: 0 }));
    favorites.forEach((f) => {
      if (f.score) b[Math.min(5, Math.max(0, Math.floor(f.score) - 5))].n++;
    });
    return b;
  }, [favorites]);
  const max = Math.max(1, ...bins.map((b) => b.n));
  const W = 600, H = 200, P = 28;
  const pts = bins.map((b, i) => [P + (i * (W - 2 * P)) / 5, H - P - (b.n / max) * (H - 2 * P)]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const area = `${line} L${pts[5][0]},${H - P} L${pts[0][0]},${H - P} Z`;

  if (!favorites.length)
    return <p className="text-sm py-10 text-center" style={{ color: "var(--text-muted, #94a3b8)" }}>Add favourites to see how your taste is distributed.</p>;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Favourites by score">
      <defs>
        <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ACCENT} stopOpacity=".35" /><stop offset="1" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={P} x2={W - P} y1={H - P - t * (H - 2 * P)} y2={H - P - t * (H - 2 * P)} stroke="var(--border-subtle, rgba(255,255,255,.07))" />
      ))}
      <motion.path d={area} fill="url(#ga)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.6 }} />
      <motion.path d={line} fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeOut" }} />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill="var(--bg-main, #0a0a14)" stroke={ACCENT} strokeWidth="2" />
          <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fill="var(--text-heading, #fff)" fontWeight="700">{bins[i].n}</text>
          <text x={x} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--text-muted, rgba(148,163,184,.7))">{bins[i].label}{i === 5 ? "+" : ""}</text>
        </g>
      ))}
    </svg>
  );
};

const AvatarPicker = ({ current, onSelect, onClose, saving }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[150] grid place-items-center px-4 bg-black/70 backdrop-blur-md"
    onClick={(e) => e.target === e.currentTarget && onClose()}>
    <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
      role="dialog" aria-label="Choose avatar" className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: "var(--bg-card, #0e0e1c)", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))" }}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border-subtle, rgba(255,255,255,.05))" }}>
        <span className="font-bold text-sm" style={{ color: "var(--text-heading, #fff)" }}>Choose avatar</span>
        <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-lg grid place-items-center transition-colors" style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.05))", color: "var(--text-muted, #cbd5e1)" }}><X size={14} /></button>
      </div>
      <div className="p-5 grid grid-cols-5 gap-3">
        {AVATARS.map((url, i) => {
          const sel = url === current;
          return (
            <button key={url} onClick={() => onSelect(url)} disabled={saving} aria-label={`Avatar ${i + 1}`}
              className="relative aspect-square rounded-xl overflow-hidden transition-transform hover:scale-105 disabled:opacity-60"
              style={{ outline: sel ? `2px solid ${ACCENT}` : "2px solid transparent", outlineOffset: 2 }}>
              <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              {sel && <span className="absolute inset-0 grid place-items-center bg-indigo-500/45"><Check size={16} className="text-white" /></span>}
            </button>
          );
        })}
      </div>
    </motion.div>
  </motion.div>
);

const Field = ({ label, icon, value, onSave, placeholder, maxLength, multiline, readOnly }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  const open = () => { setDraft(value); setEditing(true); setTimeout(() => ref.current?.focus(), 50); };
  const close = () => { setEditing(false); setDraft(value); };
  const save = async () => {
    if (draft.trim() === value) return close();
    setSaving(true);
    try { await onSave(draft.trim()); setEditing(false); } catch { /* parent toasts */ } finally { setSaving(false); }
  };
  const cls = "w-full rounded-lg px-3 py-2 text-sm outline-none resize-none transition-colors";
  const clsStyle = { background: "var(--nav-btn-bg, rgba(99,102,241,.1))", border: "1px solid var(--border-subtle, rgba(99,102,241,.3))", color: "var(--text-heading, #fff)" };

  return (
    <div className="flex items-start gap-3 py-4 border-b last:border-0" style={{ borderColor: "var(--border-subtle, rgba(255,255,255,.05))" }}>
      <span className="mt-1" style={{ color: "var(--text-muted, #94a3b8)" }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-1" style={{ color: "var(--text-muted, #94a3b8)" }}>{label}</p>
        {editing ? (
          <div className="space-y-2">
            {multiline
              ? <textarea ref={ref} value={draft} rows={3} maxLength={maxLength} onChange={(e) => setDraft(e.target.value)} className={cls} style={clsStyle} />
              : <input ref={ref} value={draft} maxLength={maxLength} onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") close(); }} className={cls} style={clsStyle} />}
            {maxLength && <p className="text-right text-[11px] tabular-nums" style={{ color: "var(--text-subtle, #64748b)" }}>{draft.length}/{maxLength}</p>}
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-60" style={{ background: "#6366f1" }}>
                <Check size={12} />{saving ? "Saving" : "Save changes"}
              </button>
              <button onClick={close} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors" style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.05))", color: "var(--text-muted, #cbd5e1)" }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm truncate" style={{ color: value ? "var(--text-heading, #fff)" : "var(--text-muted, #64748b)" }}>{value || placeholder}</p>
            {!readOnly && (
              <button onClick={open} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors" style={{ color: "var(--text-link, #a5b4fc)", background: "var(--nav-btn-bg, rgba(99,102,241,.1))" }}>
                <Edit3 size={11} /> Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const PasswordForm = ({ onToast }) => {
  const empty = { current: "", next: "", confirm: "" };
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.next !== form.confirm) return onToast("Passwords do not match", "error");
    if (form.next.length < 6) return onToast("New password must be at least 6 characters", "error");
    setSaving(true);
    try {
      await userService.changePassword(form.current, form.next);
      onToast("Password changed"); setForm(empty);
    } catch (err) {
      onToast(err.response?.data?.message ?? "Couldn't change password", "error");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3">
      {[["current", "Current password"], ["next", "New password"], ["confirm", "Confirm new password"]].map(([k, l]) => (
        <label key={k} className="block">
          <span className="text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}>{l}</span>
          <div className="mt-1.5 flex items-center gap-2 px-3 h-11 rounded-lg transition-colors" style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.04))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))" }}>
            <Lock size={13} style={{ color: "var(--text-muted, #94a3b8)" }} />
            <input type={show ? "text" : "password"} required value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className="flex-1 min-w-0 bg-transparent outline-none text-sm" style={{ color: "var(--text-heading, #fff)" }} placeholder="••••••••" />
            {k === "current" && (
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide passwords" : "Show passwords"} style={{ color: "var(--text-muted, #94a3b8)" }}>
                {show ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            )}
          </div>
        </label>
      ))}
      <div className="sm:col-span-3">
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60" style={{ background: "#6366f1" }}>
          <Shield size={14} />{saving ? "Updating" : "Update password"}
        </button>
      </div>
    </form>
  );
};

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [picker, setPicker] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [toast, setToast] = useState(null);

  if (!user)
    return (
      <div className="min-h-screen grid place-items-center px-4" style={{ background: "var(--bg-main, #0a0a14)" }}>
        <div className="text-center">
          <User size={32} className="mx-auto mb-4" style={{ color: ACCENT }} />
          <h2 className="text-xl font-bold" style={{ color: "var(--text-heading, #fff)" }}>Sign in to view your profile</h2>
          <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-muted, #94a3b8)" }}>Manage your account, favourites and security.</p>
          <Link to="/login" className="px-6 py-3 rounded-lg font-bold text-sm text-white" style={{ background: "#6366f1" }}>Sign in</Link>
        </div>
      </div>
    );

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const pickAvatar = async (url) => {
    if (url === user.avatar) return setPicker(false);
    setAvatarSaving(true);
    try { updateUser(await userService.updateProfile({ avatar: url })); showToast("Avatar updated"); setPicker(false); }
    catch { showToast("Couldn't update avatar", "error"); }
    finally { setAvatarSaving(false); }
  };

  const savePatch = async (patch) => {
    try { updateUser(await userService.updateProfile(patch)); showToast("Profile updated"); }
    catch (err) { showToast(err.response?.data?.message ?? "Update failed", "error"); throw err; }
  };

  const scored = favorites.filter((f) => f.score);
  const avg = scored.length ? (scored.reduce((s, f) => s + f.score, 0) / scored.length).toFixed(1) : "—";
  const eps = favorites.reduce((s, f) => s + (f.episodes ?? 0), 0).toLocaleString();
  const initial = user.username?.[0]?.toUpperCase() ?? "U";
  const joined = new Date(user.createdAt || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const Avatar = ({ size }) => user.avatar
    ? <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
    : <div className="w-full h-full grid place-items-center font-black text-white" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: size }}>{initial}</div>;

  return (
    <div className="min-h-screen w-full transition-colors duration-300" style={{ background: "var(--bg-main, #0a0a14)" }}>
      <ScrollRope color={ACCENT} />
      <AnimatePresence>{toast && <Toast key={toast.msg} {...toast} />}</AnimatePresence>
      <AnimatePresence>{picker && <AvatarPicker current={user.avatar} onSelect={pickAvatar} onClose={() => setPicker(false)} saving={avatarSaving} />}</AnimatePresence>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 xl:px-14 py-8 sm:py-12 grid gap-6 lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr] items-start">

        {/* left: identity (sticky on desktop) */}
        <aside className="lg:sticky lg:top-6">
          <Card>
            <div className="flex flex-col items-center text-center">
              <button onClick={() => setPicker(true)} aria-label="Change avatar" className="group relative w-28 h-28 rounded-2xl overflow-hidden" style={{ border: "2px solid rgba(139,147,255,.4)" }}>
                <Avatar size={36} />
                <span className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </span>
              </button>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight break-all" style={{ color: "var(--text-heading, #fff)" }}>{user.username}</h1>
              <p className="text-sm break-all" style={{ color: "var(--text-muted, #94a3b8)" }}>{user.email}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-subtle, #64748b)" }}>Member since {joined}</p>
              {user.bio && <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-main, #cbd5e1)" }}>{user.bio}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-6">
              <Link to="/favorites" className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-[1.02]"
                style={{
                  color: "var(--text-heading, #fff)",
                  background: "rgba(236,72,153,.15)",
                  border: "1px solid rgba(236,72,153,.35)",
                }}>
                <Heart size={14} className="text-pink-500 fill-pink-500" />Favourites
              </Link>
              <Link to="/search" className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-[1.02]"
                style={{
                  color: "var(--text-heading, #fff)",
                  background: "var(--nav-link-active-bg, rgba(99,102,241,.15))",
                  border: "1px solid var(--border-accent, rgba(99,102,241,.35))",
                }}>
                <Sparkles size={14} className="text-indigo-400" />Explore
              </Link>
            </div>
            <button onClick={() => { logout(); navigate("/"); }} className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-[1.01]"
              style={{
                color: "var(--text-heading, #fff)",
                background: "rgba(239,68,68,.12)",
                border: "1px solid rgba(239,68,68,.3)",
              }}>
              <LogOut size={14} className="text-red-500" />Sign out
            </button>
          </Card>
        </aside>

        {/* right: content */}
        <div className="space-y-6 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat icon={<Heart size={14} />} label="Favourites" value={favorites.length} color="#f472b6" />
            <Stat icon={<Star size={14} />} label="Average score" value={avg} color="#fbbf24" />
            <Stat icon={<Tv size={14} />} label="Episodes saved" value={eps} color="#60a5fa" />
          </div>

          <Card title="Your taste by score" icon={<Star size={16} />}>
            <p className="text-xs -mt-2 mb-3" style={{ color: "var(--text-muted, #94a3b8)" }}>Number of favourites in each score range.</p>
            <ScoreGraph favorites={favorites} />
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Profile details" icon={<Edit3 size={16} />}>
              <Field label="Username" icon={<User size={15} />} value={user.username ?? ""} placeholder="Set a username" maxLength={20} onSave={(v) => savePatch({ username: v })} />
              <Field label="Email" icon={<Mail size={15} />} value={user.email ?? ""} placeholder="—" readOnly onSave={() => {}} />
              <Field label="Bio" icon={<BookMarked size={15} />} value={user.bio ?? ""} placeholder="Add a short bio" maxLength={200} multiline onSave={(v) => savePatch({ bio: v })} />
            </Card>

            <Card title="Avatar" icon={<Camera size={16} />}>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"><Avatar size={24} /></div>
                <div>
                  <p className="text-sm" style={{ color: "var(--text-muted, #94a3b8)" }}>Pick one of {AVATARS.length} avatars. It saves as soon as you select it.</p>
                  <button onClick={() => setPicker(true)} className="mt-3 px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "#6366f1" }}>Change avatar</button>
                </div>
              </div>
            </Card>
          </div>

          <Card title="Security" icon={<Shield size={16} />}>
            <PasswordForm onToast={showToast} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;