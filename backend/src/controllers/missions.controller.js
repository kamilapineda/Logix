const supabase = require('../config/supabaseClient');

const createMission = async (req, res) => {
  try {
    // 1. Obtenemos los datos de la misión Y un array con los IDs de las preguntas
    const { nombre, dificultad, question_ids } = req.body;
    const profesor_id = req.user.id;

    // --- PASO 1: Crear la misión en la tabla 'missions' ---
    const { data: missionData, error: missionError } = await supabase
      .from('missions')
      .insert([{ nombre, dificultad, profesor_id }])
      .select()
      .single(); // Obtenemos la misión recién creada
    
    console.log('RESULTADO DEL PASO 1:', { missionData, missionError });

    if (missionError) {
      throw missionError; // Si hay un error, detenemos todo
    }

    // --- PASO 2: Crear los enlaces en la tabla 'mission_questions' ---
    
    // Preparamos los datos para la tabla puente.
    // Por cada ID de pregunta, creamos un objeto { mission_id, question_id }
    const linksToCreate = question_ids.map(questionId => ({
      mission_id: missionData.mission_id,
      question_id: questionId,
    }));

    // Insertamos todos los enlaces de una vez
    const { error: linksError } = await supabase
      .from('mission_questions')
      .insert(linksToCreate);

    if (linksError) {
      throw linksError; // Si hay un error, detenemos todo
    }

    res.status(201).json({ message: 'Misión creada y preguntas asociadas con éxito', mission: missionData });

  } catch (error) {
    console.error('ERROR DETALLADO AL CREAR MISIÓN:', error);
    res.status(500).json({ error: error.message });
  }
};
const getMissions = async (req, res) => {
  try {
    const profesor_id = req.user.id;

    // Buscamos en la tabla 'missions' todas las filas donde 'profesor_id' coincida
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('profesor_id', profesor_id);

    if (error) {
      throw error;
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMissionDetails = async (req, res) => {
  try {
    const { id: missionId } = req.params;
    const student_id = req.user.id;

    // 1. Obtenemos los detalles de la misión y sus preguntas
    const { data: missionData, error: missionError } = await supabase
      .from('missions')
      .select(`
        *,
        mission_questions (
          questions (
            *
          )
        )
      `)
      .eq('mission_id', missionId)
      .single();

    if (missionError) throw missionError;
    if (!missionData) return res.status(404).json({ error: 'Misión no encontrada' });

    // 2. Buscamos el progreso de este estudiante en esta misión
    const { data: progressData, error: progressError } = await supabase
      .from('student_answers')
      .select('question_id')
      .eq('student_id', student_id)
      .eq('mission_id', missionId)
      .eq('is_correct', true);

    if (progressError) throw progressError;

    const correctlyAnsweredIds = progressData.map(p => p.question_id);

    // 3. Buscamos el puntaje total actual de la misión
    const { data: statusData, error: statusError } = await supabase
      .from('student_mission_status')
      .select('mission_score')
      .eq('student_id', student_id)
      .eq('mission_id', missionId)
      .single();

    if (statusError) throw statusError;

    // 4. Limpiamos los datos para el frontend
    const missionDetails = {
      ...missionData,
      questions: missionData.mission_questions.map(mq => mq.questions).filter(Boolean),
      progress: {
        correctlyAnsweredIds: correctlyAnsweredIds
      },
      mission_score: statusData?.mission_score ?? 0
    };

    delete missionDetails.mission_questions;

    // --- Ordenamos las preguntas por fecha de creación ---
    missionDetails.questions.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    res.json(missionDetails);

  } catch (error) {
    console.error("Error detallado al obtener detalles de la misión:", error);
    res.status(500).json({ error: 'Error inesperado en el servidor.' });
  }
};

module.exports = {
  createMission,
  getMissions,
  getMissionDetails
};