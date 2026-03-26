import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const AppUsuario = sequelize.define(
  "APP_USUARIOS",
  {
    usua_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: "USUA_ID",
    },
    usua_email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: "USUA_EMAIL",
    },
    usua_password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "USUA_PASSWORD",
    },
    usua_nombres: {
      type: DataTypes.STRING(60),
      allowNull: false,
      field: "USUA_NOMBRES",
    },
    usua_apellidos: {
      type: DataTypes.STRING(60),
      allowNull: false,
      field: "USUA_APELLIDOS",
    },
    usua_rol: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "ADMIN",
      field: "USUA_ROL",
    },
    usua_estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: "USUA_ESTADO",
    },
  },
  {
    tableName: "APP_USUARIOS",
    timestamps: false,
    freezeTableName: true,
  }
);

export default AppUsuario;
