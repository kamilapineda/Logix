const supabase = require('../config/supabaseClient');

const assignMissionToGroup = async (req, res) => {
  try {
    // Obtenemos el ID de la misión y del grupo desde el cuerpo de la petición
    const { mission_id, group_id } = req.body;

    // Insertamos la nueva asignación en la tabla puente
    const { data, error } = await supabase
      .from('mission_assignments')
      .insert([{ mission_id, group_id }])
      .select();

    if (error) {
      // Manejo de errores comunes, como intentar asignar la misma misión dos veces
      if (error.code === '23505') { // Código de error para 'unique constraint violation'
        return res.status(409).json({ error: 'Esta misión ya ha sido asignada a este grupo.' });
      }
      throw error;
    }

    res.status(201).json({ message: 'Misión asignada con éxito', assignment: data });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Función para obtener todas las asignaciones de un profesor
const getAssignments = async (req, res) => {
  try {
    const profesor_id = req.user.id;

    // Esta es la consulta especial. Le decimos a Supabase:
    // 1. Desde la tabla 'mission_assignments'...
    // 2. Tráeme el 'nombre' de la tabla 'missions' conectada...
    // 3. ...y el 'name' de la tabla 'groups' conectada.
    // 4. Pero solo donde la misión pertenezca al profesor que hace la petición.
    const { data, error } = await supabase
      .from('mission_assignments')
      .select(`
        mission_id,
        group_id,
        missions ( nombre ),
        groups ( name )
      `)
      .eq('missions.profesor_id', profesor_id);

    if (error) {
      throw error;
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Exportamos AMBAS funciones
module.exports = {
  assignMissionToGroup,
  getAssignments,
};