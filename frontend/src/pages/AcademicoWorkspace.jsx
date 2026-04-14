import EntityWorkspace from "../components/EntityWorkspace";

const tabs = [
  {
    key: "catalogo",
    label: "Catalogo",
    entities: [
      {
        entityKey: "programas",
        title: "Programas",
        subtitle: "Gestion de programas academicos",
      },
      {
        entityKey: "asignaturas",
        title: "Asignaturas",
        subtitle: "Catalogo de materias y creditos",
      },
    ],
  },
  {
    key: "oferta",
    label: "Oferta",
    entities: [
      {
        entityKey: "cursos",
        title: "Cursos",
        subtitle: "Oferta de cursos por periodo",
      },
    ],
  },
];

const AcademicoWorkspace = () => (
  <EntityWorkspace
    moduleTitle="Gestion academica"
    moduleDescription="Administra programas, asignaturas y cursos desde un solo flujo."
    tabs={tabs}
    defaultTab="catalogo"
  />
);

export default AcademicoWorkspace;
