import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMissionDetailsAPI, submitAnswerAPI } from '../services/api';

function QuestionPage() {
  const { missionId, questionIndex } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(1);

  useEffect(() => {
    const fetchMission = async () => {
      try {
        setLoading(true);
        const data = await getMissionDetailsAPI(missionId);
        setMission(data);

        setFeedback(null);
        setUserAnswer('');

        const currentQuestion = data.questions[questionIndex];
        if (currentQuestion) {
          const questionId = currentQuestion.id || currentQuestion.questions_id;
          const isCorrectlyAnsweredBefore = data.progress.correctlyAnsweredIds.includes(questionId);
          setHasAnsweredCorrectly(isCorrectlyAnsweredBefore);

          setCurrentAttempt(
            data.progress.attemptCounts?.[questionId]
              ? data.progress.attemptCounts[questionId] + 1
              : 1
          );
        } else {
          setHasAnsweredCorrectly(false);
          setCurrentAttempt(1);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMission();
  }, [missionId, questionIndex]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer && (currentQuestion.tipo !== 'numeric' || userAnswer !== 0)) return;

    const currentQuestion = mission.questions[questionIndex];
    const questionId = currentQuestion.id || currentQuestion.questions_id;

    try {
      const result = await submitAnswerAPI({
        mission_id: missionId,
        question_id: questionId,
        answer_given: userAnswer,
        attempt_number: currentAttempt
      });

      setFeedback(result);
      if (result.isCorrect) {
        setHasAnsweredCorrectly(true);
      } else {
        setCurrentAttempt(prevAttempt => prevAttempt + 1);
      }
      setUserAnswer('');
    } catch (err) {
      setFeedback({
        isCorrect: false,
        scoreAwarded: 0,
        correctAnswer: null,
        maxAttemptsReached: false,
        error: `Error: ${err.message}`
      });
    }
  };

  const goToNextQuestion = () => {
    const nextIndex = Number(questionIndex) + 1;
    if (mission && nextIndex < mission.questions.length) {
      navigate(`/mission/${missionId}/question/${nextIndex}`);
    }
  };

  if (loading) {
  return (
    <div className="bg-slate-900 min-h-screen text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl mt-4 space-y-6 animate-pulse">
          {/* Nivel */}
          <div className="h-4 bg-slate-700 rounded w-1/5"></div>

          {/* Título */}
          <div className="h-6 bg-slate-700 rounded w-3/4"></div>

          {/*   Enunciado */}
          <div className="h-20 bg-slate-700 rounded"></div>

          {/* Opciones */}
          <div className="space-y-3">
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
          </div>

          {/* Botón */}
          <div className="h-12 bg-slate-700 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

  if (error) return <div className="text-red-500 text-center p-10">{error}</div>;
  if (!mission) return <div className="text-white text-center p-10">Pregunta no encontrada.</div>;

  const currentQuestion = mission.questions[questionIndex];
  if (!currentQuestion) return <div className="text-white text-center p-10">Pregunta no válida.</div>;

  const isLastQuestion = Number(questionIndex) === mission.questions.length - 1;

  const disableForm = hasAnsweredCorrectly || (feedback && !feedback.isCorrect && feedback.maxAttemptsReached);

  return (
    <div className="bg-slate-900 min-h-screen text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Link to={`/mission/${missionId}`} className="text-blue-400 hover:underline">← Volver a los niveles</Link>

        <div className="bg-slate-800 p-8 rounded-lg shadow-xl mt-4">
          <p className="text-slate-400 mb-2">Nivel {Number(questionIndex) + 1}</p>
          <h2 className="text-2xl font-semibold mb-4">{currentQuestion.titulo}</h2>
          <p className="text-lg text-slate-300 mb-6">{currentQuestion.enunciado}</p>

          {hasAnsweredCorrectly ? (
            <div className="bg-green-500/10 border border-green-500 p-4 rounded text-green-300 text-center">
              <p>¡Respondiste correctamente esta pregunta!</p>
              {feedback?.scoreAwarded !== undefined && (
                <p className="mt-2">Puntos obtenidos: <strong>{feedback.scoreAwarded}</strong></p>
              )}
              {isLastQuestion ? (
                <Link to={`/mission/${missionId}`} className="block w-full mt-4 bg-yellow-600 hover:bg-yellow-700 font-bold py-2 px-4 rounded">¡Misión Completada!</Link>
              ) : (
                <button onClick={goToNextQuestion} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded">
                  Siguiente Nivel →
                </button>
              )}
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                {currentQuestion.tipo === 'multiple_option' && (
                  <div className="space-y-2">
                    {currentQuestion.opciones.map((option, index) => (
                      <label key={index} className={`flex items-center p-3 rounded cursor-pointer ${disableForm ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600'}`}>
                        <input
                          type="radio"
                          name="answer"
                          value={option}
                          checked={userAnswer === option}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          className="h-4 w-4"
                          disabled={disableForm}
                        />
                        <span className="ml-3">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                {currentQuestion.tipo === 'true_false' && (
                  <div className="space-y-2">
                    <label className={`flex items-center p-3 rounded cursor-pointer ${disableForm ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600'}`}>
                      <input
                        type="radio"
                        name="answer"
                        value="Verdadero"
                        checked={userAnswer === 'Verdadero'}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="h-4 w-4"
                        disabled={disableForm}
                      />
                      <span className="ml-3">Verdadero</span>
                    </label>
                    <label className={`flex items-center p-3 rounded cursor-pointer ${disableForm ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600'}`}>
                      <input
                        type="radio"
                        name="answer"
                        value="Falso"
                        checked={userAnswer === 'Falso'}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="h-4 w-4"
                        disabled={disableForm}
                      />
                      <span className="ml-3">Falso</span>
                    </label>
                  </div>
                )}
                {currentQuestion.tipo === 'numeric' && (
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full p-2 bg-slate-700 rounded border border-slate-600"
                    disabled={disableForm}
                  />
                )}

                <button
                  type="submit"
                  className={`w-full font-bold py-2 px-4 rounded ${disableForm ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                  disabled={disableForm}
                >
                  Comprobar Respuesta
                </button>
              </form>

              {feedback && (
                <div className="mt-4 text-center">
                  <div className={`text-lg font-bold p-3 rounded ${feedback.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    <p>{feedback.isCorrect ? '¡Correcto!' : 'Incorrecto.'}</p>
                    {feedback.scoreAwarded !== undefined && (
                      <p>Puntos: <strong>{feedback.scoreAwarded}</strong></p>
                    )}
                    {!feedback.isCorrect && feedback.maxAttemptsReached && feedback.correctAnswer && (
                      <p className="text-sm mt-1">La respuesta correcta era: <strong>{feedback.correctAnswer}</strong></p>
                    )}
                    {!feedback.isCorrect && !feedback.maxAttemptsReached && (
                      <p className="text-sm mt-1">
                        {feedback.attemptsLeft === 1
                          ? "Te queda 1 intento."
                          : `Te quedan ${feedback.attemptsLeft} intentos.`}
                      </p>
                    )}
                    {!feedback.isCorrect && feedback.maxAttemptsReached && (
                      <p className="text-sm mt-1">Has agotado tus intentos para esta pregunta.</p>
                    )}
                    {feedback.error && <p className="text-sm mt-1 text-red-300">{feedback.error}</p>}
                  </div>

                  {!feedback.isCorrect && feedback.maxAttemptsReached && !isLastQuestion && (
                    <button
                      onClick={goToNextQuestion}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded"
                    >
                      Siguiente Nivel →
                    </button>
                  )}
                  {!feedback.isCorrect && feedback.maxAttemptsReached && isLastQuestion && (
                    <Link
                      to={`/mission/${missionId}`}
                      className="block w-full mt-4 bg-yellow-600 hover:bg-yellow-700 font-bold py-2 px-4 rounded"
                    >
                      ¡Misión Completada!
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionPage;
