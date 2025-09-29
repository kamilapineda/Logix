const supabase = require('../config/supabaseClient');

// Obtener grupos y misiones de un estudiante
const getMyMissions = async (req, res) => {
  try {
    // ID del estudiante autenticado
    const student_id = req.user.id;

// Consultar grupos del estudiante con sus misiones
    const { data, error } = await supabase
      .from('student_groups')
      .select(`
        groups (
          *,
          mission_assignments (
            missions (
              *
            )
          )
        )
      `)
      .eq('student_id', student_id);

    if (error) {
      throw error;
    }

    // Reestructurar datos para el frontend
    const structuredData = data.map(item => {
      if (!item.groups) return null; // Filtra en caso de datos inconsistentes
      
      const group = item.groups;
      const missions = group.mission_assignments.map(ma => ma.missions).filter(Boolean); // filter(Boolean) quita posibles nulos
      
      return {
        // Devolvemos una copia de la información del grupo
        ...group,
        // Y le añadimos una propiedad 'missions' que es una lista limpia
        missions: missions 
      };
    }).filter(Boolean); 

    res.json(structuredData);

  } catch (error) {
    console.error("Error detallado al obtener misiones del estudiante:", error);
    res.status(500).json({ error: 'Error inesperado en el servidor.' });
  }
};

module.exports = {
  getMyMissions,
};