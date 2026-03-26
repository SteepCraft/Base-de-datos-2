import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const Historia = sequelize.define(
  "HISTORIAS",
  {
    hist_periodo: {
      type: DataTypes.STRING(6),
      allowNull: false,
      primaryKey: true,
      field: "HIST_PERIODO",
    },
    terc_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: "TERC_ID",
    },
    curs_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: "CURS_ID",
    },
    hist_nota: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: true,
      field: "HIST_NOTA",
    },
  },
  {
    tableName: "HISTORIAS",
    timestamps: false,
    freezeTableName: true,
  }
);

export default Historia;
