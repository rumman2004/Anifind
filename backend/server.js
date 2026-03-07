// server/index.js
import express    from "express";
import cors       from "cors";
import dotenv     from "dotenv";
import { connectDB }                    from "./config/db.js";
import authRoutes                       from "./routes/authRoutes.js";
import userRoutes                       from "./routes/userRoutes.js";
import favoritesRoutes                  from "./routes/favoritesRoutes.js";
import { errorHandler, notFound }       from "./middleware/errorMiddleware.js";
import { apiLimiter }                   from "./middleware/rateLimiter.js";

dotenv.config();

/* ══════════════════════════════════════════════════════════
   DB  — connect once; on Vercel each cold start reconnects
══════════════════════════════════════════════════════════ */
connectDB();

/* ══════════════════════════════════════════════════════════
   CORS  — allow every origin you deploy to
══════════════════════════════════════════════════════════ */
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  "http://localhost:5173",                 
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // allow server-to-server / curl (no Origin header) in dev
    if (!origin && process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin "${origin}" is not allowed`));
  },
  credentials:         true,
  methods:             ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders:      ["Content-Type", "Authorization"],
  exposedHeaders:      ["X-Total-Count"],   // useful for pagination
  optionsSuccessStatus: 200,               // IE 11 compat
};

/* ══════════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════════ */
const app = express();

/* ── global middleware ── */
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));        // pre-flight for every route
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ── security headers (lightweight, no extra package) ── */
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options",        "DENY");
  res.setHeader("X-XSS-Protection",       "1; mode=block");
  res.setHeader("Referrer-Policy",        "strict-origin-when-cross-origin");
  next();
});

/* ── rate limiter on every /api route ── */
app.use("/api", apiLimiter);

/* ══════════════════════════════════════════════════════════
   ROUTES
══════════════════════════════════════════════════════════ */
app.use("/api/auth",      authRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/favorites", favoritesRoutes);

/* ── health check — Vercel + UptimeRobot friendly ── */
app.get("/api/health", (_req, res) => {
  res.json({
    status:    "ok",
    message:   "AniFind API is running 🚀",
    env:       process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  });
});

/* ══════════════════════════════════════════════════════════
   ERROR HANDLERS  (must be last)
══════════════════════════════════════════════════════════ */
app.use(notFound);
app.use(errorHandler);

/* ══════════════════════════════════════════════════════════
   LOCAL SERVER  — Vercel ignores this block entirely;
   it imports `app` via the export below instead.
══════════════════════════════════════════════════════════ */
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀  Server running → http://localhost:${PORT}`);
    console.log(`📡  Health check  → http://localhost:${PORT}/api/health\n`);
  });
}

/* ══════════════════════════════════════════════════════════
   VERCEL SERVERLESS EXPORT
   Vercel calls this export as a serverless function handler.
══════════════════════════════════════════════════════════ */
export default app;