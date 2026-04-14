import EntityWorkspace from "../components/EntityWorkspace";

const tabs = [
  {
    key: "proceso",
    label: "Proceso Academico",
    entities: [
      {
        entityKey: "prematriculas",
        title: "Prematriculas",
        subtitle: "Planeacion de carga academica",
      },
      {
        entityKey: "historias",
        title: "Historias",
        subtitle: "Notas historicas por estudiante y curso",
      },
    ],
  },
  {
    key: "auditorias",
    label: "Auditorias",
    entities: [
      {
        entityKey: "auditorias",
        title: "Auditorias",
        subtitle: "Trazabilidad de cambios academicos",
      },
    ],
  },
];

const SeguimientoWorkspace = () => (
  <EntityWorkspace
    moduleTitle="Seguimiento estudiantil"
    moduleDescription="Consolida prematriculas, historiales y auditoria en un mismo espacio."
    tabs={tabs}
    defaultTab="proceso"
  />
);

export default SeguimientoWorkspace;
