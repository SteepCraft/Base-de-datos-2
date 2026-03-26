import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const Tercero = sequelize.define(
  "TERCEROS",
  {
    terc_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: "TERC_ID",
    },
    terc_tipo_doc: {
      type: DataTypes.STRING(2),
      allowNull: true,
      field: "TERC_TIPO_DOC",
    },
    terc_nro_doc: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "TERC_NRO_DOC",
    },
    terc_genero: {
      type: DataTypes.STRING(1),
      allowNull: true,
      field: "TERC_GENERO",
    },
    terc_nombres: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "TERC_NOMBRES",
    },
    terc_apellidos: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "TERC_APELLIDOS",
    },
    terc_direc: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "TERC_DIREC",
    },
    terc_correo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "TERC_CORREO",
    },
    terc_movil: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "TERC_MOVIL",
    },
    terc_tipo: {
      type: DataTypes.STRING(1),
      allowNull: true,
      field: "TERC_TIPO",
    },
  },
  {
    tableName: "TERCEROS",
    timestamps: false,
    freezeTableName: true,
  }
);

export default Tercero;
