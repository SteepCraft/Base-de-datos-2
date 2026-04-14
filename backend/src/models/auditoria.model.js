import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const Auditoria = sequelize.define(
  "AUDITORIAS",
  {
    audi_usuario: {
      type: DataTypes.STRING(50),
      allowNull: true,
      primaryKey: true,
      field: "AUDI_USUARIO",
    },
    audi_fecha: {
      type: DataTypes.DATE,
      allowNull: true,
      primaryKey: true,
      field: "AUDI_FECHA",
    },
    terc_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      primaryKey: true,
      field: "TERC_ID",
    },
    curs_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      primaryKey: true,
      field: "CURS_ID",
    },
    hist_nota_ant: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: true,
      field: "HIST_NOTA_ANT",
    },
    hist_nota_desp: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: true,
      field: "HIST_NOTA_DESP",
    },
  },
  {
    tableName: "AUDITORIAS",
    timestamps: false,
    freezeTableName: true,
  },
);

export default Auditoria;
