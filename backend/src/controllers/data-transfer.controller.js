import { QueryTypes } from "sequelize";
import * as XLSX from "xlsx";
import { sequelize } from "../config/sequelize.js";
import models from "../models/index.js";

const SUPPORTED_EXPORTS = new Set([
  "historias",
  "auditorias",
  "usuarios",
  "asignaturas",
  "cursos",
  "detalles_pensum",
  "pensums",
  "prematriculas",
  "programas",
  "terceros",
  "terc_pensums",
]);
const SUPPORTED_IMPORTS = {
  terceros: { mode: "custom" },
  auditorias: { model: "Auditoria" },
  usuarios: { model: "AppUsuario" },
  asignaturas: { model: "Asignatura" },
  cursos: { model: "Curso" },
  detalles_pensum: { model: "DetallePensum" },
  pensums: { model: "Pensum" },
  prematriculas: { model: "Prematricula" },
  programas: { model: "Programa" },
  terc_pensums: { model: "TercPensum" },
  historias: { model: "Historia" },
};
const SUPPORTED_FORMATS = new Set(["xlsx", "csv"]);
const PREVIEW_LIMIT = 10;
const HEADER_TERC_ID = new Set(["TERC_ID", "ID"]);
const HEADER_TERC_TIPO_DOC = new Set(["TERC_TIPO_DOC", "TIPO_DOC"]);
const HEADER_TERC_NRO_DOC = new Set(["TERC_NRO_DOC", "NRO_DOC", "DOCUMENTO"]);
const HEADER_TERC_GENERO = new Set(["TERC_GENERO", "GENERO"]);
const HEADER_TERC_NOMBRES = new Set(["TERC_NOMBRES", "NOMBRES"]);
const HEADER_TERC_APELLIDOS = new Set(["TERC_APELLIDOS", "APELLIDOS"]);
const HEADER_TERC_DIREC = new Set(["TERC_DIREC", "DIRECCION"]);
const HEADER_TERC_CORREO = new Set(["TERC_CORREO", "CORREO", "EMAIL"]);
const HEADER_TERC_MOVIL = new Set(["TERC_MOVIL", "MOVIL", "CELULAR"]);
const HEADER_TERC_TIPO = new Set(["TERC_TIPO", "TIPO"]);

const normalizeHeader = (value) =>
  String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const textValue = (value, maxLength) => {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  if (!normalized) return null;
  return maxLength ? normalized.slice(0, maxLength) : normalized;
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const getCell = (row, acceptedHeaders) => {
  const keys = Object.keys(row);
  for (const key of keys) {
    if (acceptedHeaders.has(normalizeHeader(key))) return row[key];
  }
  return undefined;
};

const parseRowsFromFile = (file) => {
  const workbook = XLSX.read(file.buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("El archivo no contiene hojas válidas");
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
};

const getGeneratedId = (row) => {
  if (!row || typeof row !== "object") return null;
  if (row.ID !== undefined && row.ID !== null) return Number(row.ID);
  if (row.id !== undefined && row.id !== null) return Number(row.id);
  const firstValue = Object.values(row)[0];
  return Number(firstValue);
};

const normalizeImportValue = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return value;
};

const normalizePreviewValue = (value) => {
  if (value === undefined || value === null) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

const buildPreviewPayload = (rows, limit = PREVIEW_LIMIT) => {
  const sampleRows = rows.slice(0, limit);
  const columns = Array.from(
    sampleRows.reduce((acc, row) => {
      Object.keys(row).forEach((key) => {
        const normalizedKey = String(key ?? "").trim();
        if (normalizedKey) {
          acc.add(normalizedKey);
        }
      });
      return acc;
    }, new Set()),
  );

  const previewRows = sampleRows.map((row, index) => {
    const data = columns.reduce((acc, column) => {
      acc[column] = normalizePreviewValue(row[column]);
      return acc;
    }, {});

    return {
      excelRow: index + 2,
      data,
    };
  });

  return {
    columns,
    rows: previewRows,
  };
};

const getModelFieldMap = (model) => {
  const map = new Map();
  const attributes = model?.rawAttributes || {};

  for (const [attrName, attrDef] of Object.entries(attributes)) {
    map.set(normalizeHeader(attrName), attrName);
    if (attrDef?.field) {
      map.set(normalizeHeader(attrDef.field), attrName);
    }
  }

  return map;
};

const buildHistoriaReport = () =>
  sequelize.query(
    `
      SELECT
        h.HIST_PERIODO AS hist_periodo,
        h.TERC_ID AS terc_id,
        t.TERC_NOMBRES AS terc_nombres,
        h.CURS_ID AS curs_id,
        c.ASIG_ID AS asig_id,
        a.ASIG_ASIGNATURA AS asig_asignatura,
        h.HIST_NOTA AS hist_nota
      FROM SANAYA.HISTORIAS h
      LEFT JOIN SANAYA.TERCEROS t ON t.TERC_ID = h.TERC_ID
      LEFT JOIN SANAYA.CURSOS c ON c.CURS_ID = h.CURS_ID
      LEFT JOIN SANAYA.ASIGNATURAS a ON a.ASIG_ID = c.ASIG_ID
      ORDER BY h.HIST_PERIODO, h.TERC_ID, h.CURS_ID
    `,
    { type: QueryTypes.SELECT },
  );

const buildAuditoriaReport = () =>
  sequelize.query(
    `
      SELECT
        AUDI_USUARIO AS audi_usuario,
        AUDI_FECHA AS audi_fecha,
        TERC_ID AS terc_id,
        CURS_ID AS curs_id,
        HIST_NOTA_ANT AS hist_nota_ant,
        HIST_NOTA_DESP AS hist_nota_desp
      FROM SANAYA.AUDITORIAS
      ORDER BY AUDI_FECHA DESC
    `,
    { type: QueryTypes.SELECT },
  );

const buildGenericReport = (modelName) => {
  const model = models[modelName];
  if (!model) {
    throw new Error(`Modelo no encontrado: ${modelName}`);
  }
  return model.findAll({ raw: true });
};

const reportBuilders = {
  historias: buildHistoriaReport,
  auditorias: buildAuditoriaReport,
  usuarios: () => buildGenericReport("AppUsuario"),
  asignaturas: () => buildGenericReport("Asignatura"),
  cursos: () => buildGenericReport("Curso"),
  detalles_pensum: () => buildGenericReport("DetallePensum"),
  pensums: () => buildGenericReport("Pensum"),
  prematriculas: () => buildGenericReport("Prematricula"),
  programas: () => buildGenericReport("Programa"),
  terceros: () => buildGenericReport("Tercero"),
  terc_pensums: () => buildGenericReport("TercPensum"),
};

class DataTransferController {
  static previewImport(req, res) {
    try {
      const entity = String(req.params.entity || "").toLowerCase();
      const config = SUPPORTED_IMPORTS[entity];

      if (!config) {
        return res.status(400).json({
          error: "Entidad no soportada para importación",
          supported: Object.keys(SUPPORTED_IMPORTS),
        });
      }

      if (!req.file?.buffer) {
        return res.status(400).json({ error: "Archivo requerido en campo 'file'" });
      }

      const rows = parseRowsFromFile(req.file);
      if (!rows.length) {
        return res.status(200).json({
          entity,
          totalRows: 0,
          previewRows: 0,
          columns: [],
          rows: [],
          message: "El archivo no contiene filas para previsualizar",
        });
      }

      const preview = buildPreviewPayload(rows);

      return res.status(200).json({
        entity,
        totalRows: rows.length,
        previewRows: preview.rows.length,
        columns: preview.columns,
        rows: preview.rows,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static importEntity(req, res) {
    const entity = String(req.params.entity || "").toLowerCase();
    const config = SUPPORTED_IMPORTS[entity];

    if (!config) {
      return res.status(400).json({
        error: "Entidad no soportada para importación",
        supported: Object.keys(SUPPORTED_IMPORTS),
      });
    }

    if (config.mode === "custom") {
      return DataTransferController.importTerceros(req, res);
    }

    return DataTransferController.importGenericEntity(req, res, entity, config);
  }

  static async importGenericEntity(req, res, entity, config) {
    try {
      if (!req.file?.buffer) {
        return res.status(400).json({ error: "Archivo requerido en campo 'file'" });
      }

      const model = models[config.model];
      if (!model) {
        return res.status(500).json({
          error: `No se encontró el modelo para la entidad '${entity}'`,
        });
      }

      const rows = parseRowsFromFile(req.file);
      if (!rows.length) {
        return res.status(400).json({ error: "El archivo no contiene filas para importar" });
      }

      const fieldMap = getModelFieldMap(model);
      const failed = [];
      let inserted = 0;

      for (let index = 0; index < rows.length; index += 1) {
        const rawRow = rows[index];
        const excelRow = index + 2;
        const data = {};

        for (const [key, value] of Object.entries(rawRow)) {
          const attrName = fieldMap.get(normalizeHeader(key));
          if (!attrName) continue;
          data[attrName] = normalizeImportValue(value);
        }

        if (!Object.keys(data).length) {
          failed.push({
            row: excelRow,
            reason: "La fila no contiene columnas reconocidas para la entidad",
          });
          continue;
        }

        try {
          await model.create(data);
          inserted += 1;
        } catch (error) {
          failed.push({ row: excelRow, reason: error.message });
        }
      }

      return res.status(200).json({
        message: `Importación completada para ${entity}. ${inserted} registros insertados.`,
        inserted,
        failed,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async exportEntity(req, res) {
    try {
      const entity = String(req.params.entity || "").toLowerCase();
      const format = String(req.query.format || "xlsx").toLowerCase();

      if (!SUPPORTED_EXPORTS.has(entity)) {
        return res.status(400).json({
          error: "Entidad no soportada para exportación",
          supported: [...SUPPORTED_EXPORTS],
        });
      }

      if (!SUPPORTED_FORMATS.has(format)) {
        return res.status(400).json({
          error: "Formato no soportado",
          supported: [...SUPPORTED_FORMATS],
        });
      }

      const rows = await reportBuilders[entity]();
      const book = XLSX.utils.book_new();
      const sheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(book, sheet, entity.toUpperCase());

      const timestamp = new Date().toISOString().replace(/[.:]/g, "-");
      const filename = `${entity}-${timestamp}.${format}`;

      if (format === "csv") {
        const csvBuffer = XLSX.write(book, { type: "buffer", bookType: "csv" });
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        return res.send(csvBuffer);
      }

      const xlsxBuffer = XLSX.write(book, {
        type: "buffer",
        bookType: "xlsx",
        compression: true,
      });
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(xlsxBuffer);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async importTerceros(req, res) {
    try {
      if (!req.file?.buffer) {
        return res.status(400).json({ error: "Archivo requerido en campo 'file'" });
      }

      const rows = parseRowsFromFile(req.file);
      if (!rows.length) {
        return res.status(400).json({ error: "El archivo no contiene filas para importar" });
      }

      const parsedRows = rows.map((rawRow, index) => {
        const excelRow = index + 2;

        const data = {
          terc_id: toNumber(getCell(rawRow, HEADER_TERC_ID)),
          terc_tipo_doc: textValue(getCell(rawRow, HEADER_TERC_TIPO_DOC), 2),
          terc_nro_doc: textValue(getCell(rawRow, HEADER_TERC_NRO_DOC), 10),
          terc_genero: textValue(getCell(rawRow, HEADER_TERC_GENERO), 1),
          terc_nombres: textValue(getCell(rawRow, HEADER_TERC_NOMBRES), 50),
          terc_apellidos: textValue(getCell(rawRow, HEADER_TERC_APELLIDOS), 50),
          terc_direc: textValue(getCell(rawRow, HEADER_TERC_DIREC), 50),
          terc_correo: textValue(getCell(rawRow, HEADER_TERC_CORREO), 50),
          terc_movil: textValue(getCell(rawRow, HEADER_TERC_MOVIL), 10),
          terc_tipo: textValue(getCell(rawRow, HEADER_TERC_TIPO), 1),
        };

        // Provide default values for NOT NULL fields if they are missing
        if (!data.terc_tipo_doc) data.terc_tipo_doc = "CC";
        if (!data.terc_nro_doc) data.terc_nro_doc = `TEMP-${excelRow}`;
        if (!data.terc_genero) data.terc_genero = "O";
        if (!data.terc_nombres) data.terc_nombres = "N/A";
        if (!data.terc_apellidos) data.terc_apellidos = "N/A";
        if (!data.terc_tipo) data.terc_tipo = "E";

        return {
          excelRow,
          data,
        };
      });

      const failed = [];
      const docsFromFile = new Set();
      const idsFromFile = new Set();

      // Assign new IDs from sequence for rows that don't have one
      const rowsWithoutId = parsedRows.filter((r) => r.data.terc_id === null);
      if (rowsWithoutId.length > 0) {
        const query = `
          SELECT SANAYA.SQ_TERCEROS.NEXTVAL AS id
          FROM DUAL
          CONNECT BY LEVEL <= :count
        `;
        const nextIds = await sequelize.query(query, {
          replacements: { count: rowsWithoutId.length },
          type: QueryTypes.SELECT,
        });

        rowsWithoutId.forEach((row, index) => {
          row.data.terc_id = getGeneratedId(nextIds[index]);

          if (!Number.isFinite(row.data.terc_id)) {
            row.invalid = true;
            failed.push({
              row: row.excelRow,
              reason: "No se pudo generar TERC_ID desde la secuencia",
            });
          }
        });
      }

      for (const row of parsedRows) {
        const { excelRow, data } = row;

        if (!Number.isFinite(data.terc_id)) {
          failed.push({
            row: excelRow,
            reason: "TERC_ID inválido. Debe ser numérico o estar vacío",
          });
          row.invalid = true;
          continue;
        }

        // Validations for rows that have terc_nro_doc
        if (data.terc_nro_doc && data.terc_nro_doc.startsWith("TEMP-")) {
          // Skip checks for temp doc numbers
        } else if (data.terc_nro_doc) {
          if (docsFromFile.has(data.terc_nro_doc)) {
            failed.push({
              row: excelRow,
              reason: "TERC_NRO_DOC duplicado dentro del archivo",
            });
            row.invalid = true;
            continue;
          }
          docsFromFile.add(data.terc_nro_doc);
        }

        // Validations for rows that have terc_id
        const idStr = String(data.terc_id);
        if (idsFromFile.has(idStr)) {
          failed.push({
            row: excelRow,
            reason: "TERC_ID duplicado dentro del archivo",
          });
          row.invalid = true;
          continue;
        }
        idsFromFile.add(idStr);
      }

      const existingByDoc =
        docsFromFile.size > 0
          ? await models.Tercero.findAll({
              where: { terc_nro_doc: [...docsFromFile] },
              attributes: ["terc_nro_doc"],
              raw: true,
            })
          : [];

      const existingById =
        idsFromFile.size > 0
          ? await models.Tercero.findAll({
              where: { terc_id: [...idsFromFile] },
              attributes: ["terc_id"],
              raw: true,
            })
          : [];

      const docsInDb = new Set(existingByDoc.map((item) => item.terc_nro_doc));
      const idsInDb = new Set(existingById.map((item) => String(item.terc_id)));

      let inserted = 0;
      for (const row of parsedRows) {
        if (row.invalid) continue;

        const { excelRow, data } = row;

        if (
          data.terc_nro_doc &&
          !data.terc_nro_doc.startsWith("TEMP-") &&
          docsInDb.has(data.terc_nro_doc)
        ) {
          failed.push({
            row: excelRow,
            reason: "TERC_NRO_DOC ya existe en base de datos",
          });
          continue;
        }

        if (idsInDb.has(String(data.terc_id))) {
          failed.push({
            row: excelRow,
            reason: "TERC_ID ya existe en base de datos",
          });
          continue;
        }

        try {
          await models.Tercero.create(data);
          inserted += 1;
          idsInDb.add(String(data.terc_id));
          if (data.terc_nro_doc && !data.terc_nro_doc.startsWith("TEMP-")) {
            docsInDb.add(data.terc_nro_doc);
          }
        } catch (error) {
          failed.push({ row: excelRow, reason: error.message });
        }
      }

      return res.status(200).json({
        message: `Importación completada. ${inserted} registros insertados.`,
        inserted,
        failed,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default DataTransferController;
