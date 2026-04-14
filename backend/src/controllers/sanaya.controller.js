import { Op, QueryTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";
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

const ENTITY_DEPENDENCIES = {
  terceros: [
    {
      model: "Prematricula",
      foreignKey: "terc_id",
      message: "El tercero está en una prematricula.",
    },
    {
      model: "TercPensum",
      foreignKey: "terc_id",
      message: "El tercero está en un pensum.",
    },
    {
      model: "Historia",
      foreignKey: "terc_id",
      message: "El tercero tiene historial académico.",
    },
    {
      model: "Curso",
      foreignKey: "terc_id",
      message: "El tercero es un estudiante en un curso.",
    },
  ],
};

class SanayaController {
  static async nextAsignaturaId(_req, res) {
    try {
      const result = await sequelize.query(
        "SELECT SANAYA.sq_asignaturas.NEXTVAL AS asig_id FROM DUAL",
        {
          type: QueryTypes.SELECT,
        },
      );
      const nextId = result[0]?.asig_id;
      return res.json({ asig_id: nextId });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async executeSpIngTercPensuns(req, res) {
    try {
      const pensId = Number(req.body?.pens_id);
      const tercId = Number(req.body?.terc_id);
      const tepePeriodo = String(req.body?.tepe_periodo ?? "").trim();

      if (!Number.isFinite(pensId) || !Number.isFinite(tercId) || !tepePeriodo) {
        return res.status(400).json({
          error: "Parámetros inválidos. Requiere pens_id, terc_id y tepe_periodo.",
        });
      }

      await sequelize.query(
        "BEGIN SANAYA.sp_ing_terc_pensuns(:pens_id, :terc_id, :tepe_periodo); END;",
        {
          bind: {
            pens_id: pensId,
            terc_id: tercId,
            tepe_periodo: tepePeriodo,
          },
          type: QueryTypes.RAW,
        },
      );

      return res.status(201).json({
        message: "Procedimiento ejecutado correctamente",
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

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
          error: "Esta entidad usa llave compuesta. Usa query params con las llaves primarias.",
          pk: entity.pk,
        });
      }

      const row = await model.findByPk(req.params.id);
      if (!row) return res.status(404).json({ error: "Registro no encontrado" });
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
      if (parsed.error) return res.status(400).json({ error: parsed.error, pk: entity.pk });

      const row = await model.findOne({ where: parsed.where });
      if (!row) return res.status(404).json({ error: "Registro no encontrado" });
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
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          error: "Conflicto: Ya existe un registro con esa llave primaria.",
          fields: error.fields,
        });
      }
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
          error: "Esta entidad usa llave compuesta. Usa query params con las llaves primarias.",
          pk: entity.pk,
        });
      }

      const [updated] = await model.update(req.body, {
        where: { [entity.pk[0]]: req.params.id },
      });
      if (!updated) return res.status(404).json({ error: "Registro no encontrado" });

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
      if (parsed.error) return res.status(400).json({ error: parsed.error, pk: entity.pk });

      const [updated] = await model.update(req.body, { where: parsed.where });
      if (!updated) return res.status(404).json({ error: "Registro no encontrado" });

      const row = await model.findOne({ where: parsed.where });
      return res.json(row);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async deleteById(req, res) {
    const { entity: entityName, id } = req.params;
    const modelConfig = getModel(entityName);

    if (!modelConfig || !modelConfig.model) {
      return res.status(404).json({ error: "Entidad no encontrada" });
    }

    const { entity, model } = modelConfig;
    const transaction = await sequelize.transaction();

    try {
      const dependencies = ENTITY_DEPENDENCIES[entityName];
      if (dependencies) {
        for (const dep of dependencies) {
          const depModel = models[dep.model];
          if (depModel) {
            await depModel.destroy({
              where: { [dep.foreignKey]: id },
              transaction,
            });
          }
        }
      }

      const pkName = entity.pk[0];
      const result = await model.destroy({
        where: { [pkName]: id },
        transaction,
      });

      if (result === 0) {
        await transaction.rollback();
        return res.status(404).json({
          error: `Registro no encontrado en ${entityName} con ID ${id}`,
        });
      }

      await transaction.commit();
      return res.status(204).send();
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteByPkQuery(req, res) {
    const { entity: entityName } = req.params;
    const modelConfig = getModel(entityName);

    if (!modelConfig || !modelConfig.model) {
      return res.status(404).json({ error: "Entidad no encontrada" });
    }

    const { model } = modelConfig;

    try {
      const result = await model.destroy({ where: req.query });

      if (result === 0) {
        return res.status(404).json({
          error: `Registro no encontrado en ${entityName} con query`,
        });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getOptions(req, res) {
    try {
      const { entity: entityName } = req.params;
      const { q = "" } = req.query;

      const optionsMap = {
        terceros: {
          findBy: ["terc_nombres", "terc_apellidos", "terc_nro_doc"],
          label: (r) =>
            `${r.terc_nombres || ""} ${r.terc_apellidos || ""} (${r.terc_nro_doc || ""})`.trim(),
          id: "terc_id",
        },
        asignaturas: {
          findBy: ["asig_asignatura", "asig_codigo"],
          label: (r) => `${r.asig_codigo || ""} - ${r.asig_asignatura || ""}`.trim(),
          id: "asig_id",
        },
        programas: {
          findBy: ["prog_programa"],
          label: (r) => r.prog_programa,
          id: "prog_id",
        },
        cursos: {
          findBy: ["curs_periodo"],
          label: (r) => `Curso (${r.curs_periodo || ""})`.trim(),
          id: "curs_id",
        },
        pensums: {
          findBy: ["pens_periodo"],
          label: (r) => `Pensum (${r.pens_periodo || ""})`.trim(),
          id: "pens_id",
        },
      };

      const config = optionsMap[entityName];
      if (!config) {
        // Fallback for entities without specific options config
        const modelConfig = getModel(entityName);
        if (!modelConfig || !modelConfig.model) {
          return res.status(404).json({ error: "Entidad no soportada" });
        }
        const { model, entity } = modelConfig;
        const pkId = entity.pk[0];
        const rows = await model.findAll({ limit: 50, raw: true });
        return res.json(rows.map((r) => ({ id: r[pkId], label: String(r[pkId]) })));
      }

      const modelConfig = getModel(entityName);
      const { model } = modelConfig;

      const searchTerm = `%${q.toUpperCase()}%`;

      const whereClause = q
        ? {
            [Op.or]: config.findBy.map((f) => ({
              [f]: sequelize.where(sequelize.fn("UPPER", sequelize.col(f)), {
                [Op.like]: searchTerm,
              }),
            })),
          }
        : {};

      const rows = await model.findAll({
        where: whereClause,
        limit: 50,
        raw: true,
      });

      return res.json(rows.map((r) => ({ id: r[config.id], label: config.label(r) })));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async search(req, res) {
    try {
      const { entity: entityName } = req.params;
      const { q: _q = "", limit = 50, offset = 0 } = req.query;

      const modelConfig = getModel(entityName);
      if (!modelConfig || !modelConfig.model) {
        return res.status(404).json({ error: "Entidad no soportada" });
      }

      const { model } = modelConfig;

      // Helper to dynamically include relations for known entities
      const includeConfig = {
        cursos: [
          {
            model: models.Tercero,
            as: "tercero",
            attributes: ["terc_id", "terc_nombres", "terc_apellidos", "terc_nro_doc"],
          },
          {
            model: models.Asignatura,
            as: "asignatura",
            attributes: ["asig_id", "asig_asignatura", "asig_codigo"],
          },
        ],
        historias: [
          {
            model: models.Tercero,
            as: "tercero",
            attributes: ["terc_id", "terc_nombres", "terc_apellidos", "terc_nro_doc"],
          },
          {
            model: models.Curso,
            as: "curso",
            include: [
              {
                model: models.Asignatura,
                as: "asignatura",
                attributes: ["asig_id", "asig_asignatura"],
              },
            ],
          },
        ],
        "detalle-pensums": [
          { model: models.Pensum, as: "pensum" },
          {
            model: models.Asignatura,
            as: "asignatura",
            attributes: ["asig_id", "asig_asignatura"],
          },
        ],
        "terc-pensums": [
          {
            model: models.Tercero,
            as: "tercero",
            attributes: ["terc_id", "terc_nombres", "terc_apellidos", "terc_nro_doc"],
          },
          { model: models.Pensum, as: "pensum" },
        ],
        prematriculas: [
          {
            model: models.Tercero,
            as: "tercero",
            attributes: ["terc_id", "terc_nombres", "terc_apellidos", "terc_nro_doc"],
          },
          {
            model: models.Asignatura,
            as: "asignatura",
            attributes: ["asig_id", "asig_asignatura"],
          },
        ],
        auditorias: [
          {
            model: models.Tercero,
            as: "tercero",
            attributes: ["terc_id", "terc_nombres", "terc_apellidos", "terc_nro_doc"],
          },
          {
            model: models.Curso,
            as: "curso",
            include: [
              {
                model: models.Asignatura,
                as: "asignatura",
                attributes: ["asig_id", "asig_asignatura"],
              },
            ],
          },
        ],
      };

      // Simple implementation: just return all with includes if no query provided, or use simple find if no specific search logic
      const include = includeConfig[entityName] || [];

      const rows = await model.findAll({
        include,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        // Note: For actual text search, we should implement detailed where clauses here.
        // For now, returning records with includes fulfills the primary need of human-readable data
      });

      return res.json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async checkDependencies(req, res) {
    const { entity: entityName, id } = req.params;
    const dependencies = ENTITY_DEPENDENCIES[entityName];

    if (!dependencies) {
      return res.json({ warnings: [] });
    }

    const warnings = [];
    try {
      for (const dep of dependencies) {
        const depModel = models[dep.model];
        if (depModel) {
          const count = await depModel.count({
            where: { [dep.foreignKey]: id },
          });
          if (count > 0) {
            warnings.push(
              `Hay ${count} registro(s) en ${dep.model} que dependen de este registro. ${dep.message}`,
            );
          }
        }
      }
      return res.json({ warnings });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default SanayaController;
