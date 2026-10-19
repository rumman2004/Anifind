import { useMemo } from "react";
import { motion } from "framer-motion";
import { Film, Tv, Clock, Radio, Activity, Calendar, ChevronRight } from "lucide-react";

/* ── tokens ── */
const SURFACE = "var(--bg-card, rgba(255,255,255,.035))";
const BORDER = "1px solid var(--border-subtle, rgba(255,255,255,.08))";
const DIM = "var(--text-subtle, rgba(148,163,184,.45))";
const ACCENT = "var(--accent-glow, #a5b4fc)";
const DAY = 86400000;

/* ── helpers ── */
const toDate = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const fmt = (d) =>
  d
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/**
 * Builds the data for the airing graph from real air dates.
 * For shows that are currently airing, the number of aired episodes is
 * estimated assuming a weekly release (flagged as "estimated").
 */
const buildTimeline = (anime) => {
  const total = Number(anime.episodes) || 0;
  const start = toDate(anime.aired?.from);
  if (!start || total < 2) return null;

  const now = new Date();
  const end = toDate(anime.aired?.to);
  const weeklyEnd = new Date(start.getTime() + (total - 1) * 7 * DAY);

  if (anime.status === "Currently Airing") {
    const weeks = Math.floor((now - start) / (7 * DAY)) + 1;
    return {
      total,
      aired: Math.min(total, Math.max(1, weeks)),
      start,
      end: end ?? weeklyEnd,
      estimated: true,
      state: "airing",
    };
  }

  if (anime.status === "Not yet aired" || start > now) {
    return { total, aired: 0, start, end: end ?? weeklyEnd, estimated: true, state: "upcoming" };
  }

  return { total, aired: total, start, end: end ?? now, estimated: false, state: "finished" };
};

/* ══════════════════════════════════════════════════════════
   TIMELINE GRAPH — step chart: episodes released over time
══════════════════════════════════════════════════════════ */
const W = 560;
const H = 190;
const PL = 8;
const PR = 8;
const PT = 14;
const PB = 10;

const TimelineChart = ({ tl }) => {
  const { total, aired, state } = tl;
  const iw = W - PL - PR;
  const ih = H - PT - PB;

  const x = (i) => PL + ((i - 1) / (total - 1)) * iw;
  const y = (n) => PT + ih - (n / total) * ih;

  // keep long series light: at most ~90 steps
  const stride = Math.max(1, Math.ceil(total / 90));
  const stepIds = (upTo) => {
    const ids = [];
    for (let i = 1; i <= upTo; i++) if (i === 1 || i === upTo || i % stride === 0) ids.push(i);
    return ids;
  };
  const steps = (upTo) => {
    if (upTo < 1) return "";
    const ids = stepIds(upTo);
    let d = `M ${x(ids[0])} ${y(0)} V ${y(ids[0])}`;
    ids.slice(1).forEach((i) => {
      d += ` H ${x(i)} V ${y(i)}`;
    });
    return d;
  };

  const fullPath = steps(total);
  const airedPath = steps(aired);
  const areaPath = aired > 0 ? `${airedPath} V ${y(0)} H ${x(1)} Z` : "";
  const showDots = total <= 40;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ aspectRatio: `${W} / ${H}`, maxHeight: 300 }}
      role="img"
      aria-label={`Episode release graph: ${aired} of ${total} episodes aired`}
    >
      <defs>
        <linearGradient id="tl-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity=".35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="tl-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      {/* grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={PL}
          x2={W - PR}
          y1={y(total * f)}
          y2={y(total * f)}
          stroke="rgba(255,255,255,.06)"
          strokeDasharray={f === 0 ? "0" : "3 5"}
        />
      ))}

      {/* planned (full run) */}
      <path
        d={fullPath}
        fill="none"
        stroke="rgba(255,255,255,.16)"
        strokeWidth="1.5"
        strokeDasharray="4 5"
        strokeLinejoin="round"
      />

      {/* aired area + line */}
      {areaPath && (
        <motion.path
          d={areaPath}
          fill="url(#tl-fill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.3 }}
        />
      )}
      {airedPath && (
        <motion.path
          d={airedPath}
          fill="none"
          stroke="url(#tl-stroke)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      )}

      {/* episode dots */}
      {showDots &&
        Array.from({ length: total }, (_, k) => k + 1).map((i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(i)}
            r="2.6"
            fill={i <= aired ? ACCENT : "#0a0a14"}
            stroke={i <= aired ? "#0a0a14" : "rgba(255,255,255,.22)"}
            strokeWidth="1"
          />
        ))}

      {/* "now" marker for airing shows */}
      {state === "airing" && aired > 0 && (
        <g>
          <circle cx={x(aired)} cy={y(aired)} r="9" fill="rgba(236,72,153,.25)">
            <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values=".8;0;.8" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={x(aired)} cy={y(aired)} r="4.5" fill="#fff" stroke="#ec4899" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════ */
const STATE_PILL = {
  airing: { label: "Airing now", color: "#86efac", bg: "rgba(34,197,94,.12)", br: "rgba(34,197,94,.3)" },
  finished: { label: "Completed", color: ACCENT, bg: "rgba(99,102,241,.14)", br: "rgba(99,102,241,.3)" },
  upcoming: { label: "Upcoming", color: "#fde047", bg: "rgba(234,179,8,.12)", br: "rgba(234,179,8,.3)" },
};

const EpisodeInfo = ({ anime }) => {
  const tl = useMemo(() => (anime ? buildTimeline(anime) : null), [anime]);

  if (!anime) return null;

  const start = toDate(anime.aired?.from);
  const end = toDate(anime.aired?.to);
  const isAiring = anime.status === "Currently Airing";

  const cards = [
    {
      icon: <Film size={15} className="text-indigo-400" />,
      label: "Episodes",
      value: anime.episodes ? `${anime.episodes}` : "Unknown",
      sub: anime.type === "Movie" ? "Feature film" : anime.type,
    },
    {
      icon: <Tv size={15} className="text-purple-400" />,
      label: "Season",
      value: anime.season ? `${cap(anime.season)} ${anime.year ?? ""}`.trim() : anime.year ? String(anime.year) : "Unknown",
      sub: anime.season || anime.year ? "Premiered" : "Not available",
    },
    {
      icon: <Clock size={15} className="text-cyan-400" />,
      label: "Duration",
      value: anime.duration || "Unknown",
      sub: "Per episode",
    },
    {
      icon: <Radio size={15} className="text-green-400" />,
      label: "Broadcast",
      value: anime.broadcast?.string || "Unknown",
      sub: anime.broadcast?.timezone || "",
    },
  ];

  const pill = tl ? STATE_PILL[tl.state] : null;
  const pct = tl ? Math.round((tl.aired / tl.total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* ── stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {cards.map(({ icon, label, value, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl p-3.5 sm:p-4 min-w-0"
            style={{ background: SURFACE, border: BORDER }}
          >
            <div className="flex items-center gap-2 mb-2">
              {icon}
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold" style={{ color: DIM }}>
                {label}
              </span>
            </div>
            <p className="font-semibold text-sm sm:text-[15px] leading-tight break-words" style={{ color: "var(--text-heading, #fff)" }}>{value}</p>
            {sub && (
              <p className="text-[11px] mt-1 truncate" style={{ color: DIM }}>
                {sub}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── airing timeline graph ── */}
      {tl ? (
        <div className="rounded-2xl p-4 sm:p-5" style={{ background: SURFACE, border: BORDER }}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Activity size={14} style={{ color: "#818cf8" }} />
              <p className="text-[11px] uppercase tracking-[.16em] font-semibold" style={{ color: "var(--text-muted, rgba(148,163,184,.65))" }}>
                Airing timeline
              </p>
            </div>
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: pill.bg, border: `1px solid ${pill.br}`, color: pill.color }}
            >
              {pill.label}
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] items-center">
            <div className="min-w-0">
              <TimelineChart tl={tl} />
              <div className="flex items-center justify-between mt-2 text-[11px] sm:text-xs">
                <span style={{ color: "var(--text-muted, rgba(255,255,255,.6))" }}>
                  <span style={{ color: DIM }}>Start · </span>
                  {fmt(tl.start)}
                </span>
                <span style={{ color: isAiring ? "#86efac" : "var(--text-muted, rgba(255,255,255,.6))" }}>
                  <span style={{ color: DIM }}>{isAiring && !end ? "Est. end · " : "End · "}</span>
                  {fmt(tl.end)}
                </span>
              </div>
            </div>

            <dl className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-4">
              <div>
                <dt className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: DIM }}>
                  {tl.estimated ? "Aired (est.)" : "Aired"}
                </dt>
                <dd className="font-bold text-lg sm:text-xl leading-tight" style={{ color: "var(--text-heading, #fff)" }}>
                  {tl.aired}
                  <span className="text-xs font-medium" style={{ color: DIM }}> / {tl.total}</span>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: DIM }}>
                  Remaining
                </dt>
                <dd className="font-bold text-lg sm:text-xl leading-tight" style={{ color: "var(--text-heading, #fff)" }}>{tl.total - tl.aired}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: DIM }}>
                  Progress · {pct}%
                </dt>
                <dd>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.07)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg,#6366f1,#ec4899)" }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          {tl.estimated && (
            <p className="mt-3 text-[11px]" style={{ color: DIM }}>
              Estimated from the start date, assuming one episode per week.
            </p>
          )}
        </div>
      ) : (
        (start || end) && (
          <div className="rounded-2xl p-4 sm:p-5" style={{ background: SURFACE, border: BORDER }}>
            <p
              className="text-[11px] uppercase tracking-[.16em] font-semibold mb-3 flex items-center gap-2"
              style={{ color: "var(--text-muted, rgba(148,163,184,.65))" }}
            >
              <Calendar size={13} style={{ color: "#818cf8" }} />
              {anime.type === "Movie" ? "Release" : "Airing period"}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[11px] mb-0.5" style={{ color: DIM }}>
                  {anime.type === "Movie" ? "Released" : "Started"}
                </p>
                <p className="text-sm font-medium" style={{ color: "var(--text-heading, #fff)" }}>{fmt(start)}</p>
              </div>
              {anime.type !== "Movie" && (
                <>
                  <ChevronRight size={16} className="flex-shrink-0" style={{ color: DIM }} />
                  <div className="flex-1 text-right">
                    <p className="text-[11px] mb-0.5" style={{ color: DIM }}>
                      Ended
                    </p>
                    <p className="text-sm font-medium" style={{ color: isAiring ? "#86efac" : "var(--text-heading, #fff)" }}>
                      {isAiring ? "Ongoing" : fmt(end)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default EpisodeInfo;