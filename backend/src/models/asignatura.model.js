import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const Asignatura = sequelize.define(
  "ASIGNATURAS",
  {
    asig_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: "ASIG_ID",
    },
    asig_asignatura: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "ASIG_ASIGNATURA",
    },
    asig_creditos: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "ASIG_CREDITOS",
    },
    asig_codigo: {
      type: DataTypes.STRING(6),
      allowNull: true,
      field: "ASIG_CODIGO",
    },
  },
  {
    tableName: "ASIGNATURAS",
    timestamps: false,
    freezeTableName: true,
  }
);

export default Asignatura;
