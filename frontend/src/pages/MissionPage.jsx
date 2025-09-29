import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMissionDetailsAPI, resetMissionProgressAPI } from '../services/api';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

// Pantalla de carga con skeleton
function MissionSkeleton() {
  return (
    <div className="bg-slate-900 min-h-screen text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center animate-pulse">
        <div className="h-6 w-32 bg-slate-700 rounded mb-6 mx-auto"></div>
        <div className="h-10 bg-slate-700 rounded w-2/3 mx-auto mb-6"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto mb-6"></div>
        <div className="h-4 bg-slate-700 rounded w-1/3 mx-auto mb-8"></div>
        <div className="h-10 bg-slate-700 rounded w-40 mx-auto mb-10"></div>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg w-32 h-32 bg-slate-700"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Componente de nivel con estilos
const LevelContent = React.forwardRef((props, ref) => (
  <div
    ref={ref}
    className={`rounded-lg w-32 h-32 flex flex-col justify-center items-center relative ${props.levelClasses}`}
  >
    <span className="text-4xl font-bold">{props.index + 1}</span>
    <span className="text-sm tracking-wide">NIVEL</span>
    {!props.isUnlocked && <span className="text-xs text-red-400 mt-1">🔒 Bloqueado</span>}
  </div>
));

function MissionPage() {
  const { missionId } = useParams();
  const [mission, setMission] = useState(null);
  const [progress, setProgress] = useState({ correctlyAnsweredIds: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

    // Cargar misión al montar
  useEffect(() => {
    const fetchMission = async () => {
      try {
        setLoading(true);
        const data = await getMissionDetailsAPI(missionId);
        setMission(data);
        setProgress(data.progress);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMission();
  }, [missionId]);

    // Reiniciar misión
  const handleResetMission = async () => {
    try {
      await resetMissionProgressAPI(missionId);
      const data = await getMissionDetailsAPI(missionId);
      setMission(data);
      setProgress(data.progress);
    } catch (err) {
      alert("Error al resetear la misión: " + err.message);
    }
  };

    // Estados de carga, error y misión no encontrada
  if (loading) return <MissionSkeleton />;
  if (error) return <div className="text-red-500 text-center p-10 text-2xl">{error}</div>;
  if (!mission) return <div className="text-white text-center p-10 text-2xl">Misión no encontrada.</div>;

    // Calcular progreso
  const correctlyAnsweredCount = progress.correctlyAnsweredIds.length;
  const totalQuestions = mission.questions.length;
  const isMissionComplete = totalQuestions > 0 && correctlyAnsweredCount === totalQuestions;

  return (
    <div className="bg-slate-900 min-h-screen text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center relative">
        {/* Botón volver */}
        <Link to="/student" className="text-blue-400 hover:underline absolute top-8 left-8">
          ← Volver al Panel
        </Link>

        {/* Nombre misión */}
        <h1 className="text-5xl font-bold text-yellow-400 mb-4">{mission.nombre}</h1>

        {/* Barra de progreso */}
        <div className="w-full bg-slate-700 rounded-full h-4 mb-6 overflow-hidden shadow-inner">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 transition-all duration-700"
            style={{ width: `${(correctlyAnsweredCount / totalQuestions) * 100}%` }}
          ></div>
        </div>

        {/* Datos de progreso */}
        <p className="text-lg text-slate-300 mb-4">
          ✅ {correctlyAnsweredCount} / {totalQuestions} niveles completados
        </p>
        <p className="text-lg text-slate-300 mb-6">
          🎯 Puntaje: {mission.mission_score ?? 0} puntos
        </p>

        {/* Botón reinicio */}
        <button
          onClick={handleResetMission}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded mb-8 transform hover:scale-105 transition-all shadow-lg"
        >
          Reiniciar Misión
        </button>

        {/* Lista de niveles */}
        <div className="flex flex-wrap justify-center items-center gap-8">
          {mission.questions.map((question, index) => {
            const questionId = question.id || question.questions_id;
            const isCompleted = progress.correctlyAnsweredIds.includes(questionId);
            const isUnlocked =
              index === 0 ||
              progress.correctlyAnsweredIds.includes(
                mission.questions[index - 1].id || mission.questions[index - 1].questions_id
              );

              // Clases según estado
            const levelClasses = isCompleted
              ? "bg-green-600/30 border-2 border-green-500 hover:scale-105 transition-all shadow-md"
              : isUnlocked
              ? "bg-gradient-to-tr from-blue-500 via-blue-400 to-blue-600 border-2 border-blue-500 hover:scale-105 transition-all shadow-md"
              : "bg-slate-700/30 border-2 border-slate-600 cursor-not-allowed";

              // Render según estado
            return isUnlocked ? (
              <Tippy content={question.description ?? "Nivel desbloqueado"} key={questionId} animation="scale">
                <Link to={`/mission/${missionId}/question/${index}`}>
                  <LevelContent
                    levelClasses={levelClasses}
                    index={index}
                    isUnlocked={isUnlocked}
                    isCompleted={isCompleted}
                  />
                </Link>
              </Tippy>
            ) : (
              <Tippy content="Nivel bloqueado" key={questionId} animation="scale">
                <div>
                  <LevelContent
                    levelClasses={levelClasses}
                    index={index}
                    isUnlocked={isUnlocked}
                    isCompleted={isCompleted}
                  />
                </div>
              </Tippy>
            );
          })}
        </div>

        {/* Mensaje misión completada */}
        {isMissionComplete && (
          <div className="mt-12 p-6 bg-green-500/20 border border-green-500 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-green-400 mb-2">¡MISIÓN COMPLETADA!</h2>
            <p className="mt-2 text-slate-300">
              ¡Felicidades, Aventurero! Has superado todos los niveles de esta misión.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MissionPage;
