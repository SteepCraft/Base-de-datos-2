import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.ORACLE_DB,
  process.env.ORACLE_USER,
  process.env.ORACLE_PASS,
  {
    host: process.env.ORACLE_HOST,
    dialect: "oracle", // Sequelize no soporta Oracle oficialmente, pero se deja como referencia
    // dialectModule: oracledb, // Si existiera un dialecto compatible
    port: process.env.ORACLE_PORT || 1521,
    logging: false,
  }
);
