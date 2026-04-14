import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const Prematricula = sequelize.define(
  "PREMATRICULAS",
  {
    prem_periodo: {
      type: DataTypes.STRING(6),
      allowNull: false,
      primaryKey: true,
      field: "PREM_PERIODO",
    },
    terc_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: "TERC_ID",
    },
    asig_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: "ASIG_ID",
    },
  },
  {
    tableName: "PREMATRICULAS",
    timestamps: false,
    freezeTableName: true,
  },
);

export default Prematricula;
