import { useQuery } from "@tanstack/react-query";
import {
  FiArrowRight,
  FiBookOpen,
  FiClipboard,
  FiFileText,
  FiLayers,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import { listEntity } from "../config/sanayaApi";

const Dashboard = () => {
  const tercerosQuery = useQuery({
    queryKey: ["sanaya", "terceros"],
    queryFn: () => listEntity("terceros"),
  });

  const asignaturasQuery = useQuery({
    queryKey: ["sanaya", "asignaturas"],
    queryFn: () => listEntity("asignaturas"),
  });

  const cursosQuery = useQuery({
    queryKey: ["sanaya", "cursos"],
    queryFn: () => listEntity("cursos"),
  });

  const historiasQuery = useQuery({
    queryKey: ["sanaya", "historias"],
    queryFn: () => listEntity("historias"),
  });

  const pensumsQuery = useQuery({
    queryKey: ["sanaya", "pensums"],
    queryFn: () => listEntity("pensums"),
  });

  const terceros = tercerosQuery.data || [];
  const pensums = pensumsQuery.data || [];
  const isLoadingStats = [tercerosQuery, asignaturasQuery, cursosQuery, historiasQuery].some(
    (query) => query.isLoading,
  );

  const stats = [
    {
      name: "Total Terceros",
      value: terceros.length,
      icon: FiUsers,
      cardClass: "border-l-2 border-l-primary/45",
      iconClass: "bg-primary/15 text-primary",
    },
    {
      name: "Total Asignaturas",
      value: (asignaturasQuery.data || []).length,
      icon: FiBookOpen,
      cardClass: "border-l-2 border-l-ring/40",
      iconClass: "bg-secondary text-secondary-foreground",
    },
    {
      name: "Total Cursos",
      value: (cursosQuery.data || []).length,
      icon: FiLayers,
      cardClass: "border-l-2 border-l-muted-foreground/35",
      iconClass: "bg-accent text-accent-foreground",
    },
    {
      name: "Total Historias",
      value: (historiasQuery.data || []).length,
      icon: FiClipboard,
      cardClass: "border-l-2 border-l-border",
      iconClass: "bg-muted text-muted-foreground",
    },
  ];

  const quickModules = [
    {
      name: "Personas",
      description: "Gestiona terceros y datos base.",
      to: "/personas",
    },
    {
      name: "Gestion Academica",
      description: "Programas, asignaturas y cursos en un solo flujo.",
      to: "/academico",
    },
    {
      name: "Estructura Curricular",
      description: "Pensums y detalles curriculares.",
      to: "/curriculo",
    },
    {
      name: "Seguimiento",
      description: "Prematriculas, historias y auditoria.",
      to: "/seguimiento",
    },
  ];

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Resumen general del sistema academico SANAYA
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className={stat.cardClass}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg p-3 ${stat.iconClass}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-muted-foreground">{stat.name}</p>
                    {isLoadingStats ? (
                      <Skeleton className="mt-2 h-8 w-16" />
                    ) : (
                      <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Accesos por modulo</CardTitle>
            <CardDescription>Navegacion recomendada</CardDescription>
          </div>
          <Badge variant="secondary">Modulos</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {quickModules.map((module) => (
              <Link
                key={module.name}
                to={module.to}
                className="group rounded-xl border border-border bg-muted/30 p-4 transition hover:border-primary/45 hover:bg-primary/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{module.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
                  </div>
                  <FiArrowRight className="mt-0.5 size-4 text-muted-foreground transition group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Terceros por tipo</CardTitle>
            <CardDescription>Distribucion por categoria registrada</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(
              terceros.reduce((acc, tercero) => {
                const key = tercero.terc_tipo || "N/A";
                acc[key] = (acc[key] || 0) + 1;
                return acc;
              }, {}),
            )
              .slice(0, 6)
              .map(([tipo, total], index, array) => (
                <div key={tipo}>
                  <div className="flex items-center justify-between py-3">
                    <p className="truncate text-sm font-medium text-foreground">Tipo {tipo}</p>
                    <Badge variant="secondary">{total}</Badge>
                  </div>
                  {index < array.length - 1 ? <Separator /> : null}
                </div>
              ))}

            {terceros.length === 0 ? (
              <p className="py-3 text-sm text-muted-foreground">No hay terceros registrados</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ultimos pensums</CardTitle>
            <CardDescription>Ultimas estructuras curriculares cargadas</CardDescription>
          </CardHeader>
          <CardContent>
            {(pensums || [])
              .slice(-5)
              .reverse()
              .map((pensum, index, array) => (
                <div key={pensum.pens_id || `${pensum.pens_periodo}-${index}`}>
                  <div className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">Plan de estudio</p>
                      <p className="text-sm text-muted-foreground">
                        Periodo {pensum.pens_periodo || "N/A"}
                      </p>
                    </div>
                    <Badge className="inline-flex items-center gap-1" variant="secondary">
                      <FiFileText className="size-3.5" />
                      Activo
                    </Badge>
                  </div>
                  {index < array.length - 1 ? <Separator /> : null}
                </div>
              ))}

            {pensums.length === 0 ? (
              <p className="py-3 text-sm text-muted-foreground">No hay pensums registrados</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
