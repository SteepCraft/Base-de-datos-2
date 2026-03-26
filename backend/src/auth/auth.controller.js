import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import models from "../models/index.js";

dotenv.config();

const { JWT_SECRET } = process.env;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "8h";
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN ?? undefined;

const parseDurationToMs = (value) => {
  if (!value || typeof value !== "string") return 8 * 60 * 60 * 1000;
  if (value.endsWith("h"))
    return parseInt(value.slice(0, -1), 10) * 3600 * 1000;
  if (value.endsWith("m")) return parseInt(value.slice(0, -1), 10) * 60 * 1000;
  if (value.endsWith("d"))
    return parseInt(value.slice(0, -1), 10) * 24 * 3600 * 1000;
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

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña requeridos" });
      }

      const user = await models.AppUsuario.findOne({
        where: { usua_email: email },
      });

      if (!user)
        return res.status(401).json({ error: "Credenciales inválidas" });

      const plain = user.get({ plain: true });
      if (plain.usua_estado !== 1) {
        return res.status(403).json({ error: "Usuario inactivo" });
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
      if (!req.user?.id)
        return res.status(401).json({ error: "No autenticado" });

      const user = await models.AppUsuario.findByPk(req.user.id);
      if (!user)
        return res.status(404).json({ error: "Usuario no encontrado" });

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
    if (COOKIE_DOMAIN && COOKIE_DOMAIN.trim())
      clearOptions.domain = COOKIE_DOMAIN;
    res.clearCookie("access_token", clearOptions);
    return res.json({ message: "Logout exitoso" });
  }
}

export default AuthController;
