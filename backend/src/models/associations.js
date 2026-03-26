export default function applyAssociations(models) {
  const {
    Tercero,
    Asignatura,
    Programa,
    Curso,
    Pensum,
    Historia,
    DetallePensum,
    TercPensum,
    Prematricula,
    Auditoria,
  } = models;

  // Helpers para no re-crear la misma asociación varias veces
  const hasAssoc = (model, alias) =>
    model &&
    model.associations &&
    Object.prototype.hasOwnProperty.call(model.associations, alias);

  const addBelongsTo = (source, target, opts) => {
    if (!source || !target || !opts?.as) return;
    if (!hasAssoc(source, opts.as)) source.belongsTo(target, opts);
  };

  const addHasMany = (source, target, opts) => {
    if (!source || !target || !opts?.as) return;
    if (!hasAssoc(source, opts.as)) source.hasMany(target, opts);
  };

  if (Curso && Tercero) {
    addBelongsTo(Curso, Tercero, { foreignKey: "terc_id", as: "tercero" });
    addHasMany(Tercero, Curso, { foreignKey: "terc_id", as: "cursos" });
  }

  if (Curso && Asignatura) {
    addBelongsTo(Curso, Asignatura, {
      foreignKey: "asig_id",
      as: "asignatura",
    });
    addHasMany(Asignatura, Curso, { foreignKey: "asig_id", as: "cursos" });
  }

  if (Pensum && Programa) {
    addBelongsTo(Pensum, Programa, { foreignKey: "prog_id", as: "programa" });
    addHasMany(Programa, Pensum, { foreignKey: "prog_id", as: "pensums" });
  }

  if (Historia && Curso) {
    addBelongsTo(Historia, Curso, { foreignKey: "curs_id", as: "curso" });
    addHasMany(Curso, Historia, { foreignKey: "curs_id", as: "historias" });
  }

  if (Historia && Tercero) {
    addBelongsTo(Historia, Tercero, { foreignKey: "terc_id", as: "tercero" });
    addHasMany(Tercero, Historia, { foreignKey: "terc_id", as: "historias" });
  }

  if (DetallePensum && Pensum) {
    addBelongsTo(DetallePensum, Pensum, {
      foreignKey: "pens_id",
      as: "pensum",
    });
    addHasMany(Pensum, DetallePensum, {
      foreignKey: "pens_id",
      as: "detalles",
    });
  }

  if (DetallePensum && Asignatura) {
    addBelongsTo(DetallePensum, Asignatura, {
      foreignKey: "asig_id",
      as: "asignatura",
    });
    addHasMany(Asignatura, DetallePensum, {
      foreignKey: "asig_id",
      as: "detallesPensum",
    });
  }

  if (TercPensum && Pensum) {
    addBelongsTo(TercPensum, Pensum, { foreignKey: "pens_id", as: "pensum" });
    addHasMany(Pensum, TercPensum, {
      foreignKey: "pens_id",
      as: "tercerosPensum",
    });
  }

  if (TercPensum && Tercero) {
    addBelongsTo(TercPensum, Tercero, { foreignKey: "terc_id", as: "tercero" });
    addHasMany(Tercero, TercPensum, {
      foreignKey: "terc_id",
      as: "pensumsAsignados",
    });
  }

  if (Prematricula && Tercero) {
    addBelongsTo(Prematricula, Tercero, {
      foreignKey: "terc_id",
      as: "tercero",
    });
    addHasMany(Tercero, Prematricula, {
      foreignKey: "terc_id",
      as: "prematriculas",
    });
  }

  if (Prematricula && Asignatura) {
    addBelongsTo(Prematricula, Asignatura, {
      foreignKey: "asig_id",
      as: "asignatura",
    });
    addHasMany(Asignatura, Prematricula, {
      foreignKey: "asig_id",
      as: "prematriculas",
    });
  }

  if (Auditoria && Tercero) {
    addBelongsTo(Auditoria, Tercero, { foreignKey: "terc_id", as: "tercero" });
    addHasMany(Tercero, Auditoria, {
      foreignKey: "terc_id",
      as: "auditorias",
    });
  }

  if (Auditoria && Curso) {
    addBelongsTo(Auditoria, Curso, { foreignKey: "curs_id", as: "curso" });
    addHasMany(Curso, Auditoria, { foreignKey: "curs_id", as: "auditorias" });
  }

  return models;
}
