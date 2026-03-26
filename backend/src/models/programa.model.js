import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const Programa = sequelize.define(
  "PROGRAMAS",
  {
    prog_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: "PROG_ID",
    },
    prog_programa: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "PROG_PROGRAMA",
    },
  },
  {
    tableName: "PROGRAMAS",
    timestamps: false,
    freezeTableName: true,
  }
);

export default Programa;
