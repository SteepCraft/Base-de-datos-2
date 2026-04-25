import { saveAs } from "file-saver";
import { CheckCircle2, CircleAlert, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/utils";

const DATA_TRANSFER_ENTITY_PARAM_MAP = {
  "detalle-pensums": "detalles_pensum",
};

const toTransferEntityParam = (entityKey) =>
  DATA_TRANSFER_ENTITY_PARAM_MAP[entityKey] || entityKey.replace(/-/g, "_");

const DataTransfer = () => {
  const { theme } = useTheme();
  const [file, setFile] = useState(null);
  const [exportEntity, setExportEntity] = useState("historias");
  const [importEntity, setImportEntity] = useState("terceros");
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

  const transferEntityOptions = useMemo(
    () => [
      ...Object.entries(SANAYA_ENTITIES).map(([key, entity]) => ({
        label: entity.label,
        value: toTransferEntityParam(key),
      })),
      {
        label: "Usuarios",
        value: "usuarios",
      },
    ],
    [],
  );

  const selectedImportEntity = transferEntityOptions.find(
    (entityOption) => entityOption.value === importEntity,
  );

  const importEntityLabel = selectedImportEntity?.label ?? importEntity;
  const previewColumns = importPreview?.columns || [];
  const previewRows = importPreview?.rows || [];
  const isDarkTheme = theme === "dark";

  const previewDialogClass = isDarkTheme
    ? "max-w-6xl border-zinc-700 bg-zinc-950 text-zinc-100"
    : "max-w-6xl border-slate-200 bg-white text-slate-900";

  const previewHeaderClass = isDarkTheme ? "border-zinc-800" : "border-slate-200";
  const previewDescriptionClass = isDarkTheme ? "text-zinc-300" : "text-slate-600";

  const previewContainerClass = isDarkTheme
    ? "max-h-[55vh] overflow-auto rounded-lg border border-zinc-800 bg-zinc-900 px-6 pb-2"
    : "max-h-[55vh] overflow-auto rounded-lg border border-slate-200 bg-slate-50 px-6 pb-2";

  const previewCounterClass = isDarkTheme ? "text-xs text-zinc-300" : "text-xs text-slate-600";

  const previewTableWrapperClass = isDarkTheme
    ? "[&>div]:!border-zinc-800 [&>div]:!bg-zinc-900"
    : "[&>div]:!border-slate-200 [&>div]:!bg-white";

  const previewTableHeaderClass = isDarkTheme ? "!bg-zinc-800" : "!bg-slate-100";

  const previewTableBodyClass = isDarkTheme
    ? "[&_tr:nth-child(even)]:!bg-zinc-900 [&_tr:nth-child(odd)]:!bg-zinc-950"
    : "[&_tr:nth-child(even)]:!bg-slate-50 [&_tr:nth-child(odd)]:!bg-white";

  const hasFailedRows = Array.isArray(importSummary?.failed) && importSummary.failed.length > 0;

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
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.toLowerCase().endsWith(".xlsx")) {
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

  const getSortIndicator = (column) => {
    if (sortColumn !== column) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Card>
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">shadcn neutral</Badge>
            <Badge variant="outline">Transferencia de datos</Badge>
          </div>
          <CardTitle>Importar y exportar archivos XLSX</CardTitle>
          <CardDescription>
            Selecciona una entidad, carga tu archivo y valida el preview antes de confirmar.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3 bg-card/95">
          <CardHeader>
            <CardTitle>Importar datos</CardTitle>
            <CardDescription>
              Carga un archivo XLSX y revisa su previsualización antes de insertar registros.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/25 p-4">
              <p className="text-sm font-medium text-foreground">Entidad de destino</p>
              <Select
                value={importEntity}
                onValueChange={(nextValue) => {
                  setImportEntity(nextValue);
                  resetImportState();
                }}
              >
                <SelectTrigger id="import-entity-select">
                  <SelectValue placeholder="Seleccionar entidad" />
                </SelectTrigger>
                <SelectContent className="z-[120] border-2 border-border bg-background bg-[hsl(var(--background))] text-foreground text-[hsl(var(--foreground))] opacity-100 shadow-2xl">
                  <SelectGroup>
                    {transferEntityOptions.map((entityOption) => (
                      <SelectItem key={entityOption.value} value={entityOption.value}>
                        {entityOption.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={cn(
                "rounded-xl border-2 border-dashed border-border bg-muted/30 px-5 py-7 text-center transition-all",
                isDragging && "border-primary bg-accent/40 ring-2 ring-ring/30",
                file && "border-primary/55 bg-card",
              )}
            >
              <input
                id="file-input"
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="sr-only"
              />

              <label
                htmlFor="file-input"
                className="flex cursor-pointer flex-col items-center gap-2"
              >
                <UploadCloud className="size-5 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  Arrastra y suelta tu archivo o haz clic para seleccionarlo
                </p>
                <p className="text-xs text-muted-foreground">Solo se admite formato .xlsx</p>
              </label>

              {file ? (
                <div className="mt-3 flex justify-center">
                  <Badge variant="outline" className="truncate max-w-full">
                    Archivo: {file.name}
                  </Badge>
                </div>
              ) : null}
            </div>

            <Button
              onClick={handlePreviewImport}
              disabled={isBusy || !file}
              className="w-full sm:w-fit"
            >
              {isPreviewLoading ? "Generando preview..." : "Previsualizar e importar"}
            </Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 bg-card/95">
          <CardHeader>
            <CardTitle>Exportar datos</CardTitle>
            <CardDescription>
              Descarga registros existentes en formato XLSX para respaldo o conciliación.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/25 p-4">
              <p className="text-sm font-medium text-foreground">Entidad a exportar</p>
              <Select value={exportEntity} onValueChange={setExportEntity}>
                <SelectTrigger id="entity-select">
                  <SelectValue placeholder="Seleccionar entidad" />
                </SelectTrigger>
                <SelectContent className="z-[120] border-2 border-border bg-background bg-[hsl(var(--background))] text-foreground text-[hsl(var(--foreground))] opacity-100 shadow-2xl">
                  <SelectGroup>
                    {transferEntityOptions.map((entityOption) => (
                      <SelectItem key={entityOption.value} value={entityOption.value}>
                        {entityOption.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleExport}
              disabled={isBusy}
              variant="secondary"
              className="w-full sm:w-fit"
            >
              {isExporting ? "Exportando..." : "Exportar"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {error || success ? (
        <div className="flex flex-col gap-3">
          {error ? (
            <Alert variant="destructive">
              <CircleAlert className="size-4" />
              <AlertTitle>Error durante la operación</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {success ? (
            <Alert>
              <CheckCircle2 className="size-4" />
              <AlertTitle>Operación completada</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      ) : null}

      {hasFailedRows ? (
        <Card className="border-destructive/35 bg-card/95">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Registros no importados</CardTitle>
                <CardDescription>
                  Corrige estos errores y vuelve a cargar el archivo para completar la importación.
                </CardDescription>
              </div>
              <Badge variant="destructive">{importSummary.failed.length} fallidos</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fila (Excel)</TableHead>
                  <TableHead>Razón del fallo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importSummary.failed.map((item, index) => (
                  <TableRow key={`${item.row}-${index}`}>
                    <TableCell>{item.row}</TableCell>
                    <TableCell>{item.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className={previewDialogClass}>
          <DialogHeader className={previewHeaderClass}>
            <DialogTitle>Previsualización de importación</DialogTitle>
            <DialogDescription className={previewDescriptionClass}>
              {importPreview
                ? `Entidad: ${importEntityLabel}. Archivo: ${file?.name || "sin archivo"}. Mostrando ${importPreview.previewRows} de ${importPreview.totalRows} filas.`
                : "No hay datos para previsualizar."}
            </DialogDescription>
          </DialogHeader>

          <div className={previewContainerClass}>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Input
                value={previewSearch}
                onChange={(e) => setPreviewSearch(e.target.value)}
                placeholder="Buscar en el preview..."
                className="sm:max-w-xs"
              />
              <p className={previewCounterClass}>
                Mostrando {sortedPreviewRows.length} de {previewRows.length} filas de la muestra.
              </p>
            </div>

            {previewRows.length > 0 ? (
              sortedPreviewRows.length > 0 ? (
                <div className={previewTableWrapperClass}>
                  <Table>
                    <TableHeader className={previewTableHeaderClass}>
                      <TableRow>
                        <TableHead>
                          <button
                            type="button"
                            onClick={() => handleSort("excelRow")}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-colors",
                              isDarkTheme
                                ? "border-zinc-700 bg-zinc-800"
                                : "border-slate-300 bg-white",
                              sortColumn === "excelRow"
                                ? isDarkTheme
                                  ? "border-zinc-500 bg-zinc-700 text-zinc-100"
                                  : "border-slate-400 bg-slate-200 text-slate-900"
                                : isDarkTheme
                                  ? "text-zinc-200 hover:border-zinc-500 hover:bg-zinc-700 hover:text-zinc-100"
                                  : "text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900",
                            )}
                          >
                            Fila (Excel) {getSortIndicator("excelRow")}
                          </button>
                        </TableHead>
                        {previewColumns.map((column) => (
                          <TableHead key={column}>
                            <button
                              type="button"
                              onClick={() => handleSort(column)}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-colors",
                                isDarkTheme
                                  ? "border-zinc-700 bg-zinc-800"
                                  : "border-slate-300 bg-white",
                                sortColumn === column
                                  ? isDarkTheme
                                    ? "border-zinc-500 bg-zinc-700 text-zinc-100"
                                    : "border-slate-400 bg-slate-200 text-slate-900"
                                  : isDarkTheme
                                    ? "text-zinc-200 hover:border-zinc-500 hover:bg-zinc-700 hover:text-zinc-100"
                                    : "text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900",
                              )}
                            >
                              {column} {getSortIndicator(column)}
                            </button>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody className={previewTableBodyClass}>
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
                </div>
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
    </div>
  );
};

export default DataTransfer;
