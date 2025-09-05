const supabase = require('../config/supabaseClient');

// Función para crear una nueva pregunta (ya la tienes)
const createQuestion = async (req, res) => {
  try {
    const { titulo, enunciado, tipo, opciones, respuesta_correcta } = req.body;
    const profesor_id = req.user.id;
    const { data, error } = await supabase
      .from('questions')
      .insert([{ titulo, enunciado, tipo, opciones, respuesta_correcta, profesor_id }])
      .select()
      .single();

    if (error) {
      console.error('Error de Supabase:', error);
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json({ message: 'Pregunta creada con éxito', question: data });
  } catch (error) {
    res.status(500).json({ error: 'Error inesperado en el servidor' });
  }
};

// --- ¡NUEVA FUNCIÓN! ---
// Función para obtener todas las preguntas de un profesor
const getQuestions = async (req, res) => {
  try {
    const profesor_id = req.user.id;

    // Buscamos en la tabla 'questions' todas las filas donde 'profesor_id' coincida
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('profesor_id', profesor_id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: 'Error inesperado en el servidor' });
  }
};

// Exportamos AMBAS funciones
module.exports = {
  createQuestion,
  getQuestions, // <-- Añade esta
};