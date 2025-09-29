import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function StudentStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (!storedUser) {
        setError("No hay usuario logueado");
        setLoading(false);
        return;
      }

      const role = storedUser.role?.replace(/^['"]+|['"]+$/g, "");
      if (role !== "Estudiante") {
        setError("Debes iniciar sesión como estudiante para ver tus estadísticas");
        setLoading(false);
        return;
      }

      const studentId = storedUser.id;

      try {
        const res = await fetch(`http://localhost:3000/api/stats/student/${studentId}`);
        if (!res.ok) {
          throw new Error(`Error en la API: ${res.status}`);
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p className="text-white text-center p-6">Cargando...</p>;
  if (error) return <p className="text-red-500 text-center p-6">{error}</p>;

  // Sistema de niveles (cada nivel = 500 puntos)
  const xpPerLevel = 500;
  const totalXP = stats?.total_score || 0;
  const level = Math.floor(totalXP / xpPerLevel) + 1;
  const xpCurrentLevel = totalXP % xpPerLevel;
  const progress = (xpCurrentLevel / xpPerLevel) * 100;

  return (
    <div className="bg-slate-900 min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">📊 Mis estadísticas</h1>

      {/*Barra de experiencia moderna */}
      <div className="bg-slate-800 p-4 rounded-2xl shadow-lg mb-8">
        <p className="mb-2 text-yellow-300 font-semibold text-lg">
          🎯 Nivel {level} — {xpCurrentLevel}/{xpPerLevel} XP
        </p>
        <div className="w-full bg-slate-700 h-8 rounded-2xl overflow-hidden shadow-inner">
          <div
            className="h-full rounded-2xl transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #facc15, #fcd34d, #fde68a)",
              boxShadow: "0 0 10px rgba(252, 211, 77, 0.7)",
            }}
          ></div>
        </div>
      </div>

      {/*Resumen general */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8">
        <p>
          Puntaje total: <span className="text-green-400">{stats.total_score}</span>
        </p>
        <p>
          Errores totales: <span className="text-red-400">{stats.total_errors}</span>
        </p>
        <p>
          Reintentos totales: <span className="text-blue-400">{stats.total_resets}</span>
        </p>
      </div>

      {/*Tabla de misiones */}
      {stats.missions && stats.missions.length > 0 ? (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-yellow-300 mb-4">📚 Misiones completadas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-slate-800 border border-slate-600 rounded-lg">
              <thead>
                <tr className="bg-slate-700 text-yellow-300">
                  <th className="px-3 py-2 text-left">Misión</th>
                  <th className="px-3 py-2 text-left">Dificultad</th>
                  <th className="px-3 py-2 text-left">Puntaje</th>
                  <th className="px-3 py-2 text-left">Errores</th>
                  <th className="px-3 py-2 text-left">Reintentos</th>
                </tr>
              </thead>
              <tbody>
                {stats.missions.map((m, idx) => (
                  <tr key={idx} className="border-t border-slate-600 hover:bg-slate-600 transition">
                    <td className="px-3 py-2">{m.mission_name}</td>
                    <td className="px-3 py-2">{m.dificultad}</td>
                    <td className="px-3 py-2 text-green-400">{m.mission_score}</td>
                    <td className="px-3 py-2 text-red-400">{m.errors}</td>
                    <td className="px-3 py-2 text-blue-400">{m.reset_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-slate-400">No hay misiones registradas aún.</p>
      )}

      {/*Gráfico de barras */}
      {stats.missions && stats.missions.length > 0 && (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-yellow-300 mb-4">📈 Rendimiento por misión</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.missions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="mission_name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="mission_score" fill="#22c55e" name="Puntaje" />
              <Bar dataKey="errors" fill="#ef4444" name="Errores" />
              <Bar dataKey="reset_count" fill="#3b82f6" name="Reintentos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/*Botón regresar */}
      <button
        onClick={() => navigate("/student")}
        className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-xl shadow-lg transition"
      >
        ⬅ Regresar
      </button>
    </div>
  );
}

export default StudentStatsPage;
