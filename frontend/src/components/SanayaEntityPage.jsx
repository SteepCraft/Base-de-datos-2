import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import PropTypes from "prop-types";
import { useMemo, useState } from "react";

import {
  createEntity,
  deleteEntity,
  getEntityOptions,
  SANAYA_ENTITIES,
  searchEntity,
  updateEntity,
} from "../config/sanayaApi";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const emptyForm = (fields) => fields.reduce((acc, field) => ({ ...acc, [field]: "" }), {});

const cleanDisplayText = (value) => {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/\(\s*ID\s*:\s*[^)]+\)/gi, "")
    .replace(/\bID\s*\d+\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const toAlias = (entityName) => {
  if (!entityName) return null;
  if (entityName.endsWith("s") && entityName !== "pensums") {
    return entityName.slice(0, -1);
  }
  if (entityName === "pensums") return "pensum";
  return entityName;
};

const getFriendlyFieldLabel = (config, field) => {
  const rawLabel = config.fieldLabels?.[field] || field;
  if (!field.endsWith("_id") || config.foreignKeys?.[field]) {
    return rawLabel;
  }

  if (rawLabel.toUpperCase() === "ID") {
    return "Codigo";
  }

  return rawLabel.replace(/\bID\b/gi, "Codigo");
};

const formatRelatedLabel = (entityName, relatedRow) => {
  if (!relatedRow) return "";

  const relatedConfig = SANAYA_ENTITIES[entityName];
  if (!relatedConfig) return "";

  const preferredFields =
    relatedConfig.displayFields?.filter((field) => !field.endsWith("_id")) || [];

  const fieldsToUse =
    preferredFields.length > 0
      ? preferredFields
      : Object.keys(relatedRow).filter((field) => !field.endsWith("_id"));

  const composed = fieldsToUse
    .map((field) => relatedRow[field])
    .filter((value) => value !== undefined && value !== null && value !== "")
    .map((value) => cleanDisplayText(value));

  if (entityName === "cursos" && relatedRow.asignatura) {
    const { asignatura } = relatedRow;
    const asigLabel = cleanDisplayText(
      `${asignatura.asig_codigo || ""} ${asignatura.asig_asignatura || ""}`,
    );
    const periodo = cleanDisplayText(relatedRow.curs_periodo);
    return [asigLabel, periodo].filter(Boolean).join(" - ");
  }

  return composed.join(" - ");
};

const SearchableForeignKeyField = ({
  disabled,
  emptyText,
  entityName,
  error,
  initialLabel,
  onChange,
  placeholder,
  value,
}) => {
  const [open, setOpen] = useState(false);

  const { data: options = [], isFetching } = useQuery({
    queryKey: ["sanaya", "options", entityName],
    queryFn: () => getEntityOptions(entityName),
    enabled: Boolean(entityName),
    staleTime: 30_000,
  });

  const normalizedValue = value === null || value === undefined ? "" : String(value);

  const selectedOption = useMemo(
    () => options.find((option) => String(option.id) === normalizedValue) || null,
    [options, normalizedValue],
  );

  const selectedLabel = useMemo(() => {
    const fromOptions = cleanDisplayText(selectedOption?.label);
    const fromInitialLabel = cleanDisplayText(initialLabel);
    return fromOptions || fromInitialLabel;
  }, [initialLabel, selectedOption]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (disabled) return;
          if (!nextOpen) {
            handleClose();
            return;
          }
          setOpen(nextOpen);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              !selectedLabel && "text-slate-400",
              error && "border-red-300 text-red-700",
            )}
          >
            <span className="truncate text-left">{selectedLabel || placeholder}</span>
            {isFetching ? (
              <Loader2 className="size-4 animate-spin text-slate-400" />
            ) : (
              <ChevronDown className="size-4 text-slate-400" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-2">
          <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200">
            {isFetching && options.length === 0 ? (
              <div className="p-3 text-sm text-slate-500">Buscando...</div>
            ) : null}

            {!isFetching && options.length === 0 ? (
              <div className="p-3 text-sm text-slate-500">{emptyText}</div>
            ) : null}

            {options.map((option) => {
              const isSelected = String(option.id) === normalizedValue;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(String(option.id));
                    handleClose();
                  }}
                  className={cn(
                    "flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100",
                    isSelected && "bg-amber-50 text-amber-900",
                  )}
                >
                  <Check
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      isSelected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span>{cleanDisplayText(option.label)}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
};

SearchableForeignKeyField.propTypes = {
  disabled: PropTypes.bool,
  emptyText: PropTypes.string,
  entityName: PropTypes.string.isRequired,
  error: PropTypes.string,
  initialLabel: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
};

SearchableForeignKeyField.defaultProps = {
  disabled: false,
  emptyText: "No hay resultados",
  error: "",
  initialLabel: "",
  placeholder: "Selecciona una opcion",
  value: "",
};

const SanayaEntityPage = ({ entityKey, showHeader, subtitle, title }) => {
  const config = SANAYA_ENTITIES[entityKey];
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formData, setFormData] = useState(emptyForm(config.fields));
  const [formErrors, setFormErrors] = useState({});
  const [relationshipLabels, setRelationshipLabels] = useState({});
  const queryKey = ["sanaya", entityKey];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => searchEntity(entityKey),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createEntity(entityKey, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sanaya", entityKey] });
      setIsModalOpen(false);
      setEditingRow(null);
      setFormData(emptyForm(config.fields));
      setFormErrors({});
      setRelationshipLabels({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ payload, pkValues }) => updateEntity(entityKey, config.pk, pkValues, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sanaya", entityKey] });
      setIsModalOpen(false);
      setEditingRow(null);
      setFormData(emptyForm(config.fields));
      setFormErrors({});
      setRelationshipLabels({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (pkValues) => deleteEntity(entityKey, config.pk, pkValues),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sanaya", entityKey] });
    },
  });

  const rows = Array.isArray(data) ? data : [];

  const visibleFields = useMemo(
    () => config.fields.filter((field) => !(field.endsWith("_id") && !config.foreignKeys?.[field])),
    [config],
  );

  const getPkValues = (row) =>
    config.pk.reduce((acc, field) => ({ ...acc, [field]: row[field] }), {});

  const resolveRelatedLabel = (row, field) => {
    const relatedEntity = config.foreignKeys?.[field];
    if (!relatedEntity) return "";

    const alias = toAlias(relatedEntity);
    const relatedRow = row[alias];
    const label = formatRelatedLabel(relatedEntity, relatedRow);
    return cleanDisplayText(label);
  };

  const renderCell = (row, field) => {
    if (config.foreignKeys?.[field]) {
      const label = resolveRelatedLabel(row, field);
      return label || "Sin referencia";
    }

    const value = row[field];
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    if (field.toLowerCase().includes("fecha")) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString("es-CO");
      }
    }

    return cleanDisplayText(value);
  };

  const filteredRows = rows;

  const openCreate = () => {
    setEditingRow(null);
    setFormData(emptyForm(config.fields));
    setFormErrors({});
    setRelationshipLabels({});
    setIsModalOpen(true);
  };

  const openEdit = (row) => {
    const nextData = emptyForm(config.fields);
    const nextLabels = {};

    config.fields.forEach((field) => {
      const value = row[field];
      nextData[field] = value === null || value === undefined ? "" : String(value);
      if (config.foreignKeys?.[field]) {
        nextLabels[field] = resolveRelatedLabel(row, field);
      }
    });

    setEditingRow(row);
    setFormData(nextData);
    setFormErrors({});
    setRelationshipLabels(nextLabels);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRow(null);
    setFormData(emptyForm(config.fields));
    setFormErrors({});
    setRelationshipLabels({});
  };

  const validateForm = () => {
    const nextErrors = {};

    config.fields.forEach((field) => {
      const isPk = config.pk.includes(field);
      const isEditingLockedPk = Boolean(editingRow && isPk);
      if (isEditingLockedPk) return;

      const value = formData[field];
      if (value === undefined || value === null || String(value).trim() === "") {
        nextErrors[field] = "Campo obligatorio";
      }
    });

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    setFormErrors({});

    const payload = { ...formData };
    if (editingRow) {
      updateMutation.mutate({
        payload,
        pkValues: getPkValues(editingRow),
      });
      return;
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {showHeader ? (
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle || config.label}</p>
        </section>
      ) : null}

      <section className="mb-6 flex justify-end">
        <Dialog
          open={isModalOpen}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              closeModal();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              Nuevo registro
            </Button>
          </DialogTrigger>

          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingRow ? "Editar registro" : "Crear registro"}</DialogTitle>
                <DialogDescription>
                  Completa la informacion para relacionar datos.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
                {config.fields.map((field) => {
                  const isPk = config.pk.includes(field);
                  const disabled = Boolean(editingRow && isPk);
                  const isForeignKey = Boolean(config.foreignKeys?.[field]);
                  const error = formErrors[field];
                  const fieldLabel = getFriendlyFieldLabel(config, field);

                  return (
                    <div key={field} className="space-y-2">
                      <label
                        htmlFor={`${entityKey}-${field}`}
                        className="text-sm font-medium text-slate-700"
                      >
                        {fieldLabel}
                        {isPk ? (
                          <span className="ml-1 text-red-500" title="Requerido">
                            *
                          </span>
                        ) : null}
                      </label>

                      {isForeignKey ? (
                        <SearchableForeignKeyField
                          entityName={config.foreignKeys[field]}
                          value={formData[field]}
                          initialLabel={relationshipLabels[field]}
                          onChange={(nextValue) =>
                            setFormData((prev) => ({
                              ...prev,
                              [field]: nextValue,
                            }))
                          }
                          disabled={disabled}
                          error={error}
                          placeholder={`Seleccionar ${fieldLabel.toLowerCase()}...`}
                        />
                      ) : (
                        <>
                          <Input
                            id={`${entityKey}-${field}`}
                            disabled={disabled}
                            value={formData[field] ?? ""}
                            onChange={(event) =>
                              setFormData((prev) => ({
                                ...prev,
                                [field]: event.target.value,
                              }))
                            }
                            className={cn(error && "border-red-300")}
                          />
                          {error ? <p className="text-xs text-red-600">{error}</p> : null}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Guardando...
                    </>
                  ) : editingRow ? (
                    "Actualizar"
                  ) : (
                    "Crear"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100/70">
              <tr>
                {visibleFields.map((field) => (
                  <th
                    key={field}
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                  >
                    {getFriendlyFieldLabel(config, field)}
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={visibleFields.length + 1}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Cargando registros...
                    </div>
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleFields.length + 1}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No se encontraron registros
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr key={`${entityKey}-${index}`} className="hover:bg-slate-50">
                    {visibleFields.map((field) => (
                      <td
                        key={`${field}-${index}`}
                        className="max-w-[280px] px-5 py-3 text-sm text-slate-700"
                      >
                        <span className="line-clamp-2">{renderCell(row, field)}</span>
                      </td>
                    ))}
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(row)}
                          aria-label="Editar"
                        >
                          <Pencil className="size-4 text-amber-700" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm("¿Seguro que deseas eliminar este registro?")) {
                              deleteMutation.mutate(getPkValues(row));
                            }
                          }}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

SanayaEntityPage.propTypes = {
  entityKey: PropTypes.string.isRequired,
  showHeader: PropTypes.bool,
  subtitle: PropTypes.string,
  title: PropTypes.string.isRequired,
};

SanayaEntityPage.defaultProps = {
  showHeader: true,
  subtitle: "",
};

export default SanayaEntityPage;
