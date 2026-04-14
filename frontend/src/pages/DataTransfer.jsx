import { saveAs } from "file-saver";
import { useState } from "react";

import api from "../config/api";
import { SANAYA_ENTITIES } from "../config/sanayaApi";

const DataTransfer = () => {
  const [file, setFile] = useState(null);
  const [exportEntity, setExportEntity] = useState("historias"); // Estado para la entidad a exportar
  const [importEntity, setImportEntity] = useState("terceros"); // Estado para la entidad a importar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(null);
    setImportSummary(null);
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
      setError(null);
      setSuccess(null);
      setImportSummary(null);
    } else {
      setError("Por favor, suelta un archivo .xlsx válido.");
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Por favor, selecciona un archivo.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);
    setSuccess(null);
    setImportSummary(null);

    try {
      const response = await api.post(`/data/import/${importEntity}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setImportSummary(response.data);
      setSuccess(response.data.message);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && errorData.failed?.length > 0) {
        setImportSummary(errorData);
        setError(errorData.message || "Error al importar los datos. Revisa los detalles.");
      } else {
        const errorMessage =
          errorData?.message || errorData?.error || err.message || "Error al importar los datos.";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setImportSummary(null);

    try {
      const response = await api.get(`/data/export/${exportEntity}`, {
        responseType: "blob",
      });
      saveAs(response.data, `export_${exportEntity}_data.xlsx`);
      setSuccess("Datos exportados correctamente.");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error al exportar los datos.";
      setError(errorMessage);
    } finally {
      setLoading(false);
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
            onChange={(e) => setImportEntity(e.target.value)}
            className="p-2 border rounded"
          >
            {Object.keys(SANAYA_ENTITIES).map((key) => (
              <option key={key} value={key.replace("-", "_")}>
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

        <button
          onClick={handleImport}
          disabled={loading || !file}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Importando..." : "Importar"}
        </button>
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
              <option key={key} value={key.replace("-", "_")}>
                {SANAYA_ENTITIES[key].label}
              </option>
            ))}
            <option value="usuarios">Usuarios</option>
          </select>
        </div>
        <button
          onClick={handleExport}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Exportando..." : "Exportar"}
        </button>
      </div>

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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fila (Excel)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Razón del Fallo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importSummary.failed.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.row}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTransfer;
