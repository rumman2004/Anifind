// server/index.js
import express         from "express";
import cors            from "cors";
import dotenv          from "dotenv";
import { connectDB }                from "./config/db.js";
import authRoutes                   from "./routes/authRoutes.js";
import userRoutes                   from "./routes/userRoutes.js";
import favoritesRoutes              from "./routes/favoritesRoutes.js";
import { errorHandler, notFound }   from "./middleware/errorMiddleware.js";
import { apiLimiter }               from "./middleware/rateLimiter.js";

dotenv.config();

connectDB();

/* ══════════════════════════════════════════════════════════
   CORS
   "undefined" string guard: CLIENT_URL must be a real URL
   or we skip it entirely rather than adding "undefined"
══════════════════════════════════════════════════════════ */
const RAW_CLIENT_URL = process.env.CLIENT_URL ?? "";

const ALLOWED_ORIGINS = [
  /* only add CLIENT_URL if it looks like a real URL */
  RAW_CLIENT_URL.startsWith("http") ? RAW_CLIENT_URL : null,

  /* local dev origins — always allowed */
  "http://localhost:5173",
].filter(Boolean);

/* log on startup so you can see exactly what is allowed */
console.log("✅  CORS allowed origins:", ALLOWED_ORIGINS);

const corsOptions = {
  origin(origin, callback) {
    /*
     * `origin` is undefined when the request has no Origin header.
     * This happens for:
     *   • same-origin requests
     *   • server-to-server / curl calls
     *   • Vercel's own health-check pings
     *   • some mobile clients
     * → Allow all of these unconditionally.
     */
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);

    /* blocked — return a proper 403 instead of throwing */
    return callback(
      Object.assign(new Error(`CORS: "${origin}" is not allowed`), { status: 403 })
    );
  },
  credentials:          true,
  methods:              ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders:       ["Content-Type", "Authorization"],
  exposedHeaders:       ["X-Total-Count"],
  optionsSuccessStatus: 200,
};

/* ══════════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════════ */
const app = express();

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ── security headers ── */
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options",        "DENY");
  res.setHeader("X-XSS-Protection",       "1; mode=block");
  res.setHeader("Referrer-Policy",        "strict-origin-when-cross-origin");
  next();
});

app.use("/api", apiLimiter);

/* ══════════════════════════════════════════════════════════
   ROUTES
══════════════════════════════════════════════════════════ */
app.use("/api/auth",      authRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/favorites", favoritesRoutes);

/* ── health check ── */
app.get("/api/health", (_req, res) => {
  res.json({
    status:         "ok",
    message:        "AniFind API is running 🚀",
    env:            process.env.NODE_ENV ?? "development",
    allowedOrigins: ALLOWED_ORIGINS,        // ← helpful for debugging
    timestamp:      new Date().toISOString(),
  });
});

/* ══════════════════════════════════════════════════════════
   ERROR HANDLERS
══════════════════════════════════════════════════════════ */
app.use(notFound);
app.use(errorHandler);

/* ══════════════════════════════════════════════════════════
   LOCAL DEV SERVER
══════════════════════════════════════════════════════════ */
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀  Server  → http://localhost:${PORT}`);
    console.log(`📡  Health  → http://localhost:${PORT}/api/health\n`);
  });
}

export default app;