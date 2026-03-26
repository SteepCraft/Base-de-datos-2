import models from "../models/index.js";

const ENTITIES = {
  terceros: { model: "Tercero", pk: ["terc_id"] },
  asignaturas: { model: "Asignatura", pk: ["asig_id"] },
  programas: { model: "Programa", pk: ["prog_id"] },
  cursos: { model: "Curso", pk: ["curs_id"] },
  pensums: { model: "Pensum", pk: ["pens_id"] },
  historias: { model: "Historia", pk: ["hist_periodo", "terc_id", "curs_id"] },
  "detalle-pensums": { model: "DetallePensum", pk: ["pens_id", "asig_id"] },
  "terc-pensums": { model: "TercPensum", pk: ["pens_id", "terc_id"] },
  prematriculas: {
    model: "Prematricula",
    pk: ["prem_periodo", "terc_id", "asig_id"],
  },
  auditorias: {
    model: "Auditoria",
    pk: ["audi_usuario", "audi_fecha", "terc_id", "curs_id"],
  },
};

const parseEntity = (entityName) => ENTITIES[entityName];

const getModel = (entityName) => {
  const entity = parseEntity(entityName);
  if (!entity) return null;
  return { entity, model: models[entity.model] };
};

const buildWhereFromQuery = (pkFields, query) => {
  const where = {};
  for (const key of pkFields) {
    if (query[key] === undefined || query[key] === "") {
      return { error: `Falta el parámetro '${key}' en query` };
    }
    where[key] = query[key];
  }
  return { where };
};

class SanayaController {
  static async list(req, res) {
    try {
      const modelConfig = getModel(req.params.entity);
      if (!modelConfig || !modelConfig.model) {
        return res.status(404).json({ error: "Entidad no soportada" });
      }
      const rows = await modelConfig.model.findAll();
      return res.json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const modelConfig = getModel(req.params.entity);
      if (!modelConfig || !modelConfig.model) {
        return res.status(404).json({ error: "Entidad no soportada" });
      }

      const { entity, model } = modelConfig;
      if (entity.pk.length !== 1) {
        return res.status(400).json({
          error:
            "Esta entidad usa llave compuesta. Usa query params con las llaves primarias.",
          pk: entity.pk,
        });
      }

      const row = await model.findByPk(req.params.id);
      if (!row)
        return res.status(404).json({ error: "Registro no encontrado" });
      return res.json(row);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getOneByPkQuery(req, res) {
    try {
      const modelConfig = getModel(req.params.entity);
      if (!modelConfig || !modelConfig.model) {
        return res.status(404).json({ error: "Entidad no soportada" });
      }

      const { entity, model } = modelConfig;
      const parsed = buildWhereFromQuery(entity.pk, req.query);
      if (parsed.error)
        return res.status(400).json({ error: parsed.error, pk: entity.pk });

      const row = await model.findOne({ where: parsed.where });
      if (!row)
        return res.status(404).json({ error: "Registro no encontrado" });
      return res.json(row);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const modelConfig = getModel(req.params.entity);
      if (!modelConfig || !modelConfig.model) {
        return res.status(404).json({ error: "Entidad no soportada" });
      }
      const row = await modelConfig.model.create(req.body);
      return res.status(201).json(row);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateById(req, res) {
    try {
      const modelConfig = getModel(req.params.entity);
      if (!modelConfig || !modelConfig.model) {
        return res.status(404).json({ error: "Entidad no soportada" });
      }

      const { entity, model } = modelConfig;
      if (entity.pk.length !== 1) {
        return res.status(400).json({
          error:
            "Esta entidad usa llave compuesta. Usa query params con las llaves primarias.",
          pk: entity.pk,
        });
      }

      const [updated] = await model.update(req.body, {
        where: { [entity.pk[0]]: req.params.id },
      });
      if (!updated)
        return res.status(404).json({ error: "Registro no encontrado" });

      const row = await model.findByPk(req.params.id);
      return res.json(row);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateByPkQuery(req, res) {
    try {
      const modelConfig = getModel(req.params.entity);
      if (!modelConfig || !modelConfig.model) {
        return res.status(404).json({ error: "Entidad no soportada" });
      }

      const { entity, model } = modelConfig;
      const parsed = buildWhereFromQuery(entity.pk, req.query);
      if (parsed.error)
        return res.status(400).json({ error: parsed.error, pk: entity.pk });

      const [updated] = await model.update(req.body, { where: parsed.where });
      if (!updated)
        return res.status(404).json({ error: "Registro no encontrado" });

      const row = await model.findOne({ where: parsed.where });
      return res.json(row);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async deleteById(req, res) {
    try {
      const modelConfig = getModel(req.params.entity);
      if (!modelConfig || !modelConfig.model) {
        return res.status(404).json({ error: "Entidad no soportada" });
      }

      const { entity, model } = modelConfig;
      if (entity.pk.length !== 1) {
        return res.status(400).json({
          error:
            "Esta entidad usa llave compuesta. Usa query params con las llaves primarias.",
          pk: entity.pk,
        });
      }

      const deleted = await model.destroy({
        where: { [entity.pk[0]]: req.params.id },
      });
      if (!deleted)
        return res.status(404).json({ error: "Registro no encontrado" });

      return res.json({ message: "Registro eliminado" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteByPkQuery(req, res) {
    try {
      const modelConfig = getModel(req.params.entity);
      if (!modelConfig || !modelConfig.model) {
        return res.status(404).json({ error: "Entidad no soportada" });
      }

      const { entity, model } = modelConfig;
      const parsed = buildWhereFromQuery(entity.pk, req.query);
      if (parsed.error)
        return res.status(400).json({ error: parsed.error, pk: entity.pk });

      const deleted = await model.destroy({ where: parsed.where });
      if (!deleted)
        return res.status(404).json({ error: "Registro no encontrado" });

      return res.json({ message: "Registro eliminado" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default SanayaController;
