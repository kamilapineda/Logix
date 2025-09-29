import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfessorStatsPage() {
    // Estado para guardar estadísticas generales por estudiante
  const [stats, setStats] = useState([]);
    // Estado para guardar estadísticas agrupadas por pilar
  const [pillarStats, setPillarStats] = useState([]);
    // Estado de carga
  const [loading, setLoading] = useState(true);
    // Estado de error
  const [error, setError] = useState("");
    // Control de modal o vista de un estudiante específico (por si se abre detalle)
  const [openStudent, setOpenStudent] = useState(null);
  const navigate = useNavigate();

   //Efecto que carga las estadísticas cuando entra el profesor a la página
  useEffect(() => {
    const fetchStats = async () => {
      // Recuperar usuario desde localStorage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      // Si no hay usuario, mostrar error
      if (!storedUser) {
        setError("No hay usuario logueado");
        setLoading(false);
        return;
      }
      // Validar rol de usuario
      const role = storedUser.role?.replace(/^['"]+|['"]+$/g, "");
      if (role !== "Profesor") {
        setError("No tienes permisos para ver esta página");
        setLoading(false);
        return;
      }

      const professorId = storedUser.id;

      try {
        // Obtener estadísticas por estudiante
        const res = await fetch(
          `http://localhost:3000/api/stats/professor/${professorId}`
        );
        if (!res.ok)
          throw new Error("Error al cargar estadísticas de estudiantes");
        const data = await res.json();
        setStats(data);

        // Obtener estadísticas agrupadas por pilar del pensamiento computacional
        const resPillars = await fetch(
          `http://localhost:3000/api/stats/professor/${professorId}/pillars`
        );
        if (!resPillars.ok)
          throw new Error("Error al cargar estadísticas por pilar");
        const pillarsData = await resPillars.json();
        setPillarStats(pillarsData);
        console.log("pillarStats:", pillarsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Paleta de colores asignada a cada pilar
  const pillarColors = {
    Abstracción: "#8884d8",
    Descomposición: "#82ca9d",
    "Pensamiento Algorítmico": "#ffc658",
    Evaluación: "#ff8042",
    "Reconocimiento de Patrones": "#00C49F",
  };

  // Función para cortar etiquetas largas en los ejes del gráfico
  const formatTick = (label) => {
    if (label.length > 12) {
      const words = label.split(" ");
      const mid = Math.ceil(words.length / 2);
      return `${words.slice(0, mid).join(" ")}\n${words.slice(mid).join(" ")}`;
    }
    return label;
  };

  // Vista mientras cargan los datos
  if (loading)
    return (
      <div className="text-white text-center p-10 text-2xl">
        Cargando estadísticas...
      </div>
    );

    // Vista en caso de error
  if (error)
    return (
      <div className="text-red-500 text-center p-10 text-2xl">{error}</div>
    );

  return (
    <div className="bg-slate-900 min-h-screen text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-yellow-400 mb-8">
        👨‍🏫 Estadísticas de mis Estudiantes
      </h1>

      {/* 🔙 Botón de regresar */}
      <button
        onClick={() => navigate("/professor")}
        className="mb-8 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-xl shadow-lg transition"
      >
        ⬅ Regresar
      </button>

      {/* 📊 Retroalimentación general por pilar */}
      <div className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 mb-10">
        <h2 className="text-2xl font-semibold text-yellow-300 mb-4">
          📊 Rendimiento promedio por Pilar
        </h2>
        {pillarStats.length === 0 ? (
          <p className="text-slate-400">Aún no hay datos por pilar.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pillarStats}>
              <XAxis
                dataKey="pillar"
                stroke="#ccc"
                interval={0}
                tick={{ fontSize: 12 }}
                height={70}
                tickFormatter={formatTick}
              />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="promedio">
                {pillarStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pillarColors[entry.pillar] || "#facc15"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 👥 Estadísticas por estudiante */}
      {stats.length === 0 ? (
        <p className="text-slate-400">Aún no hay datos de estudiantes.</p>
      ) : (
        stats.map((student, idx) => (
          <div
            key={idx}
            className="w-full bg-slate-800 rounded-2xl mb-6 shadow-lg border border-slate-700"
          >
            {/* Cabecera del acordeón */}
            <button
              onClick={() => setOpenStudent(openStudent === idx ? null : idx)}
              className="w-full flex justify-between items-center px-6 py-4 text-left text-xl font-semibold text-yellow-300 hover:bg-slate-700 transition rounded-t-2xl"
            >
              <span>
                {student.student_name}{" "}
                <span className="text-slate-400 text-base">
                  ({student.email})
                </span>
              </span>
              <span className="text-white">
                {openStudent === idx ? "▲" : "▼"}
              </span>
            </button>

            {/* Resumen general */}
            <div className="px-6 py-3 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-700">
              <p>
                Puntaje total:{" "}
                <span className="text-green-400">{student.total_score}</span>
              </p>
              <p>
                Errores totales:{" "}
                <span className="text-red-400">{student.total_errors}</span>
              </p>
              <p>
                Reintentos totales:{" "}
                <span className="text-blue-400">{student.total_resets}</span>
              </p>
            </div>

            {/* Misiones */}
            {openStudent === idx && (
              <div className="px-6 py-4 bg-slate-800">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-slate-700 border border-slate-600 rounded-lg">
                    <thead>
                      <tr className="bg-slate-600 text-yellow-300">
                        <th className="px-3 py-2 text-left">Misión</th>
                        <th className="px-3 py-2 text-left">Dificultad</th>
                        <th className="px-3 py-2 text-left">Puntaje</th>
                        <th className="px-3 py-2 text-left">Errores</th>
                        <th className="px-3 py-2 text-left">Reintentos</th>
                        <th className="px-3 py-2 text-left">Pilares</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.missions.map((m, midx) => (
                        <tr
                          key={midx}
                          className="border-t border-slate-600 hover:bg-slate-600 transition"
                        >
                          <td className="px-3 py-2">
                            {m.mission_name || m.mission}
                          </td>
                          <td className="px-3 py-2">
                            {m.dificultad || m.difficulty}
                          </td>
                          <td className="px-3 py-2 text-green-400">
                            {m.mission_score || m.score}
                          </td>
                          <td className="px-3 py-2 text-red-400">{m.errors}</td>
                          <td className="px-3 py-2 text-blue-400">
                            {m.reset_count || m.resets}
                          </td>
                          <td className="px-3 py-2 text-purple-400">
                            {Array.isArray(m.pillar)
                              ? m.pillar.join(", ")
                              : m.pillar}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default ProfessorStatsPage;
