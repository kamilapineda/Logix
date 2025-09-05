const supabase = require('../config/supabaseClient');

// Función para obtener los grupos y misiones de un estudiante
const getMyMissions = async (req, res) => {
  try {
    // Obtenemos el ID del estudiante que ha iniciado sesión
    const student_id = req.user.id;

    // Esta es la consulta mágica. Le decimos a Supabase:
    // 1. Empieza en la tabla 'student_groups' y busca las filas de este estudiante.
    // 2. Por cada fila, no me des los IDs, en su lugar, "salta" a la tabla 'groups'
    //    y tráeme TODA la información de ese grupo (*).
    // 3. Y ADEMÁS, para ese grupo, "salta" a 'mission_assignments' y de ahí
    //    a 'missions' y tráeme TODA la información de las misiones asignadas.
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

    // El resultado viene un poco anidado, así que lo limpiamos para que el frontend lo tenga más fácil
    const structuredData = data.map(item => {
      if (!item.groups) return null; // Filtra en caso de datos inconsistentes
      
      const group = item.groups;
      // Extraemos solo las misiones del interior de la estructura
      const missions = group.mission_assignments.map(ma => ma.missions).filter(Boolean); // filter(Boolean) quita posibles nulos
      
      return {
        // Devolvemos una copia de la información del grupo
        ...group,
        // Y le añadimos una propiedad 'missions' que es una lista limpia
        missions: missions 
      };
    }).filter(Boolean); // Quita cualquier grupo nulo del resultado final

    res.json(structuredData);

  } catch (error) {
    console.error("Error detallado al obtener misiones del estudiante:", error);
    res.status(500).json({ error: 'Error inesperado en el servidor.' });
  }
};

module.exports = {
  getMyMissions,
};