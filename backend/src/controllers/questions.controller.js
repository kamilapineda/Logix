const supabase = require('../config/supabaseClient');

// Crear una pregunta
const createQuestion = async (req, res) => {
  try {
    const { enunciado, titulo, tipo, opciones, respuesta_correcta, pillar, question_content } = req.body;
    const profesor_id = req.user.id;

    // Validar que estén los campos requeridos
    if ((!enunciado && !question_content) || !opciones || !respuesta_correcta) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Asegurar que opciones y question_content sean JSON válidos
    const opcionesJson = typeof opciones === 'string' ? JSON.parse(opciones) : opciones;
    const contentJson = question_content
      ? (typeof question_content === 'string' ? JSON.parse(question_content) : question_content)
      : null;

    // Insertar la pregunta en la base de datos
    const { data, error } = await supabase
      .from('questions')
      .insert([{
        enunciado,           
        titulo,
        tipo,
        opciones: opcionesJson,
        respuesta_correcta,
        pillar,
        question_content: contentJson,
        profesor_id
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("createQuestion error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener todas las preguntas del profesor logueado
const getQuestions = async (req, res) => {
  try {
    const profesor_id = req.user.id;

    // Buscar preguntas del profesor
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('profesor_id', profesor_id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar una pregunta existente
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { enunciado, titulo, tipo, opciones, respuesta_correcta, pillar, question_content } = req.body;

    // Asegurar que opciones y question_content sean JSON válidos
    const opcionesJson = typeof opciones === 'string' ? JSON.parse(opciones) : opciones;
    const contentJson = question_content
      ? (typeof question_content === 'string' ? JSON.parse(question_content) : question_content)
      : null;

      // Actualizar la pregunta en la base de datos
    const { data, error } = await supabase
      .from('questions')
      .update({
        enunciado,
        titulo,
        tipo,
        opciones: opcionesJson,
        respuesta_correcta,
        pillar,
        question_content: contentJson
      })
      .eq('questions_id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("updateQuestion error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Eliminar una pregunta
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // Borrar la pregunta por id
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('questions_id', id);

    if (error) throw error;
    res.json({ message: "Pregunta eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createQuestion, getQuestions, updateQuestion, deleteQuestion };
