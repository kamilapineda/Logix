const supabase = require('../config/supabaseClient');

//Crear misión
const createMission = async (req, res) => {
  try {
    // Datos de la misión y preguntas desde el body
    const { nombre, dificultad, description, question_ids } = req.body;
    const profesor_id = req.user.id;

    // Insertar misión en la tabla 'missions'
    const { data: missionData, error: missionError } = await supabase
      .from('missions')
      .insert([{ nombre, dificultad, description, profesor_id }])
      .select()
      .single();
    
    console.log('RESULTADO DEL PASO 1:', { missionData, missionError });

    if (missionError) {
      throw missionError; // Si hay un error, detenemos todo
    }

    // Crear relaciones misión-preguntas
    const linksToCreate = question_ids.map(questionId => ({
      mission_id: missionData.mission_id,
      question_id: questionId,
    }));

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

// Obtener todas las misiones de un profesor
const getMissions = async (req, res) => {
  try {
    const profesor_id = req.user.id;

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

// Obtener detalles de una misión
const getMissionDetails = async (req, res) => {
  try {
    const { id: missionId } = req.params;
    const student_id = req.user.id;

    // Detalles de la misión con sus preguntas
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
      .maybeSingle(); 

    if (missionError) throw missionError;
    if (!missionData) return res.status(404).json({ error: 'Misión no encontrada' });

    // Respuestas correctas del estudiante
    const { data: progressData, error: progressError } = await supabase
      .from('student_answers')
      .select('question_id')
      .eq('student_id', student_id)
      .eq('mission_id', missionId)
      .eq('is_correct', true);

    if (progressError) throw progressError;

    const correctlyAnsweredIds = progressData.map(p => p.question_id);

    // Puntaje de la misión
    const { data: statusData, error: statusError } = await supabase
      .from('student_mission_status')
      .select('mission_score')
      .eq('student_id', student_id)
      .eq('mission_id', missionId)
      .maybeSingle();

    if (statusError) throw statusError;

    const missionScore = statusData?.mission_score ?? 0; 

    // Armar objeto final para el frontend
    const missionDetails = {
      ...missionData,
      questions: (missionData.mission_questions || []).map(mq => mq.questions).filter(Boolean),
      progress: {
        correctlyAnsweredIds
      },
      mission_score: missionScore
    };

    delete missionDetails.mission_questions;

    // Ordenar preguntas por fecha
    missionDetails.questions.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    res.json(missionDetails);

  } catch (error) {
    console.error("Error detallado al obtener detalles de la misión:", error);
    res.status(500).json({ error: 'Error inesperado en el servidor.' });
  }
};

// Actualizar misión
const updateMission = async (req, res) => {
  try {
    const { id } = req.params; // mission_id
    const { nombre, dificultad, description, question_ids } = req.body;
    const profesor_id = req.user.id;

    // Actualizar datos de la misión
    const { data: mission, error } = await supabase
      .from('missions')
      .update({ nombre, description, dificultad })
      .eq('mission_id', id)
      .eq('profesor_id', profesor_id)
      .select()
      .single();

    if (error) throw error;

    // Si mandan preguntas, actualizamos la tabla puente
    if (Array.isArray(question_ids)) {
      // Borrar relaciones anteriores
      await supabase.from('mission_questions').delete().eq('mission_id', id);

      if (question_ids.length > 0) {
        const linksToCreate = question_ids.map(q => ({
          mission_id: id,
          question_id: q,
        }));
        await supabase.from('mission_questions').insert(linksToCreate);
      }
    }

    res.json({ message: 'Misión actualizada con éxito', mission });
  } catch (error) {
    console.error("Error al actualizar misión:", error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar misión
const deleteMission = async (req, res) => {
  try {
    const { id } = req.params;
    const profesor_id = req.user.id;

    // Borrar relaciones de preguntas
    await supabase.from('mission_questions').delete().eq('mission_id', id);

    // Borrar misión
    const { error } = await supabase
      .from('missions')
      .delete()
      .eq('mission_id', id)
      .eq('profesor_id', profesor_id);

    if (error) throw error;

    res.json({ message: 'Misión eliminada con éxito' });
  } catch (error) {
    console.error("Error al eliminar misión:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createMission,
  getMissions,
  getMissionDetails,
  updateMission,
  deleteMission
};