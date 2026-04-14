import dotenv from "dotenv";
import oracledb from "oracledb";
import { Sequelize } from "sequelize";

dotenv.config();

const truthyValues = new Set(["1", "true", "yes", "on"]);

const useThickMode = truthyValues.has(String(process.env.ORACLE_USE_THICK || "").toLowerCase());

if (useThickMode) {
  const libDir = process.env.ORACLE_CLIENT_LIB_DIR?.trim();
  oracledb.initOracleClient(libDir ? { libDir } : undefined);
}

const host = process.env.ORACLE_HOST || "localhost";
const port = Number(process.env.ORACLE_PORT || 1521);
const service = (process.env.ORACLE_DB || "XEPDB1").trim();
const connectString = (process.env.ORACLE_CONNECT_STRING || `${host}:${port}/${service}`).trim();

if (
  process.env.ORACLE_CONNECT_STRING &&
  !process.env.ORACLE_CONNECT_STRING.includes(`/${service}`)
) {
  console.warn(
    `[DB] ORACLE_CONNECT_STRING (${process.env.ORACLE_CONNECT_STRING}) no coincide con ORACLE_DB (${service}).`,
  );
}

if (process.env.NODE_ENV !== "production") {
  console.info("[DB] Oracle service:", service);
  console.info("[DB] Oracle connect string:", connectString);
  console.info("[DB] Oracle user:", process.env.ORACLE_USER);
}

export const sequelize = new Sequelize(service, process.env.ORACLE_USER, process.env.ORACLE_PASS, {
  host,
  dialect: "oracle",
  dialectModule: oracledb,
  dialectOptions: {
    connectString,
  },
  port,
  logging: false,
});
