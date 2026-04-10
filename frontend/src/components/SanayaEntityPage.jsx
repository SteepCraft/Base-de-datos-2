import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";

import {
  SANAYA_ENTITIES,
  createEntity,
  deleteEntity,
  listEntity,
  updateEntity,
} from "../config/sanayaApi";

const emptyForm = (fields) =>
  fields.reduce((acc, field) => ({ ...acc, [field]: "" }), {});

const SanayaEntityPage = ({ entityKey, title, subtitle }) => {
  const config = SANAYA_ENTITIES[entityKey];
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(emptyForm(config.fields));

  const queryKey = ["sanaya", entityKey];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => listEntity(entityKey),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: (payload) => createEntity(entityKey, payload),
    onSuccess: () => {
      refresh();
      setIsModalOpen(false);
      setEditingRow(null);
      setFormData(emptyForm(config.fields));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ pkValues, payload }) =>
      updateEntity(entityKey, config.pk, pkValues, payload),
    onSuccess: () => {
      refresh();
      setIsModalOpen(false);
      setEditingRow(null);
      setFormData(emptyForm(config.fields));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (pkValues) => deleteEntity(entityKey, config.pk, pkValues),
    onSuccess: () => refresh(),
  });

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data || [];
    return (data || []).filter((row) =>
      config.fields.some((field) =>
        String(row[field] ?? "")
          .toLowerCase()
          .includes(term)
      )
    );
  }, [config.fields, data, searchTerm]);

  const openCreate = () => {
    setEditingRow(null);
    setFormData(emptyForm(config.fields));
    setIsModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    const next = emptyForm(config.fields);
    for (const field of config.fields) next[field] = row[field] ?? "";
    setFormData(next);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRow(null);
    setFormData(emptyForm(config.fields));
  };

  const getPkValues = (row) =>
    config.pk.reduce((acc, field) => ({ ...acc, [field]: row[field] }), {});

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };

    if (editingRow) {
      const pkValues = getPkValues(editingRow);
      updateMutation.mutate({ pkValues, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  return (
    <div className='px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>{title}</h1>
        <p className='mt-2 text-sm text-gray-600'>{subtitle}</p>
      </div>

      <div className='flex flex-col justify-between gap-4 mb-6 sm:flex-row'>
        <div className='relative flex-1 max-w-md'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <FiSearch className='w-5 h-5 text-gray-400' />
          </div>
          <input
            type='text'
            placeholder={`Buscar en ${config.label.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>

        <button
          onClick={openCreate}
          className='inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700'
        >
          <FiPlus className='w-5 h-5 mr-2' />
          Nuevo Registro
        </button>
      </div>

      <div className='overflow-hidden bg-white rounded-lg shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                {config.fields.map((field) => (
                  <th
                    key={field}
                    className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase'
                  >
                    {field}
                  </th>
                ))}
                <th className='px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={config.fields.length + 1}
                    className='px-6 py-4 text-center text-gray-500'
                  >
                    Cargando...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={config.fields.length + 1}
                    className='px-6 py-4 text-center text-gray-500'
                  >
                    No hay registros
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr
                    key={`${entityKey}-${index}`}
                    className='hover:bg-gray-50'
                  >
                    {config.fields.map((field) => (
                      <td
                        key={field}
                        className='px-6 py-4 text-sm text-gray-900 whitespace-nowrap'
                      >
                        {String(row[field] ?? "-")}
                      </td>
                    ))}
                    <td className='px-6 py-4 text-sm font-medium text-right whitespace-nowrap'>
                      <button
                        onClick={() => openEdit(row)}
                        className='mr-4 text-blue-600 hover:text-blue-900'
                      >
                        <FiEdit2 className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm("Deseas eliminar este registro?")
                          ) {
                            deleteMutation.mutate(getPkValues(row));
                          }
                        }}
                        className='text-red-600 hover:text-red-900'
                      >
                        <FiTrash2 className='w-5 h-5' />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
          <div className='flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0'>
            <div
              className='fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75'
              onClick={closeModal}
              aria-hidden='true'
            />
            <span
              className='hidden sm:inline-block sm:align-middle sm:h-screen'
              aria-hidden='true'
            >
              &#8203;
            </span>
            <div className='inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10'>
              <form onSubmit={handleSubmit}>
                <div className='px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      {editingRow ? "Editar Registro" : "Nuevo Registro"}
                    </h3>
                    <button
                      type='button'
                      onClick={closeModal}
                      className='text-gray-400 hover:text-gray-500'
                    >
                      <FiX className='w-6 h-6' />
                    </button>
                  </div>

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {config.fields.map((field) => {
                      const isPk = config.pk.includes(field);
                      const disabled = Boolean(editingRow && isPk);
                      return (
                        <div key={field}>
                          <label className='block mb-1 text-sm font-medium text-gray-700'>
                            {field}
                            {isPk ? " *" : ""}
                          </label>
                          <input
                            type='text'
                            required={isPk}
                            disabled={disabled}
                            value={formData[field] ?? ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                [field]: e.target.value,
                              }))
                            }
                            className='block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100'
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className='px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse'>
                  <button
                    type='submit'
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className='inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50'
                  >
                    {editingRow ? "Actualizar" : "Crear"}
                  </button>
                  <button
                    type='button'
                    onClick={closeModal}
                    className='inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm'
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

SanayaEntityPage.propTypes = {
  entityKey: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

SanayaEntityPage.defaultProps = {
  subtitle: "",
};

export default SanayaEntityPage;
