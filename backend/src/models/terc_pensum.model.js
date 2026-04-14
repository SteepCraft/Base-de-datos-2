import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const TercPensum = sequelize.define(
  "TERC_PENSUMS",
  {
    pens_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: "PENS_ID",
    },
    terc_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: "TERC_ID",
    },
    tepe_periodo: {
      type: DataTypes.STRING(6),
      allowNull: true,
      field: "TEPE_PERIODO",
    },
  },
  {
    tableName: "TERC_PENSUMS",
    timestamps: false,
    freezeTableName: true,
  },
);

export default TercPensum;
