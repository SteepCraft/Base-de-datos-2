import { saveAs } from "file-saver";
import { useMemo, useState } from "react";

import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import api from "../config/api";
import { SANAYA_ENTITIES } from "../config/sanayaApi";

const DATA_TRANSFER_ENTITY_PARAM_MAP = {
  "detalle-pensums": "detalles_pensum",
};

const toTransferEntityParam = (entityKey) =>
  DATA_TRANSFER_ENTITY_PARAM_MAP[entityKey] || entityKey.replace(/-/g, "_");

const DataTransfer = () => {
  const [file, setFile] = useState(null);
  const [exportEntity, setExportEntity] = useState("historias"); // Estado para la entidad a exportar
  const [importEntity, setImportEntity] = useState("terceros"); // Estado para la entidad a importar
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewSearch, setPreviewSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("excelRow");
  const [sortDirection, setSortDirection] = useState("asc");

  const isBusy = Boolean(loadingAction);
  const isPreviewLoading = loadingAction === "preview";
  const isImporting = loadingAction === "import";
  const isExporting = loadingAction === "export";

  const selectedImportEntity = Object.entries(SANAYA_ENTITIES).find(
    ([key]) => toTransferEntityParam(key) === importEntity,
  )?.[1];

  const importEntityLabel = selectedImportEntity?.label || importEntity;
  const previewColumns = importPreview?.columns || [];
  const previewRows = importPreview?.rows || [];

  const filteredPreviewRows = useMemo(() => {
    const normalizedQuery = previewSearch.trim().toLowerCase();
    if (!normalizedQuery) {
      return previewRows;
    }

    return previewRows.filter((previewRow) => {
      if (String(previewRow.excelRow).includes(normalizedQuery)) {
        return true;
      }

      return previewColumns.some((column) =>
        String(previewRow.data[column] ?? "")
          .toLowerCase()
          .includes(normalizedQuery),
      );
    });
  }, [previewColumns, previewRows, previewSearch]);

  const sortedPreviewRows = useMemo(() => {
    const getSortableValue = (previewRow, column) => {
      if (column === "excelRow") {
        return previewRow.excelRow;
      }

      const rawValue = previewRow.data?.[column];
      if (rawValue === undefined || rawValue === null || rawValue === "") {
        return "";
      }

      const normalizedValue = String(rawValue).trim();
      const numericValue = Number(normalizedValue.replace(",", "."));

      if (normalizedValue !== "" && !Number.isNaN(numericValue)) {
        return numericValue;
      }

      return normalizedValue.toLowerCase();
    };

    return [...filteredPreviewRows].sort((rowA, rowB) => {
      const valueA = getSortableValue(rowA, sortColumn);
      const valueB = getSortableValue(rowB, sortColumn);

      let result = 0;
      if (typeof valueA === "number" && typeof valueB === "number") {
        result = valueA - valueB;
      } else {
        result = String(valueA).localeCompare(String(valueB), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortDirection === "asc" ? result : result * -1;
    });
  }, [filteredPreviewRows, sortColumn, sortDirection]);

  const handleSort = (nextColumn) => {
    if (sortColumn === nextColumn) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortColumn(nextColumn);
    setSortDirection("asc");
  };

  const resetFeedback = () => {
    setError(null);
    setSuccess(null);
    setImportSummary(null);
  };

  const resetImportState = () => {
    resetFeedback();
    setImportPreview(null);
    setIsPreviewOpen(false);
    setPreviewSearch("");
    setSortColumn("excelRow");
    setSortDirection("asc");
  };

  const getErrorMessage = (err, fallbackMessage) => {
    const errorData = err.response?.data;

    if (errorData?.message) {
      return errorData.message;
    }

    if (errorData?.error) {
      if (Array.isArray(errorData.supported) && errorData.supported.length > 0) {
        return `${errorData.error}. Entidades soportadas: ${errorData.supported.join(", ")}`;
      }
      return errorData.error;
    }

    return err.message || fallbackMessage;
  };

  const buildImportFormData = () => {
    const formData = new FormData();
    formData.append("file", file);
    return formData;
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    resetImportState();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necesario para que el evento drop funcione
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".xlsx")) {
      setFile(droppedFile);
      resetImportState();
    } else {
      setError("Por favor, suelta un archivo .xlsx válido.");
    }
  };

  const handlePreviewImport = async () => {
    if (!file) {
      setError("Por favor, selecciona un archivo.");
      return;
    }

    setLoadingAction("preview");
    resetFeedback();

    try {
      const response = await api.post(
        `/data/import-preview/${importEntity}`,
        buildImportFormData(),
      );

      setImportPreview(response.data);
      setPreviewSearch("");
      setSortColumn("excelRow");
      setSortDirection("asc");
      setIsPreviewOpen(true);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo generar la previsualización del archivo."));
      setIsPreviewOpen(false);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Por favor, selecciona un archivo.");
      return;
    }

    setLoadingAction("import");
    resetFeedback();

    try {
      const response = await api.post(`/data/import/${importEntity}`, buildImportFormData());

      setIsPreviewOpen(false);
      setImportSummary(response.data);
      setSuccess(response.data.message);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && errorData.failed?.length > 0) {
        setIsPreviewOpen(false);
        setImportSummary(errorData);
        setError(errorData.message || "Error al importar los datos. Revisa los detalles.");
      } else {
        setError(getErrorMessage(err, "Error al importar los datos."));
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExport = async () => {
    setLoadingAction("export");
    resetFeedback();
    setImportPreview(null);
    setIsPreviewOpen(false);

    try {
      const response = await api.get(`/data/export/${exportEntity}`, {
        responseType: "blob",
      });
      saveAs(response.data, `export_${exportEntity}_data.xlsx`);
      setSuccess("Datos exportados correctamente.");
    } catch (err) {
      setError(getErrorMessage(err, "Error al exportar los datos."));
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Importar/Exportar Datos</h1>

      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl mb-2">Importar Datos (XLSX)</h2>
        <div className="mb-2">
          <label htmlFor="import-entity-select" className="mr-2">
            Seleccionar Entidad a Importar:
          </label>
          <select
            id="import-entity-select"
            value={importEntity}
            onChange={(e) => {
              setImportEntity(e.target.value);
              resetImportState();
            }}
            className="p-2 border rounded"
          >
            {Object.keys(SANAYA_ENTITIES).map((key) => (
              <option key={key} value={toTransferEntityParam(key)}>
                {SANAYA_ENTITIES[key].label}
              </option>
            ))}
            <option value="usuarios">Usuarios</option>
          </select>
        </div>

        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded p-8 text-center ${
            isDragging ? "border-blue-500 bg-blue-100" : "border-gray-300"
          }`}
        >
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="hidden" // Ocultamos el input original
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <p>Arrastra y suelta un archivo .xlsx aquí, o haz clic para seleccionarlo.</p>
          </label>
          {file && <p className="mt-2 text-green-600">Archivo seleccionado: {file.name}</p>}
        </div>

        <Button onClick={handlePreviewImport} disabled={isBusy || !file} className="mt-4">
          {isPreviewLoading ? "Generando preview..." : "Previsualizar e importar"}
        </Button>
      </div>

      <div className="p-4 border rounded">
        <h2 className="text-xl mb-2">Exportar Datos (XLSX)</h2>
        <div className="mb-2">
          <label htmlFor="entity-select" className="mr-2">
            Seleccionar Entidad a Exportar:
          </label>
          <select
            id="entity-select"
            value={exportEntity}
            onChange={(e) => setExportEntity(e.target.value)}
            className="p-2 border rounded"
          >
            {Object.keys(SANAYA_ENTITIES).map((key) => (
              <option key={key} value={toTransferEntityParam(key)}>
                {SANAYA_ENTITIES[key].label}
              </option>
            ))}
            <option value="usuarios">Usuarios</option>
          </select>
        </div>
        <Button onClick={handleExport} disabled={isBusy} variant="secondary">
          {isExporting ? "Exportando..." : "Exportar"}
        </Button>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Previsualización de importación</DialogTitle>
            <DialogDescription>
              {importPreview
                ? `Entidad: ${importEntityLabel}. Archivo: ${file?.name || "sin archivo"}. Mostrando ${importPreview.previewRows} de ${importPreview.totalRows} filas.`
                : "No hay datos para previsualizar."}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[55vh] overflow-auto px-6 pb-2">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Input
                value={previewSearch}
                onChange={(e) => setPreviewSearch(e.target.value)}
                placeholder="Buscar en el preview..."
                className="sm:max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Mostrando {sortedPreviewRows.length} de {previewRows.length} filas de la muestra.
              </p>
            </div>

            {previewRows.length > 0 ? (
              sortedPreviewRows.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          type="button"
                          onClick={() => handleSort("excelRow")}
                          className="inline-flex items-center gap-1"
                        >
                          Fila (Excel){" "}
                          {sortColumn === "excelRow" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                        </button>
                      </TableHead>
                      {previewColumns.map((column) => (
                        <TableHead key={column}>
                          <button
                            type="button"
                            onClick={() => handleSort(column)}
                            className="inline-flex items-center gap-1"
                          >
                            {column}{" "}
                            {sortColumn === column ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                          </button>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPreviewRows.map((previewRow) => (
                      <TableRow key={previewRow.excelRow}>
                        <TableCell>{previewRow.excelRow}</TableCell>
                        {previewColumns.map((column) => {
                          const value = previewRow.data[column];
                          return (
                            <TableCell key={`${previewRow.excelRow}-${column}`}>
                              {value === "" ? "N/A" : value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No hay filas que coincidan con la búsqueda.
                </p>
              )
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                El archivo no contiene filas para previsualizar.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPreviewOpen(false)}
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={isImporting || previewRows.length === 0}>
              {isImporting ? "Importando..." : "Confirmar importación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 border border-green-200 rounded">
          {success}
        </div>
      )}

      {importSummary && importSummary.failed && importSummary.failed.length > 0 && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="text-lg font-bold text-yellow-800">Registros Fallidos</h3>
          <p className="mb-2 text-sm text-yellow-700">
            Los siguientes registros no pudieron ser importados. Por favor, corrige los errores y
            vuelve a intentarlo.
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fila (Excel)</TableHead>
                  <TableHead>Razón del Fallo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importSummary.failed.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.row}</TableCell>
                    <TableCell>{item.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTransfer;
