import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const Pensum = sequelize.define(
  "PENSUMS",
  {
    pens_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: "PENS_ID",
    },
    prog_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: "PROG_ID",
    },
    pens_periodo: {
      type: DataTypes.STRING(6),
      allowNull: true,
      field: "PENS_PERIODO",
    },
  },
  {
    tableName: "PENSUMS",
    timestamps: false,
    freezeTableName: true,
  },
);

export default Pensum;
