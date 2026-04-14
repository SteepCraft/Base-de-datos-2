import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const Curso = sequelize.define(
  "CURSOS",
  {
    curs_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: "CURS_ID",
    },
    terc_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: "TERC_ID",
    },
    asig_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: "ASIG_ID",
    },
    curs_periodo: {
      type: DataTypes.STRING(6),
      allowNull: true,
      field: "CURS_PERIODO",
    },
  },
  {
    tableName: "CURSOS",
    timestamps: false,
    freezeTableName: true,
  },
);

export default Curso;
