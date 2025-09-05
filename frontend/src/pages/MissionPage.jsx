import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMissionDetailsAPI, resetMissionProgressAPI } from '../services/api';

// --- Skeleton Loader para la misión ---
function MissionSkeleton() {
  return (
    <div className="bg-slate-900 min-h-screen text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center animate-pulse">
        {/* Botón de volver */}
        <div className="h-6 w-32 bg-slate-700 rounded mb-6 mx-auto"></div>

        {/* Título */}
        <div className="h-10 bg-slate-700 rounded w-2/3 mx-auto mb-6"></div>

        {/* Progreso */}
        <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto mb-6"></div>

        {/* Puntaje */}
        <div className="h-4 bg-slate-700 rounded w-1/3 mx-auto mb-8"></div>

        {/* Botón reiniciar */}
        <div className="h-10 bg-slate-700 rounded w-40 mx-auto mb-10"></div>

        {/* Cuadrícula de niveles (placeholders) */}
        <div className="flex flex-wrap justify-center items-center gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg w-32 h-32 bg-slate-700"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MissionPage() {
  const { missionId } = useParams();

  const [mission, setMission] = useState(null);
  const [progress, setProgress] = useState({ correctlyAnsweredIds: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <MissionSkeleton />;
  if (error) return <div className="text-red-500 text-center p-10 text-2xl">{error}</div>;
  if (!mission) return <div className="text-white text-center p-10 text-2xl">Misión no encontrada.</div>;

  const correctlyAnsweredCount = progress.correctlyAnsweredIds.length;
  const totalQuestions = mission.questions.length;
  const isMissionComplete = totalQuestions > 0 && correctlyAnsweredCount === totalQuestions;

  return (
    <div className="bg-slate-900 min-h-screen text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center">
        <Link to="/student" className="text-blue-400 hover:underline absolute top-8 left-8">← Volver al Panel</Link>
        <h1 className="text-5xl font-bold text-yellow-400 mb-4">{mission.nombre}</h1>
        <p className="text-lg text-slate-400 mb-10">
          Progreso: {correctlyAnsweredCount} / {totalQuestions} niveles completados
        </p>
        <p className="text-lg text-slate-400 mb-4">
          Puntaje actual: {mission.mission_score ?? 0} puntos
        </p>

        <button
          onClick={handleResetMission}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded mb-6"
        >
          Reiniciar Misión
        </button>

        <div className="flex flex-wrap justify-center items-center gap-8">
          {mission.questions.map((question, index) => {
            const questionId = question.id || question.questions_id;
            const isCompleted = progress.correctlyAnsweredIds.includes(questionId);
            const isUnlocked = index === 0 || progress.correctlyAnsweredIds.includes(mission.questions[index - 1].id || mission.questions[index - 1].questions_id);

            const levelClasses = isCompleted
              ? "bg-green-600/20 border-2 border-green-500 hover:bg-green-500/40"
              : isUnlocked
              ? "bg-blue-600/20 border-2 border-blue-500 hover:bg-blue-500/40"
              : "bg-slate-700/20 border-2 border-slate-600 cursor-not-allowed";

            const LevelContent = () => (
              <div className={`rounded-lg w-32 h-32 flex flex-col justify-center items-center transition-all duration-200 ${levelClasses}`}>
                <span className="text-4xl font-bold">{index + 1}</span>
                <span className="text-sm">NIVEL</span>
                {!isUnlocked && <span className="text-xs text-red-400">Bloqueado</span>}
              </div>
            );

            return isUnlocked ? (
              <Link to={`/mission/${missionId}/question/${index}`} key={questionId}>
                <LevelContent />
              </Link>
            ) : (
              <div key={questionId}>
                <LevelContent />
              </div>
            );
          })}
        </div>

        {isMissionComplete && (
          <div className="mt-12 p-6 bg-green-500/20 border border-green-500 rounded-lg">
            <h2 className="text-3xl font-bold text-green-400">¡MISIÓN COMPLETADA!</h2>
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
