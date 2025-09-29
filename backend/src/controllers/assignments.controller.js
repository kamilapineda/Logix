// Importamos el cliente de Supabase configurado
const supabase = require('../config/supabaseClient');

//Asignar una misión a un grupo
const assignMissionToGroup = async (req, res) => {
  try {
    // Obtenemos el ID de la misión y del grupo desde el cuerpo de la petición
    const { mission_id, group_id } = req.body;

    // Insertamos la relación misión-grupo en la tabla intermedia
    const { data, error } = await supabase
      .from('mission_assignments')
      .insert([{ mission_id, group_id }])
      .select();

    if (error) {
      // Si la misión ya estaba asignada, devolvemos un conflicto (409)
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Esta misión ya ha sido asignada a este grupo.' });
      }
      throw error;
    }

    //Respuesta exitosa con los datos insertados
    res.status(201).json({ message: 'Misión asignada con éxito', assignment: data });

  } catch (error) {
    // Error genérico del servidor
    res.status(500).json({ error: error.message });
  }
};

// Función para obtener todas las asignaciones de un profesor
const getAssignments = async (req, res) => {
  try {
    const profesor_id = req.user.id;

    // Consulta con relaciones:
    // - Tomamos datos de "mission_assignments"
    // - Incluimos el nombre de la misión y del grupo relacionado
    // - Filtramos solo las misiones del profesor en sesión
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

// Editar una asignación
const updateAssignment = async (req, res) => {
  try {
    const { mission_id, group_id } = req.params; // Identificadores actuales
    const { new_mission_id, new_group_id } = req.body; // Nuevos valores
    const profesor_id = req.user.id;

    // Validar que la misión actual pertenezca al profesor
    const { data: mission, error: missionError } = await supabase
      .from('missions')
      .select('mission_id')
      .eq('mission_id', mission_id)
      .eq('profesor_id', profesor_id)
      .single();

    if (missionError || !mission) {
      return res.status(403).json({ error: 'No autorizado para editar esta asignación.' });
    }

    // Actualizar la asignación
    const { data, error } = await supabase
      .from('mission_assignments')
      .update({
        mission_id: new_mission_id || mission_id,
        group_id: new_group_id || group_id
      })
      .eq('mission_id', mission_id)
      .eq('group_id', group_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Asignación actualizada con éxito', assignment: data });
  } catch (error) {
    console.error("Error al actualizar asignación:", error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar una asignación
const deleteAssignment = async (req, res) => {
  try {
    const { mission_id, group_id } = req.params;
    const profesor_id = req.user.id;

    // Verificar que la misión pertenezca al profesor
    const { data: mission, error: missionError } = await supabase
      .from('missions')
      .select('mission_id')
      .eq('mission_id', mission_id)
      .eq('profesor_id', profesor_id)
      .single();

    if (missionError || !mission) {
      return res.status(403).json({ error: 'No autorizado para eliminar esta asignación.' });
    }

    // Eliminamos la relación misión-grupo
    const { error } = await supabase
      .from('mission_assignments')
      .delete()
      .eq('mission_id', mission_id)
      .eq('group_id', group_id);

    if (error) throw error;

    res.json({ message: 'Asignación eliminada con éxito' });
  } catch (error) {
    console.error("Error al eliminar asignación:", error);
    res.status(500).json({ error: error.message });
  }
};

// Exportamos todas las funciones del controlador
module.exports = {
  assignMissionToGroup,
  getAssignments,
  updateAssignment,
  deleteAssignment
};