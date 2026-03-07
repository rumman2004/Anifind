import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import favoritesRoutes from "./routes/favoritesRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

/* ══════════════════════════════════════════════════════════
   DB
══════════════════════════════════════════════════════════ */
connectDB();

/* ══════════════════════════════════════════════════════════
   CORS
══════════════════════════════════════════════════════════ */
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no Origin header
    // Examples: Postman, mobile apps, server-to-server, uptime checks
    if (!origin) {
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: origin "${origin}" is not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count"],
  optionsSuccessStatus: 200,
};

/* ══════════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════════ */
const app = express();

/* ── global middleware ── */
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ── lightweight security headers ── */
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

/* ── rate limiter ── */
app.use("/api", apiLimiter);

/* ══════════════════════════════════════════════════════════
   ROUTES
══════════════════════════════════════════════════════════ */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/favorites", favoritesRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "AniFind API is running 🚀",
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/* optional root route */
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AniFind backend is live 🚀",
  });
});

/* ══════════════════════════════════════════════════════════
   ERROR HANDLERS
══════════════════════════════════════════════════════════ */
app.use(notFound);
app.use(errorHandler);

/* ══════════════════════════════════════════════════════════
   LOCAL SERVER
══════════════════════════════════════════════════════════ */
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  });
}

/* ══════════════════════════════════════════════════════════
   EXPORT FOR VERCEL
══════════════════════════════════════════════════════════ */
export default app;