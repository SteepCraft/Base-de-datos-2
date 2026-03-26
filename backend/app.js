import { randomBytes } from "crypto";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { authenticate } from "./src/auth/auth.middleware.js";
import authRoutes from "./src/auth/auth.routes.js";
import { sequelize } from "./src/config/sequelize.js";
import models from "./src/models/index.js";
import sanayaRoutes from "./src/routes/sanaya.routes.js";

console.info("✅ Configuración completa cargada correctamente");

const app = express();

const corsWhitelist = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter((url) => url.length > 0);

/**
 * Inicialización de Sequelize y modelos.
 * - Verifica conectividad.
 * - Verifica mapeo de modelos sin alterar el esquema.
 */
(async () => {
  try {
    console.log("ℹ️ Asociaciones cargadas desde models/index.js");

    await sequelize.authenticate();
    console.log("🔗 Conexión con la base de datos establecida correctamente.");

    const modelNames = Object.keys(models).filter(
      (k) =>
        typeof models[k] === "function" &&
        typeof models[k].findOne === "function"
    );

    for (const name of modelNames) {
      const model = models[name];
      try {
        await model.findOne({ raw: true });
        console.log(`✅ Modelo disponible: ${name}`);
      } catch (err) {
        console.warn(`⚠️ Modelo NO accesible: ${name} — ${err.message}`);
      }
    }
  } catch (error) {
    console.error("❌ Error al conectar o inicializar modelos:", error);
    // Si la conexión/initialization falla queremos salir para no correr el servidor en mal estado
    process.exit(1);
  }
})();

/**
 * Middlewares globales
 */

// CORS - Permitir peticiones desde el frontend
const corsOptions = {
  origin: corsWhitelist,
  credentials: true, // Permitir cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para generar nonce único por solicitud
app.use((req, res, next) => {
  res.locals.nonce = randomBytes(16).toString("hex");
  next();
});

// Logger básico (puedes reemplazar por winston/pino más adelante)
app.use((req, res, next) => {
  console.log(`Solicitud entrante: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    userId: req.user?.id || "anonymous",
  });
  next();
});

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message:
    "Demasiadas solicitudes desde esta IP, por favor intenta de nuevo después de 15 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(apiLimiter);

app.use(cookieParser());
app.use("/api/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/sanaya", authenticate, sanayaRoutes);

export default app;
