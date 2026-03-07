// src/pages/Profile.jsx
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, LogOut, Heart, Edit3, Check, X,
  Lock, Shield, ChevronRight, Camera, Sparkles,
  BookMarked, Star, Tv, AlertCircle, CheckCircle2,
  Eye, EyeOff, Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth }      from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { userService }  from "../services/userService";

/* ══════════════════════════════════════════════════════════
   AVATAR URLS
══════════════════════════════════════════════════════════ */
const AVATARS = [
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772890186/avatar_1_wmuasd.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772890186/avatar_2_qu5pna.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772890186/avatar_3_jhjvi4.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772890186/avatar_4_ppbmxx.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772890186/avatar_5_j7xuaq.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772890186/avatar_6_p40p0t.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772890187/avatar_7_c74srt.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772890187/avatar_8_ygtlnl.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772890187/avatar_9_cox5an.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772890187/avatar_10_jq1gzi.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772904245/avatar_15_fvytbc.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772891277/avatar_12_qjlhbq.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772891279/avatar_11_kr5eze.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772891436/avatar_13_ssss1t.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772891437/avatar_14_edkskb.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772904424/avatar_16_j8tqht.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772904425/avatar_17_uvfujc.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772904426/avatar_18_t2oi9s.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772904429/avatar_20_gm8avg.jpg",
  "https://res.cloudinary.com/ddil24vfs/image/upload/v1772904463/avatar_19_pu7g2f.jpg",
];

/* ══════════════════════════════════════════════════════════
   SMALL ATOMS
══════════════════════════════════════════════════════════ */
const Toast = ({ msg, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 32, scale: 0.92 }}
    animate={{ opacity: 1, y: 0,  scale: 1    }}
    exit={{   opacity: 0, y: 32, scale: 0.92  }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]
               flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold"
    style={{
      background:     type === "error" ? "rgba(239,68,68,.15)"   : "rgba(74,222,128,.15)",
      border:         type === "error" ? "1px solid rgba(239,68,68,.35)" : "1px solid rgba(74,222,128,.35)",
      color:          type === "error" ? "#fca5a5"               : "#86efac",
      backdropFilter: "blur(16px)",
      boxShadow:      "0 8px 32px rgba(0,0,0,.50)",
    }}
  >
    {type === "error"
      ? <AlertCircle  size={15} />
      : <CheckCircle2 size={15} />}
    {msg}
  </motion.div>
);

const SectionCard = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl p-5 sm:p-6 ${className}`}
    style={{
      background: "rgba(14,14,28,.90)",
      border:     "1px solid rgba(255,255,255,.07)",
      boxShadow:  "0 4px 24px rgba(0,0,0,.30)",
    }}
  >
    {children}
  </div>
);

const SectionTitle = ({ icon, children }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <span style={{ color: "#a5b4fc" }}>{icon}</span>
    <h2 className="font-black text-white text-base tracking-tight">{children}</h2>
  </div>
);

const StatPill = ({ icon, label, value, color }) => (
  <div
    className="flex flex-col items-center justify-center gap-1 rounded-2xl py-4 px-3"
    style={{
      background: `${color}12`,
      border:     `1px solid ${color}22`,
    }}
  >
    <span style={{ color }}>{icon}</span>
    <span className="text-xl font-black text-white">{value}</span>
    <span className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "rgba(148,163,184,.50)" }}>{label}</span>
  </div>
);

/* ══════════════════════════════════════════════════════════
   AVATAR PICKER MODAL
══════════════════════════════════════════════════════════ */
const AvatarPicker = ({ current, onSelect, onClose, saving }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{   opacity: 0 }}
    className="fixed inset-0 z-[150] flex items-center justify-center px-4"
    style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(12px)" }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 24 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      exit={{   opacity: 0, scale: 0.88, y: 24  }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="w-full max-w-sm rounded-3xl overflow-hidden"
      style={{
        background: "rgba(12,12,24,.98)",
        border:     "1px solid rgba(255,255,255,.10)",
        boxShadow:  "0 32px 80px rgba(0,0,0,.70)",
      }}
    >
      {/* header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}
      >
        <div className="flex items-center gap-2">
          <Camera size={16} style={{ color: "#a5b4fc" }} />
          <span className="font-black text-white text-sm">Choose Avatar</span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.55)" }}
        >
          <X size={13} />
        </button>
      </div>

      {/* grid */}
      <div className="p-5">
        <div className="grid grid-cols-5 gap-3">
          {AVATARS.map((url, i) => {
            const selected = url === current;
            return (
              <motion.button
                key={i}
                onClick={() => onSelect(url)}
                disabled={saving}
                whileHover={{ scale: 1.08 }}
                whileTap={{  scale: 0.94 }}
                className="relative rounded-2xl overflow-hidden aspect-square"
                style={{
                  border:    selected ? "2.5px solid #a5b4fc" : "2.5px solid transparent",
                  boxShadow: selected ? "0 0 12px rgba(165,180,252,.50)" : "none",
                  outline:   "none",
                }}
              >
                <img
                  src={url}
                  alt={`Avatar ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {selected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(99,102,241,.45)" }}
                  >
                    <Check size={16} className="text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <p className="text-center text-[10px] mt-4"
           style={{ color: "rgba(148,163,184,.35)" }}>
          Click an avatar to select and save instantly
        </p>
      </div>
    </motion.div>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════
   INLINE EDITABLE FIELD
══════════════════════════════════════════════════════════ */
const EditableField = ({ label, icon, value, onSave, placeholder, maxLength, multiline }) => {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);
  const [saving,  setSaving]  = useState(false);
  const inputRef = useRef(null);

  const open  = () => { setDraft(value); setEditing(true); setTimeout(() => inputRef.current?.focus(), 50); };
  const close = () => { setEditing(false); setDraft(value); };

  const save = async () => {
    if (draft.trim() === value) { close(); return; }
    setSaving(true);
    try { await onSave(draft.trim()); setEditing(false); }
    catch { /* parent shows toast */ }
    finally { setSaving(false); }
  };

  const inputStyle = {
    background: "rgba(99,102,241,.08)",
    border:     "1px solid rgba(99,102,241,.35)",
    borderRadius: 12,
    color:      "#fff",
    fontSize:   14,
    outline:    "none",
    width:      "100%",
    padding:    "8px 12px",
    resize:     "none",
    boxShadow:  "0 0 0 3px rgba(99,102,241,.10)",
  };

  return (
    <div
      className="flex items-start gap-3 py-3.5 px-1"
      style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}
    >
      <span className="mt-0.5 flex-shrink-0" style={{ color: "rgba(99,102,241,.65)" }}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
           style={{ color: "rgba(148,163,184,.45)" }}>
          {label}
        </p>

        {editing ? (
          <div className="space-y-2">
            {multiline ? (
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={maxLength}
                rows={3}
                style={inputStyle}
              />
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={maxLength}
                onKeyDown={(e) => {
                  if (e.key === "Enter")  save();
                  if (e.key === "Escape") close();
                }}
                style={inputStyle}
              />
            )}
            {maxLength && (
              <p className="text-right text-[9px]" style={{ color: "rgba(148,163,184,.30)" }}>
                {draft.length}/{maxLength}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                           transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                style={{
                  background: "rgba(99,102,241,.22)",
                  border:     "1px solid rgba(99,102,241,.35)",
                  color:      "#a5b4fc",
                }}
              >
                {saving
                  ? <div className="w-3 h-3 rounded-full border border-transparent"
                         style={{ borderTopColor:"#a5b4fc", animation:"spin .6s linear infinite" }} />
                  : <Check size={11} />}
                Save
              </button>
              <button
                onClick={close}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                           transition-all hover:scale-105"
                style={{
                  background: "rgba(255,255,255,.06)",
                  border:     "1px solid rgba(255,255,255,.10)",
                  color:      "rgba(148,163,184,.65)",
                }}
              >
                <X size={11} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between group gap-2">
            <p className="text-sm text-white truncate" style={{ opacity: value ? 1 : 0.35 }}>
              {value || placeholder}
            </p>
            <button
              onClick={open}
              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1
                         rounded-lg text-[10px] font-semibold transition-all hover:scale-105 flex-shrink-0"
              style={{
                background: "rgba(99,102,241,.12)",
                border:     "1px solid rgba(99,102,241,.22)",
                color:      "#a5b4fc",
              }}
            >
              <Edit3 size={9} /> Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   CHANGE PASSWORD FORM
══════════════════════════════════════════════════════════ */
const ChangePasswordForm = ({ onToast }) => {
  const [open,    setOpen]    = useState(false);
  const [form,    setForm]    = useState({ current: "", next: "", confirm: "" });
  const [show,    setShow]    = useState(false);
  const [saving,  setSaving]  = useState(false);

  const reset = () => { setForm({ current: "", next: "", confirm: "" }); setOpen(false); };

  const submit = async (e) => {
    e.preventDefault();
    if (form.next !== form.confirm) { onToast("Passwords do not match", "error"); return; }
    if (form.next.length < 6)       { onToast("New password must be ≥ 6 characters", "error"); return; }
    setSaving(true);
    try {
      await userService.changePassword(form.current, form.next);
      onToast("Password changed successfully!", "success");
      reset();
    } catch (err) {
      onToast(err.response?.data?.message ?? "Failed to change password", "error");
    } finally { setSaving(false); }
  };

  const inputCls = {
    display:      "flex",
    alignItems:   "center",
    gap:          8,
    padding:      "0 12px",
    height:       44,
    borderRadius: 14,
    background:   "rgba(255,255,255,.04)",
    border:       "1px solid rgba(255,255,255,.09)",
  };

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl
                   transition-all hover:scale-[1.01]"
        style={{
          background: "rgba(99,102,241,.08)",
          border:     "1px solid rgba(99,102,241,.18)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Lock size={14} style={{ color: "#a5b4fc" }} />
          <span className="text-sm font-semibold text-white">Change Password</span>
        </div>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight size={14} style={{ color: "rgba(148,163,184,.45)" }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0      }}
            transition={{ duration: 0.25 }}
            onSubmit={submit}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              {[
                { key: "current", label: "Current Password"  },
                { key: "next",    label: "New Password"      },
                { key: "confirm", label: "Confirm Password"  },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                         style={{ color: "rgba(148,163,184,.45)" }}>
                    {label}
                  </label>
                  <div style={inputCls}>
                    <Lock size={13} style={{ color: "rgba(148,163,184,.40)", flexShrink: 0 }} />
                    <input
                      type={show ? "text" : "password"}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      required
                      className="flex-1 bg-transparent outline-none text-sm text-white"
                      placeholder="••••••••"
                    />
                    {key === "current" && (
                      <button type="button" onClick={() => setShow((s) => !s)}
                              style={{ color: "rgba(148,163,184,.40)", flexShrink: 0 }}>
                        {show ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold
                             transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color:      "#fff",
                    boxShadow:  saving ? "none" : "0 4px 16px rgba(99,102,241,.35)",
                  }}
                >
                  {saving
                    ? <div className="w-4 h-4 rounded-full border-2 border-transparent"
                           style={{ borderTopColor:"#fff", animation:"spin .6s linear infinite" }} />
                    : <><Shield size={12} /> Update</>}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{
                    background: "rgba(255,255,255,.06)",
                    border:     "1px solid rgba(255,255,255,.10)",
                    color:      "rgba(148,163,184,.65)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   NOT LOGGED IN
══════════════════════════════════════════════════════════ */
const NotLoggedIn = () => (
  <div className="min-h-screen flex items-center justify-center px-4"
       style={{ background: "#0a0a14" }}>
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
           style={{ background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.22)" }}>
        <User size={28} style={{ color: "#a5b4fc" }} />
      </div>
      <h2 className="text-xl font-black text-white mb-2">Sign in to view your profile</h2>
      <p className="text-sm mb-6" style={{ color: "rgba(148,163,184,.55)" }}>
        Access your profile, favourites and settings.
      </p>
      <Link to="/login"
        className="px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                 boxShadow: "0 4px 20px rgba(99,102,241,.40)" }}>
        Sign In
      </Link>
    </motion.div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   PROFILE PAGE
══════════════════════════════════════════════════════════ */
const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { favorites }                = useFavorites();
  const navigate                     = useNavigate();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [toast, setToast]           = useState(null); // { msg, type }

  if (!user) return <NotLoggedIn />;

  /* ── toast helper ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── save avatar ── */
  const handleAvatarSelect = async (url) => {
    if (url === user.avatar) { setPickerOpen(false); return; }
    setAvatarSaving(true);
    try {
      const updated = await userService.updateProfile({ avatar: url });
      updateUser(updated);
      showToast("Avatar updated!");
      setPickerOpen(false);
    } catch {
      showToast("Failed to update avatar", "error");
    } finally { setAvatarSaving(false); }
  };

  /* ── save username / bio ── */
  const handleFieldSave = async (patch) => {
    try {
      const updated = await userService.updateProfile(patch);
      updateUser(updated);
      showToast("Profile updated!");
    } catch (err) {
      showToast(err.response?.data?.message ?? "Update failed", "error");
      throw err;
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const avgScore = favorites.length
    ? (favorites.reduce((s, f) => s + (f.score ?? 0), 0) /
       (favorites.filter(f => f.score).length || 1)).toFixed(1)
    : "—";

  const initial = user.username?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="min-h-screen relative" style={{ background: "#0a0a14" }}>

      {/* bg glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{
          position: "absolute", top: 0, left: "20%",
          width: 600, height: 400,
          background: "radial-gradient(ellipse,rgba(99,102,241,.07) 0%,transparent 70%)",
          filter: "blur(70px)",
        }} />
      </div>

      {/* toasts */}
      <AnimatePresence>
        {toast && <Toast key={toast.msg} msg={toast.msg} type={toast.type} />}
      </AnimatePresence>

      {/* avatar picker */}
      <AnimatePresence>
        {pickerOpen && (
          <AvatarPicker
            current={user.avatar}
            onSelect={handleAvatarSelect}
            onClose={() => setPickerOpen(false)}
            saving={avatarSaving}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-5">

        {/* ════ HERO CARD ════ */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0   }}
          transition={{ duration: 0.45 }}
        >
          <SectionCard>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

              {/* avatar */}
              <div className="relative flex-shrink-0 group">
                <div
                  className="w-24 h-24 rounded-3xl overflow-hidden"
                  style={{
                    border:    "2px solid rgba(99,102,241,.35)",
                    boxShadow: "0 0 30px rgba(99,102,241,.20)",
                  }}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                    >
                      {initial}
                    </div>
                  )}
                </div>

                {/* change overlay */}
                <button
                  onClick={() => setPickerOpen(true)}
                  className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-all duration-200"
                  style={{ background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)" }}
                >
                  {avatarSaving ? (
                    <div className="w-5 h-5 rounded-full border-2 border-transparent"
                         style={{ borderTopColor: "#fff", animation: "spin .6s linear infinite" }} />
                  ) : (
                    <>
                      <Camera size={18} className="text-white mb-1" />
                      <span className="text-[9px] font-bold text-white">Change</span>
                    </>
                  )}
                </button>
              </div>

              {/* user info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1
                    className="font-black text-white leading-tight"
                    style={{ fontSize: "clamp(20px,4vw,26px)", letterSpacing: "-0.03em" }}
                  >
                    {user.username}
                  </h1>
                  <span
                    className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(99,102,241,.18)",
                      border:     "1px solid rgba(99,102,241,.28)",
                      color:      "#a5b4fc",
                    }}
                  >
                    Member
                  </span>
                </div>

                <p className="text-sm mb-1" style={{ color: "rgba(148,163,184,.55)" }}>
                  {user.email}
                </p>
                <p className="text-xs" style={{ color: "rgba(148,163,184,.35)" }}>
                  Joined {new Date(user.createdAt || Date.now()).toLocaleDateString("en-US", {
                    month: "long", year: "numeric",
                  })}
                </p>

                {user.bio && (
                  <p className="text-sm mt-2 leading-relaxed"
                     style={{ color: "rgba(148,163,184,.65)", maxWidth: 340 }}>
                    {user.bio}
                  </p>
                )}
              </div>

              {/* logout */}
              <button
                onClick={handleLogout}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl
                           text-xs font-bold transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "rgba(239,68,68,.10)",
                  border:     "1px solid rgba(239,68,68,.20)",
                  color:      "#fca5a5",
                }}
              >
                <LogOut size={12} /> Sign Out
              </button>
            </div>

            {/* stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <StatPill
                icon={<Heart size={16} />}
                label="Favourites"
                value={favorites.length}
                color="#f472b6"
              />
              <StatPill
                icon={<Star size={16} />}
                label="Avg Score"
                value={avgScore}
                color="#fbbf24"
              />
              <StatPill
                icon={<Tv size={16} />}
                label="Episodes"
                value={favorites.reduce((s,f) => s+(f.episodes??0),0).toLocaleString()}
                color="#60a5fa"
              />
            </div>

            {/* quick actions */}
            <div className="flex gap-3 mt-5">
              <Link
                to="/favorites"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl
                           text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg,rgba(236,72,153,.20),rgba(99,102,241,.20))",
                  border:     "1px solid rgba(236,72,153,.25)",
                  color:      "#f9a8d4",
                }}
              >
                <Heart size={14} /> My Favourites
              </Link>
              <Link
                to="/search"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl
                           text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "rgba(99,102,241,.12)",
                  border:     "1px solid rgba(99,102,241,.22)",
                  color:      "#a5b4fc",
                }}
              >
                <Sparkles size={14} /> Explore Anime
              </Link>
            </div>
          </SectionCard>
        </motion.div>

        {/* ════ EDIT PROFILE ════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.10 }}
        >
          <SectionCard>
            <SectionTitle icon={<Edit3 size={16} />}>Edit Profile</SectionTitle>

            <EditableField
              label="Username"
              icon={<User size={15} />}
              value={user.username ?? ""}
              placeholder="Set a username"
              maxLength={20}
              onSave={(v) => handleFieldSave({ username: v })}
            />
            <EditableField
              label="Email"
              icon={<Mail size={15} />}
              value={user.email ?? ""}
              placeholder="—"
              onSave={() => {}}   /* email change disabled — shown read-only */
            />
            <EditableField
              label="Bio"
              icon={<BookMarked size={15} />}
              value={user.bio ?? ""}
              placeholder="Tell the world about yourself…"
              maxLength={200}
              multiline
              onSave={(v) => handleFieldSave({ bio: v })}
            />

            {/* avatar shortcut */}
            <div className="mt-4">
              <button
                onClick={() => setPickerOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl
                           transition-all hover:scale-[1.01]"
                style={{
                  background: "rgba(99,102,241,.08)",
                  border:     "1px solid rgba(99,102,241,.18)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ border: "1px solid rgba(99,102,241,.30)" }}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-black text-white"
                           style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                        {initial}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Profile Avatar</p>
                    <p className="text-[10px]" style={{ color: "rgba(148,163,184,.45)" }}>
                      Click to change avatar
                    </p>
                  </div>
                </div>
                <Camera size={14} style={{ color: "#a5b4fc" }} />
              </button>
            </div>
          </SectionCard>
        </motion.div>

        {/* ════ SECURITY ════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.18 }}
        >
          <SectionCard>
            <SectionTitle icon={<Shield size={16} />}>Security</SectionTitle>
            <ChangePasswordForm onToast={showToast} />
          </SectionCard>
        </motion.div>

      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default Profile;