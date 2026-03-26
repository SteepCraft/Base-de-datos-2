import api from "./api";

export const SANAYA_ENTITIES = {
  terceros: {
    label: "Terceros",
    pk: ["terc_id"],
    fields: [
      "terc_id",
      "terc_tipo_doc",
      "terc_nro_doc",
      "terc_genero",
      "terc_nombres",
      "terc_apellidos",
      "terc_direc",
      "terc_correo",
      "terc_movil",
      "terc_tipo",
    ],
  },
  asignaturas: {
    label: "Asignaturas",
    pk: ["asig_id"],
    fields: ["asig_id", "asig_asignatura", "asig_creditos", "asig_codigo"],
  },
  programas: {
    label: "Programas",
    pk: ["prog_id"],
    fields: ["prog_id", "prog_programa"],
  },
  cursos: {
    label: "Cursos",
    pk: ["curs_id"],
    fields: ["curs_id", "terc_id", "asig_id", "curs_periodo"],
  },
  pensums: {
    label: "Pensums",
    pk: ["pens_id"],
    fields: ["pens_id", "prog_id", "pens_periodo"],
  },
  historias: {
    label: "Historias",
    pk: ["hist_periodo", "terc_id", "curs_id"],
    fields: ["hist_periodo", "terc_id", "curs_id", "hist_nota"],
  },
  "detalle-pensums": {
    label: "Detalle Pensums",
    pk: ["pens_id", "asig_id"],
    fields: ["pens_id", "asig_id", "detape_nivel"],
  },
  "terc-pensums": {
    label: "Tercero Pensums",
    pk: ["pens_id", "terc_id"],
    fields: ["pens_id", "terc_id", "tepe_periodo"],
  },
  prematriculas: {
    label: "Prematriculas",
    pk: ["prem_periodo", "terc_id", "asig_id"],
    fields: ["prem_periodo", "terc_id", "asig_id"],
  },
  auditorias: {
    label: "Auditorias",
    pk: ["audi_usuario", "audi_fecha", "terc_id", "curs_id"],
    fields: [
      "audi_usuario",
      "audi_fecha",
      "terc_id",
      "curs_id",
      "hist_nota_ant",
      "hist_nota_desp",
    ],
  },
};

const basePath = "/sanaya";

export const listEntity = async (entity) => {
  const response = await api.get(`${basePath}/${entity}`);
  return response.data;
};

export const createEntity = async (entity, payload) => {
  const response = await api.post(`${basePath}/${entity}`, payload);
  return response.data;
};

export const updateEntity = async (entity, pkFields, pkValues, payload) => {
  if (pkFields.length === 1) {
    const response = await api.put(
      `${basePath}/${entity}/id/${pkValues[pkFields[0]]}`,
      payload
    );
    return response.data;
  }

  const response = await api.put(`${basePath}/${entity}/one`, payload, {
    params: pkValues,
  });
  return response.data;
};

export const deleteEntity = async (entity, pkFields, pkValues) => {
  if (pkFields.length === 1) {
    await api.delete(`${basePath}/${entity}/id/${pkValues[pkFields[0]]}`);
    return;
  }

  await api.delete(`${basePath}/${entity}/one`, { params: pkValues });
};
