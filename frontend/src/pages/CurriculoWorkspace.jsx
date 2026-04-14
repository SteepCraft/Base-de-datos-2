import EntityWorkspace from "../components/EntityWorkspace";

const tabs = [
  {
    key: "planes",
    label: "Planes",
    entities: [
      {
        entityKey: "pensums",
        title: "Pensums",
        subtitle: "Estructura general de pensums",
      },
      {
        entityKey: "detalle-pensums",
        title: "Detalle Pensums",
        subtitle: "Niveles y asignaturas por pensum",
      },
    ],
  },
  {
    key: "terc-pensums",
    label: "Asignaciones",
    entities: [
      {
        entityKey: "terc-pensums",
        title: "Asignaciones de Pensum",
        subtitle: "Asignacion de pensums a terceros",
      },
    ],
  },
];

const CurriculoWorkspace = () => (
  <EntityWorkspace
    moduleTitle="Estructura curricular"
    moduleDescription="Configura planes, detalle curricular y asignaciones estudiantiles."
    tabs={tabs}
    defaultTab="planes"
  />
);

export default CurriculoWorkspace;
