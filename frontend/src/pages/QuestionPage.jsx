import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMissionDetailsAPI, submitAnswerAPI } from "../services/api";


function QuestionPage() {
  const { missionId, questionIndex } = useParams(); // ID misión y número de pregunta
  const navigate = useNavigate();

    // Estados principales
  const [mission, setMission] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(1);

    //Cargar misión y progreso del estudiante
  useEffect(() => {
    const fetchMission = async () => {
      try {
        setLoading(true);
        const data = await getMissionDetailsAPI(missionId);
        setMission(data);

        // Resetear estados de cada pregunta
        setFeedback(null);
        setUserAnswer("");

        const currentQuestion = data.questions[questionIndex];
        if (currentQuestion) {
          const questionId = currentQuestion.id || currentQuestion.questions_id;
          // Verificar si ya la había respondido bien antes
          const isCorrectlyAnsweredBefore =
            data.progress.correctlyAnsweredIds.includes(questionId);
          setHasAnsweredCorrectly(isCorrectlyAnsweredBefore);
          // Contar intentos previos
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
  //Enviar respuesta al backend
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    const currentQuestion = mission.questions[questionIndex];
    if (!userAnswer && currentQuestion.tipo !== "numeric") return;

    const questionId = currentQuestion.id || currentQuestion.questions_id;

    try {
      const result = await submitAnswerAPI({
        mission_id: missionId,
        question_id: questionId,
        answer_given: userAnswer,
        attempt_number: currentAttempt,
      });

      setFeedback(result);
      if (result.isCorrect) setHasAnsweredCorrectly(true);
      else setCurrentAttempt((prev) => prev + 1);

      setUserAnswer("");
    } catch (err) {
      setFeedback({
        isCorrect: false,
        scoreAwarded: 0,
        correctAnswer: null,
        maxAttemptsReached: false,
        error: `Error: ${err.message}`,
      });
    }
  };
  //Ir a la siguiente pregunta
  const goToNextQuestion = () => {
    const nextIndex = Number(questionIndex) + 1;
    if (mission && nextIndex < mission.questions.length) {
      navigate(`/mission/${missionId}/question/${nextIndex}`);
    }
  };

  if (loading)
    return (
      <div className="bg-slate-900 min-h-screen text-white p-8 flex flex-col items-center">
        <div className="w-full max-w-2xl animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/5"></div>
          <div className="h-6 bg-slate-700 rounded w-3/4"></div>
          <div className="h-20 bg-slate-700 rounded"></div>
          <div className="space-y-3">
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
          </div>
          <div className="h-12 bg-slate-700 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );

  if (error)
    return <div className="text-red-500 text-center p-10">{error}</div>;
  if (!mission)
    return (
      <div className="text-white text-center p-10">Pregunta no encontrada.</div>
    );

  const currentQuestion = mission.questions[questionIndex];
  if (!currentQuestion)
    return (
      <div className="text-white text-center p-10">Pregunta no válida.</div>
    );

  const isLastQuestion =
    Number(questionIndex) === mission.questions.length - 1;
  // Form deshabilitado si ya la respondió o agotó intentos
  const disableForm =
    hasAnsweredCorrectly ||
    (feedback && !feedback.isCorrect && feedback.maxAttemptsReached);

  return (
    <div className="bg-slate-900 min-h-screen text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl mx-auto">
        <Link
          to={`/mission/${missionId}`}
          className="text-cyan-400 hover:underline font-semibold"
        >
          ← Volver a los niveles
        </Link>

         <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl mt-4 space-y-6">
          <p className="text-slate-400 font-semibold">
            Nivel {Number(questionIndex) + 1}
          </p>
          <h2 className="text-3xl font-bold">{currentQuestion.titulo}</h2>
       
        {/* Enunciado extendido */}
        {currentQuestion.question_content &&
          Array.isArray(currentQuestion.question_content) &&
          currentQuestion.question_content.length > 0 && (
            <div className="space-y-4 mt-4">
              {currentQuestion.question_content.map((block, i) => (
                <div key={i}>
                  {block.type === "text" ? (
                    <p className="text-slate-200 text-base leading-relaxed whitespace-pre-line">
                      {block.content}
                    </p>
                  ) : (
                    <img
                      src={block.content}
                      alt={`enunciado-${i}`}
                      className="rounded-lg max-h-80 mx-auto shadow-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          )}


          <p className="text-lg text-slate-300 font-semibold">{currentQuestion.enunciado}</p>

          {hasAnsweredCorrectly ? (
            <div className="bg-green-500/20 border border-green-500 p-5 rounded-2xl text-center space-y-3">
              <p className="text-green-300 font-semibold">
                ¡Respondiste correctamente!
              </p>
              {feedback?.scoreAwarded !== undefined && (
                <p>
                  Puntos obtenidos: <strong>{feedback.scoreAwarded}</strong>
                </p>
              )}

              {isLastQuestion ? (
                <Link
                  to={`/mission/${missionId}`}
                  className="block w-full mt-4 bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded-2xl transition-all"
                >
                  ¡Misión Completada!
                </Link>
              ) : (
                <button
                  onClick={goToNextQuestion}
                  className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 font-bold py-2 px-4 rounded-2xl transition-all"
                >
                  Siguiente Nivel →
                </button>
              )}
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
  {currentQuestion.tipo === "multiple_option" && (
  <div className="grid grid-cols-2 gap-4">
    {currentQuestion.opciones.map((option, index) => (
      <label
        key={index}
        className={`flex flex-col items-center p-3 rounded-2xl cursor-pointer border transition-all
          ${
            disableForm
              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
              : userAnswer === option.content
              ? "bg-cyan-600 border-cyan-400 shadow-lg"   // resaltado cuando está seleccionada
              : "bg-slate-700 hover:bg-slate-700/80 shadow-md"
          }`}
      >
        <input
          type="radio"
          name="answer"
          value={option.content}
          checked={userAnswer === option.content}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="hidden"
          disabled={disableForm}
        />
        {option.type === "image" ? (
         <img
    src={option.content}   
    alt={`opción ${index}`}
    className="rounded-lg object-contain max-h-40"
  />
        ) : (
          <span className="mt-2">{option.content}</span>
        )}
      </label>
    ))}
  </div>
)}

                {currentQuestion.tipo === "true_false" && (
                  <div className="space-y-2">
                    {["Verdadero", "Falso"].map((val) => (
                      <label
                        key={val}
                        className={`flex items-center p-3 rounded-2xl cursor-pointer ${
                          disableForm
                            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                            : "bg-slate-700 hover:bg-slate-700/80 shadow-md transition-all"
                        }`}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={val}
                          checked={userAnswer === val}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          className="h-4 w-4 accent-cyan-400"
                          disabled={disableForm}
                        />
                        <span className="ml-3">{val}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.tipo === "numeric" && (
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full p-3 bg-slate-700 rounded-2xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    disabled={disableForm}
                  />
                )}

                <button
                  type="submit"
                  className={`w-full font-bold py-3 px-4 rounded-2xl transition-all ${
                    disableForm
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-cyan-500 hover:bg-cyan-600"
                  }`}
                  disabled={disableForm}
                >
                  Comprobar Respuesta
                </button>
              </form>

              {feedback && (
                <div className="mt-4 text-center space-y-2">
                  <div
                    className={`text-lg font-bold p-4 rounded-2xl ${
                      feedback.isCorrect
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    } transition-all`}
                  >
                    <p>{feedback.isCorrect ? "¡Correcto!" : "Incorrecto."}</p>
                    {feedback.scoreAwarded !== undefined && (
                      <p>
                        Puntos: <strong>{feedback.scoreAwarded}</strong>
                      </p>
                    )}
                    {!feedback.isCorrect &&
                      feedback.maxAttemptsReached &&
                      feedback.correctAnswer && (
                        <p className="text-sm mt-1">
                          La respuesta correcta era:{" "}
                          <strong>{feedback.correctAnswer}</strong>
                        </p>
                      )}
                    {!feedback.isCorrect &&
                      !feedback.maxAttemptsReached && (
                        <p className="text-sm mt-1">
                          {feedback.attemptsLeft === 1
                            ? "Te queda 1 intento."
                            : `Te quedan ${feedback.attemptsLeft} intentos.`}
                        </p>
                      )}
                    {!feedback.isCorrect &&
                      feedback.maxAttemptsReached && (
                        <p className="text-sm mt-1">
                          Has agotado tus intentos para esta pregunta.
                        </p>
                      )}
                    {feedback.error && (
                      <p className="text-sm mt-1 text-red-300">
                        {feedback.error}
                      </p>
                    )}
                  </div>

                  {!feedback.isCorrect &&
                    feedback.maxAttemptsReached &&
                    !isLastQuestion && (
                      <button
                        onClick={goToNextQuestion}
                        className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 font-bold py-2 px-4 rounded-2xl transition-all"
                      >
                        Siguiente Nivel →
                      </button>
                    )}
                  {!feedback.isCorrect &&
                    feedback.maxAttemptsReached &&
                    isLastQuestion && (
                      <Link
                        to={`/mission/${missionId}`}
                        className="block w-full mt-4 bg-cyan-600 hover:bg-cyan-700 font-bold py-2 px-4 rounded-2xl transition-all"
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
