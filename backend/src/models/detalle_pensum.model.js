import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const DetallePensum = sequelize.define(
  "DETALLE_PENSUMS",
  {
    pens_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: "PENS_ID",
    },
    asig_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: "ASIG_ID",
    },
    detape_nivel: {
      type: DataTypes.STRING(2),
      allowNull: true,
      field: "DETAPE_NIVEL",
    },
  },
  {
    tableName: "DETALLE_PENSUMS",
    timestamps: false,
    freezeTableName: true,
  },
);

export default DetallePensum;
