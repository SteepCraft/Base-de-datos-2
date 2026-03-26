import { QueryTypes } from "sequelize";
import * as XLSX from "xlsx";
import { sequelize } from "../config/sequelize.js";
import models from "../models/index.js";

const SUPPORTED_EXPORTS = new Set(["historias", "auditorias"]);
const SUPPORTED_FORMATS = new Set(["xlsx", "csv"]);
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
    { type: QueryTypes.SELECT }
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
    { type: QueryTypes.SELECT }
  );

const reportBuilders = {
  historias: buildHistoriaReport,
  auditorias: buildAuditoriaReport,
};

class DataTransferController {
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
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        return res.send(csvBuffer);
      }

      const xlsxBuffer = XLSX.write(book, {
        type: "buffer",
        bookType: "xlsx",
        compression: true,
      });
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      return res.send(xlsxBuffer);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async importTerceros(req, res) {
    try {
      if (!req.file?.buffer) {
        return res
          .status(400)
          .json({ error: "Archivo requerido en campo 'file'" });
      }

      const rows = parseRowsFromFile(req.file);
      if (!rows.length) {
        return res
          .status(400)
          .json({ error: "El archivo no contiene filas para importar" });
      }

      const parsedRows = rows.map((rawRow, index) => {
        const excelRow = index + 2;
        const tercId = toNumber(getCell(rawRow, HEADER_TERC_ID));
        const tercNroDoc = textValue(getCell(rawRow, HEADER_TERC_NRO_DOC), 10);

        return {
          excelRow,
          data: {
            terc_id: tercId,
            terc_tipo_doc: textValue(getCell(rawRow, HEADER_TERC_TIPO_DOC), 2),
            terc_nro_doc: tercNroDoc,
            terc_genero: textValue(getCell(rawRow, HEADER_TERC_GENERO), 1),
            terc_nombres: textValue(getCell(rawRow, HEADER_TERC_NOMBRES), 50),
            terc_apellidos: textValue(
              getCell(rawRow, HEADER_TERC_APELLIDOS),
              50
            ),
            terc_direc: textValue(getCell(rawRow, HEADER_TERC_DIREC), 50),
            terc_correo: textValue(getCell(rawRow, HEADER_TERC_CORREO), 50),
            terc_movil: textValue(getCell(rawRow, HEADER_TERC_MOVIL), 10),
            terc_tipo: textValue(getCell(rawRow, HEADER_TERC_TIPO), 1),
          },
        };
      });

      const failed = [];
      const docsFromFile = new Set();
      const idsFromFile = new Set();

      for (const row of parsedRows) {
        const { excelRow, data } = row;
        if (!Number.isFinite(data.terc_id)) {
          failed.push({ row: excelRow, reason: "TERC_ID inválido o faltante" });
          row.invalid = true;
          continue;
        }

        if (!data.terc_nro_doc) {
          failed.push({ row: excelRow, reason: "TERC_NRO_DOC es obligatorio" });
          row.invalid = true;
          continue;
        }

        if (docsFromFile.has(data.terc_nro_doc)) {
          failed.push({
            row: excelRow,
            reason: "TERC_NRO_DOC duplicado dentro del archivo",
          });
          row.invalid = true;
          continue;
        }

        if (idsFromFile.has(String(data.terc_id))) {
          failed.push({
            row: excelRow,
            reason: "TERC_ID duplicado dentro del archivo",
          });
          row.invalid = true;
          continue;
        }

        docsFromFile.add(data.terc_nro_doc);
        idsFromFile.add(String(data.terc_id));
      }

      const existingByDoc = docsFromFile.size
        ? await models.Tercero.findAll({
            where: { terc_nro_doc: [...docsFromFile] },
            attributes: ["terc_nro_doc"],
            raw: true,
          })
        : [];

      const existingById = idsFromFile.size
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
        if (docsInDb.has(data.terc_nro_doc)) {
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
          docsInDb.add(data.terc_nro_doc);
          idsInDb.add(String(data.terc_id));
        } catch (error) {
          failed.push({ row: excelRow, reason: error.message });
        }
      }

      const statusCode = inserted > 0 ? 201 : 400;
      return res.status(statusCode).json({
        message: "Importación finalizada",
        totalRows: rows.length,
        inserted,
        failedCount: failed.length,
        failed,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default DataTransferController;
