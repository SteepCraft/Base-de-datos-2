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
    fieldLabels: {
      terc_id: "ID",
      terc_tipo_doc: "Tipo Documento",
      terc_nro_doc: "# Documento",
      terc_genero: "Género",
      terc_nombres: "Nombres",
      terc_apellidos: "Apellidos",
      terc_direc: "Dirección",
      terc_correo: "Correo",
      terc_movil: "Móvil",
      terc_tipo: "Tipo",
    },
    foreignKeys: {},
    displayFields: ["terc_nombres", "terc_apellidos", "terc_nro_doc"],
  },
  asignaturas: {
    label: "Asignaturas",
    pk: ["asig_id"],
    fields: ["asig_id", "asig_asignatura", "asig_creditos", "asig_codigo"],
    fieldLabels: {
      asig_id: "ID",
      asig_asignatura: "Asignatura",
      asig_creditos: "Créditos",
      asig_codigo: "Código",
    },
    foreignKeys: {},
    displayFields: ["asig_codigo", "asig_asignatura"],
  },
  programas: {
    label: "Programas",
    pk: ["prog_id"],
    fields: ["prog_id", "prog_programa"],
    fieldLabels: {
      prog_id: "ID",
      prog_programa: "Programa",
    },
    foreignKeys: {},
    displayFields: ["prog_programa"],
  },
  cursos: {
    label: "Cursos",
    pk: ["curs_id"],
    fields: ["curs_id", "terc_id", "asig_id", "curs_periodo"],
    fieldLabels: {
      curs_id: "ID",
      terc_id: "Persona",
      asig_id: "Asignatura",
      curs_periodo: "Período",
    },
    foreignKeys: {
      terc_id: "terceros",
      asig_id: "asignaturas",
    },
    displayFields: ["curs_id", "curs_periodo"],
  },
  pensums: {
    label: "Pensums",
    pk: ["pens_id"],
    fields: ["pens_id", "prog_id", "pens_periodo"],
    fieldLabels: {
      pens_id: "ID",
      prog_id: "Programa",
      pens_periodo: "Período",
    },
    foreignKeys: {
      prog_id: "programas",
    },
    displayFields: ["pens_id", "pens_periodo"],
  },
  historias: {
    label: "Historias",
    pk: ["hist_periodo", "terc_id", "curs_id"],
    fields: ["hist_periodo", "terc_id", "curs_id", "hist_nota"],
    fieldLabels: {
      hist_periodo: "Período",
      terc_id: "Persona",
      curs_id: "Curso",
      hist_nota: "Nota",
    },
    foreignKeys: {
      terc_id: "terceros",
      curs_id: "cursos",
    },
    displayFields: ["hist_periodo"],
  },
  "detalle-pensums": {
    label: "Detalle Pensums",
    pk: ["pens_id", "asig_id"],
    fields: ["pens_id", "asig_id", "detape_nivel"],
    fieldLabels: {
      pens_id: "Pensum",
      asig_id: "Asignatura",
      detape_nivel: "Nivel",
    },
    foreignKeys: {
      pens_id: "pensums",
      asig_id: "asignaturas",
    },
    displayFields: ["pens_id", "asig_id"],
  },
  "terc-pensums": {
    label: "Tercero Pensums",
    pk: ["pens_id", "terc_id"],
    fields: ["pens_id", "terc_id", "tepe_periodo"],
    fieldLabels: {
      pens_id: "Pensum",
      terc_id: "Persona",
      tepe_periodo: "Período",
    },
    foreignKeys: {
      pens_id: "pensums",
      terc_id: "terceros",
    },
    displayFields: ["pens_id", "tepe_periodo"],
  },
  prematriculas: {
    label: "Prematriculas",
    pk: ["prem_periodo", "terc_id", "asig_id"],
    fields: ["prem_periodo", "terc_id", "asig_id"],
    fieldLabels: {
      prem_periodo: "Período",
      terc_id: "Persona",
      asig_id: "Asignatura",
    },
    foreignKeys: {
      terc_id: "terceros",
      asig_id: "asignaturas",
    },
    displayFields: ["prem_periodo"],
  },
  auditorias: {
    label: "Auditorias",
    pk: ["audi_usuario", "audi_fecha", "terc_id", "curs_id"],
    fields: ["audi_usuario", "audi_fecha", "terc_id", "curs_id", "hist_nota_ant", "hist_nota_desp"],
    fieldLabels: {
      audi_usuario: "Usuario",
      audi_fecha: "Fecha",
      terc_id: "Persona",
      curs_id: "Curso",
      hist_nota_ant: "Nota Anterior",
      hist_nota_desp: "Nota Después",
    },
    foreignKeys: {
      terc_id: "terceros",
      curs_id: "cursos",
    },
    displayFields: ["audi_usuario", "audi_fecha"],
  },
};

const basePath = "/sanaya";

const cleanOptionLabel = (label) => {
  if (label === null || label === undefined) {
    return "";
  }

  return String(label)
    .replace(/\(\s*ID\s*:\s*[^)]+\)/gi, "")
    .replace(/\bID\s*\d+\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

// Context helper API
export const getEntityOptions = async (entity, searchQuery = "") => {
  try {
    const response = await api.get(`${basePath}/${entity}/options`, {
      params: { q: searchQuery },
    });
    return response.data.map((item) => ({
      ...item,
      label: cleanOptionLabel(item.label),
    }));
  } catch (error) {
    console.error(`Error fetching options for ${entity}:`, error);
    return [];
  }
};

export const searchEntity = async (entity, searchQuery = "", limit = 50, offset = 0) => {
  try {
    const response = await api.get(`${basePath}/${entity}/search`, {
      params: { q: searchQuery, limit, offset },
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching ${entity}:`, error);
    return [];
  }
};

// Legacy CRUD
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
    const response = await api.put(`${basePath}/${entity}/id/${pkValues[pkFields[0]]}`, payload);
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
