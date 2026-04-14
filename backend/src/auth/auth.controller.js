import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { col, fn, Op, where } from "sequelize";
import models from "../models/index.js";

dotenv.config();

const { JWT_SECRET } = process.env;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "8h";
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN ?? undefined;
const AUTH_MODE = (process.env.AUTH_MODE || "hybrid").toLowerCase();
const envAuthOnly = AUTH_MODE === "env";

const parseDurationToMs = (value) => {
  if (!value || typeof value !== "string") return 8 * 60 * 60 * 1000;
  if (value.endsWith("h")) return parseInt(value.slice(0, -1), 10) * 3600 * 1000;
  if (value.endsWith("m")) return parseInt(value.slice(0, -1), 10) * 60 * 1000;
  if (value.endsWith("d")) return parseInt(value.slice(0, -1), 10) * 24 * 3600 * 1000;
  if (/^\d+$/.test(value)) return parseInt(value, 10) * 1000;
  return 8 * 60 * 60 * 1000;
};

const cookieOptions = () => {
  const options = {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SECURE ? "none" : "lax",
    maxAge: parseDurationToMs(JWT_EXPIRES_IN),
    path: "/",
  };
  if (COOKIE_DOMAIN && COOKIE_DOMAIN.trim()) options.domain = COOKIE_DOMAIN;
  return options;
};

const signToken = (payload) => {
  if (!JWT_SECRET) throw new Error("JWT_SECRET no configurado");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const FALLBACK_USERS = [
  {
    email: process.env.ADMIN_EMAIL || "admin@sanaya.local",
    password: process.env.ADMIN_PASSWORD || "admin123",
    nombres: process.env.ADMIN_NOMBRES || "Super",
    apellidos: process.env.ADMIN_APELLIDOS || "Admin",
    rol: (process.env.ADMIN_ROL || "SUPER_ADMIN").toUpperCase(),
    estado: 1,
  },
  {
    email: process.env.ADMIN_EMAIL_SECONDARY || "admin@sanaya.com",
    password: process.env.ADMIN_PASSWORD_SECONDARY || "123456",
    nombres: process.env.ADMIN_NOMBRES_SECONDARY || "Admin",
    apellidos: process.env.ADMIN_APELLIDOS_SECONDARY || "Secundario",
    rol: (process.env.ADMIN_ROL_SECONDARY || "SUPER_ADMIN").toUpperCase(),
    estado: 1,
  },
].map((user) => ({
  ...user,
  email: String(user.email).trim().toLowerCase(),
}));

const isMissingUsersTableError = (error) => {
  const message = String(error?.message || "").toUpperCase();
  return message.includes("ORA-00942") || message.includes("APP_USUARIOS");
};

class AuthController {
  static async login(req, res) {
    try {
      const { email, password, documento } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña requeridos" });
      }

      const normalizedEmail = String(email).trim().toLowerCase();

      let plain = null;

      try {
        const user = await models.AppUsuario.findOne({
          where: where(fn("LOWER", col("USUA_EMAIL")), normalizedEmail),
        });
        if (user) plain = user.get({ plain: true });
      } catch (error) {
        if (!envAuthOnly && !isMissingUsersTableError(error)) throw error;
      }

      if (!plain) {
        const fallbackUser = FALLBACK_USERS.find(
          (candidate) => candidate.email === normalizedEmail,
        );
        if (!fallbackUser) return res.status(401).json({ error: "Credenciales inválidas" });

        if (fallbackUser.estado !== 1) {
          return res.status(403).json({ error: "Usuario inactivo" });
        }

        if (password !== fallbackUser.password) {
          return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const token = signToken({
          id: `env:${fallbackUser.email}`,
          email: fallbackUser.email,
          rol: fallbackUser.rol,
          nombres: fallbackUser.nombres,
          apellidos: fallbackUser.apellidos,
          source: "env",
        });

        res.clearCookie("access_token", { httpOnly: true, path: "/" });
        res.cookie("access_token", token, cookieOptions());

        return res.json({
          message: "Login exitoso",
          token,
          user: {
            id: `env:${fallbackUser.email}`,
            email: fallbackUser.email,
            nombres: fallbackUser.nombres,
            apellidos: fallbackUser.apellidos,
            rol: fallbackUser.rol,
          },
        });
      }

      if (plain.usua_estado !== 1) {
        return res.status(403).json({ error: "Usuario inactivo" });
      }

      const rolesWithoutDocument = new Set(["SUPER_ADMIN", "ADMIN"]);

      if (!rolesWithoutDocument.has(plain.usua_rol)) {
        if (!documento) {
          return res.status(400).json({
            error: "Documento requerido para usuarios no administradores",
          });
        }

        const normalizedDoc = String(documento).trim().toUpperCase();
        const tercero = await models.Tercero.findOne({
          where: {
            [Op.and]: [
              where(fn("LOWER", col("TERC_CORREO")), normalizedEmail),
              where(fn("UPPER", col("TERC_NRO_DOC")), normalizedDoc),
            ],
          },
          attributes: ["terc_id", "terc_correo", "terc_nro_doc"],
          raw: true,
        });

        if (!tercero) {
          return res.status(401).json({
            error: "Credenciales inválidas para tercero (correo/documento)",
          });
        }
      }

      const ok = await bcrypt.compare(password, plain.usua_password);
      if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

      const token = signToken({
        id: plain.usua_id,
        email: plain.usua_email,
        rol: plain.usua_rol,
      });

      res.clearCookie("access_token", { httpOnly: true, path: "/" });
      res.cookie("access_token", token, cookieOptions());

      return res.json({
        message: "Login exitoso",
        token,
        user: {
          id: plain.usua_id,
          email: plain.usua_email,
          nombres: plain.usua_nombres,
          apellidos: plain.usua_apellidos,
          rol: plain.usua_rol,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async me(req, res) {
    try {
      if (!req.user?.id) return res.status(401).json({ error: "No autenticado" });

      if (req.user.source === "env") {
        return res.json({
          user: {
            id: req.user.id,
            email: req.user.email,
            nombres: req.user.nombres,
            apellidos: req.user.apellidos,
            rol: req.user.rol,
          },
        });
      }

      const user = await models.AppUsuario.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

      const plain = user.get({ plain: true });
      return res.json({
        user: {
          id: plain.usua_id,
          email: plain.usua_email,
          nombres: plain.usua_nombres,
          apellidos: plain.usua_apellidos,
          rol: plain.usua_rol,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static logout(req, res) {
    const clearOptions = {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SECURE ? "none" : "lax",
      path: "/",
    };
    if (COOKIE_DOMAIN && COOKIE_DOMAIN.trim()) clearOptions.domain = COOKIE_DOMAIN;
    res.clearCookie("access_token", clearOptions);
    return res.json({ message: "Logout exitoso" });
  }
}

export default AuthController;
