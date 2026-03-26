import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const { JWT_SECRET } = process.env;

export const authenticate = (req, res, next) => {
  try {
    let token = req.cookies?.access_token;

    if (!token && req.headers.authorization) {
      const [scheme, value] = req.headers.authorization.split(" ");
      if (scheme === "Bearer" && value) token = value;
    }

    if (!token) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!JWT_SECRET) {
      return res.status(500).json({ error: "JWT_SECRET no configurado" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol,
    };
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
