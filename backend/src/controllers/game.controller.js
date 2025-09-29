const supabase = require('../config/supabaseClient');

// Número máximo de intentos por pregunta
const MAX_ATTEMPTS = 5;

// Calcula el puntaje según tipo, dificultad, intento y si es correcto
const calculateScore = (question, mission, attemptNumber, isCorrect) => {
  const difficulty = mission.dificultad;
  const questionType = question.tipo;

  const basePoints = {
    'true_false': { Fácil: 10, Medio: 15, Difícil: 20 },
    'multiple_option': { Fácil: 20, Medio: 30, Difícil: 40 },
    'numeric': { Fácil: 30, Medio: 45, Difícil: 60 }
  }[questionType]?.[difficulty];

  if (basePoints === undefined) {
    console.error(`Error: Base points not found for type ${questionType} and difficulty ${difficulty}`);
    return 0;
  }

  // Si la respuesta es incorrecta, no da puntos
  if (!isCorrect) {
    return 0;
  }

  // Si la respuesta es correcta, el puntaje depende del intento (máx 5)
  switch (attemptNumber) {
    case 1: return basePoints;
    case 2: return Math.round(basePoints * 0.8);
    case 3: return Math.round(basePoints * 0.6);
    case 4: return Math.round(basePoints * 0.4);
    case 5: return Math.round(basePoints * 0.2);
    default: return 0;
  }
};

// Procesa la respuesta enviada por el estudiante
const submitAnswer = async (req, res) => {
  try {
    const { question_id, mission_id, answer_given } = req.body;
    const student_id = req.user.id;

    // Traer pregunta y misión desde la base
    const { data: result, error: questionError } = await supabase
      .from('mission_questions')
      .select(`
        question:questions(*),
        mission:missions(dificultad)
      `)
      .eq('question_id', question_id)
      .eq('mission_id', mission_id)
      .single();

    if (questionError || !result) {
      console.error("Error fetching question:", questionError);
      return res.status(404).json({ error: 'Pregunta no encontrada en la misión.' });
    }

    const question = result.question;
    const missionDetails = { dificultad: result.mission.dificultad };
    
    // Contar intentos previos del estudiante
    const { count: previousAttempts } = await supabase
      .from('student_answers')
      .select('id', { count: 'exact' })
      .eq('student_id', student_id)
      .eq('question_id', question_id)
      .eq('mission_id', mission_id);

    const currentAttemptNumber = (previousAttempts ?? 0) + 1;

    // Comparar respuesta dada con la correcta
    const correctAnswer = String(question.respuesta_correcta).toLowerCase().trim();
    const isCorrect = String(answer_given).toLowerCase().trim() === correctAnswer;

    // Calcular puntaje ganado
    const score = calculateScore(question, missionDetails, currentAttemptNumber, isCorrect);

    // Guardar respuesta en la tabla student_answers
    await supabase.from('student_answers').insert({
      student_id,
      question_id: question.questions_id,
      mission_id,
      is_correct: isCorrect,
      score_awarded: score,
      attempt_number: currentAttemptNumber
    });

    // Actualizar puntaje total con función RPC
    await supabase.rpc('update_scores', {
      p_student_id: student_id,
      p_mission_id: mission_id,
      p_score_change: score
    });

    // Mostrar respuesta correcta solo si agotó intentos
    let responseCorrectAnswer = null;
    if (!isCorrect && currentAttemptNumber >= MAX_ATTEMPTS) {
      responseCorrectAnswer = question.respuesta_correcta;
    }

    console.log({
      currentAttemptNumber,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - currentAttemptNumber),
      MAX_ATTEMPTS
    });

    // Respuesta al frontend con estado actual
    res.status(200).json({
      isCorrect,
      scoreAwarded: score,
      correctAnswer: responseCorrectAnswer,
      attemptNumber: currentAttemptNumber,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - currentAttemptNumber),
      maxAttemptsReached: currentAttemptNumber >= MAX_ATTEMPTS
    });

  } catch (error) {
    console.error("Error detallado al procesar respuesta:", error);
    res.status(500).json({ error: 'Error inesperado en el servidor.' });
  }
};

// Restablece el progreso de la misión para un estudiante
const resetMissionProgress = async (req, res) => {
  try {
    const { mission_id } = req.body;
    const student_id = req.user.id;

    const { data, error } = await supabase.rpc('reset_mission_progress_v2', {
      student_id_input: student_id,
      mission_id_input: mission_id
    });

    if (error) throw error;
    res.status(200).json({ message: data });
  } catch (error) {
    console.error("Error detallado al restablecer la misión:", error);
    res.status(500).json({ error: 'Error inesperado en el servidor.' });
  }
};

module.exports = {
  submitAnswer,
  resetMissionProgress,
};
