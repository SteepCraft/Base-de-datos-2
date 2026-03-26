import { useQuery } from "@tanstack/react-query";
import {
  FiUsers,
  FiBookOpen,
  FiLayers,
  FiClipboard,
  FiFileText,
} from "react-icons/fi";

import { listEntity } from "../config/sanayaApi";

const Dashboard = () => {
  const { data: terceros } = useQuery({
    queryKey: ["sanaya", "terceros"],
    queryFn: () => listEntity("terceros"),
  });

  const { data: asignaturas } = useQuery({
    queryKey: ["sanaya", "asignaturas"],
    queryFn: () => listEntity("asignaturas"),
  });

  const { data: cursos } = useQuery({
    queryKey: ["sanaya", "cursos"],
    queryFn: () => listEntity("cursos"),
  });

  const { data: historias } = useQuery({
    queryKey: ["sanaya", "historias"],
    queryFn: () => listEntity("historias"),
  });

  const { data: pensums } = useQuery({
    queryKey: ["sanaya", "pensums"],
    queryFn: () => listEntity("pensums"),
  });

  const stats = [
    {
      name: "Total Terceros",
      value: terceros?.length || 0,
      icon: FiUsers,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      name: "Total Asignaturas",
      value: asignaturas?.length || 0,
      icon: FiBookOpen,
      color: "bg-green-500",
      lightColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      name: "Total Cursos",
      value: cursos?.length || 0,
      icon: FiLayers,
      color: "bg-amber-500",
      lightColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      name: "Total Historias",
      value: historias?.length || 0,
      icon: FiClipboard,
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  return (
    <div className='px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
        <p className='mt-2 text-sm text-gray-600'>
          Resumen general del sistema academico SANAYA
        </p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className='overflow-hidden transition-shadow bg-white rounded-lg shadow-sm hover:shadow-md'
            >
              <div className='p-6'>
                <div className='flex items-center'>
                  <div
                    className={`flex-shrink-0 ${stat.lightColor} rounded-lg p-3`}
                  >
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <div className='flex-1 w-0 ml-5'>
                    <dl>
                      <dt className='text-sm font-medium text-gray-500 truncate'>
                        {stat.name}
                      </dt>
                      <dd className='flex items-baseline'>
                        <div className='text-2xl font-semibold text-gray-900'>
                          {stat.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <div className='bg-white rounded-lg shadow-sm'>
          <div className='px-6 py-5 border-b border-gray-200'>
            <h3 className='text-lg font-medium text-gray-900'>
              Terceros por tipo
            </h3>
          </div>
          <div className='px-6 py-4'>
            {Object.entries(
              (terceros || []).reduce((acc, t) => {
                const key = t.terc_tipo || "N/A";
                acc[key] = (acc[key] || 0) + 1;
                return acc;
              }, {})
            )
              .slice(0, 6)
              .map(([tipo, total]) => (
                <div
                  key={tipo}
                  className='flex items-center justify-between py-3 border-b border-gray-100 last:border-0'
                >
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>
                      Tipo {tipo}
                    </p>
                  </div>
                  <div className='ml-4'>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                      {total}
                    </span>
                  </div>
                </div>
              )) || (
              <p className='py-4 text-sm text-gray-500'>
                No hay terceros registrados
              </p>
            )}
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm'>
          <div className='px-6 py-5 border-b border-gray-200'>
            <h3 className='text-lg font-medium text-gray-900'>
              Ultimos pensums
            </h3>
          </div>
          <div className='px-6 py-4'>
            {pensums
              ?.slice(-5)
              .reverse()
              .map((pensum) => (
                <div
                  key={pensum.pens_id}
                  className='flex items-center justify-between py-3 border-b border-gray-100 last:border-0'
                >
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900'>
                      Pensum #{pensum.pens_id}
                    </p>
                    <p className='text-sm text-gray-500'>
                      Periodo {pensum.pens_periodo || "N/A"}
                    </p>
                  </div>
                  <div className='ml-4'>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800'>
                      <FiFileText className='mr-1' /> {pensum.prog_id || "-"}
                    </span>
                  </div>
                </div>
              )) || (
              <p className='py-4 text-sm text-gray-500'>
                No hay pensums registrados
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
