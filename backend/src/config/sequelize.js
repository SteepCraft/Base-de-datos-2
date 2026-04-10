import dotenv from "dotenv";
import oracledb from "oracledb";
import { Sequelize } from "sequelize";

dotenv.config();

const truthyValues = new Set(["1", "true", "yes", "on"]);

const useThickMode = truthyValues.has(
  String(process.env.ORACLE_USE_THICK || "").toLowerCase()
);

if (useThickMode) {
  const libDir = process.env.ORACLE_CLIENT_LIB_DIR?.trim();
  oracledb.initOracleClient(libDir ? { libDir } : undefined);
}

const host = process.env.ORACLE_HOST;
const port = Number(process.env.ORACLE_PORT || 1521);
const service = process.env.ORACLE_DB;
const connectString =
  process.env.ORACLE_CONNECT_STRING || `${host}:${port}/${service}`;

if (process.env.NODE_ENV !== "production") {
  console.log("[DB] Oracle connect string:", connectString);
  console.log("[DB] Oracle user:", process.env.ORACLE_USER);
}

export const sequelize = new Sequelize(
  service,
  process.env.ORACLE_USER,
  process.env.ORACLE_PASS,
  {
    host,
    dialect: "oracle",
    dialectModule: oracledb,
    dialectOptions: {
      connectString,
    },
    port,
    logging: false,
  }
);
