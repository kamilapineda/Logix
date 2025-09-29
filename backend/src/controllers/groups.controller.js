const supabase = require('../config/supabaseClient');

// Crear un nuevo grupo con código aleatorio
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const profesor_id = req.user.id; 

    // Generamos un código único de 6 caracteres
    const join_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Inserta el grupo en la base de datos
    const { data, error } = await supabase
      .from('groups')
      .insert([{ name, profesor_id, join_code }])
      .select()
      .single(); // Usamos .single() para obtener un objeto, no un array

    if (error) {
      throw error;
    }
    res.status(201).json({ message: 'Grupo creado con éxito', group: data });
  } catch (error) {
    console.error('Error detallado al crear grupo:', error); 
    res.status(500).json({ error: error.message });
  }
};

// Función para obtener todos los grupos de un profesor
const getGroups = async (req, res) => {
  try {
    const profesor_id = req.user.id;

    // Busca los grupos que pertenecen al profesor
    const { data, error } = await supabase
      .from('groups')
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

// Añadir un estudiante a un grupo
const addStudentToGroup = async (req, res) => {
  try {
    const { email, group_id } = req.body;

    // Busca el estudiante en la tabla users
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    // Si no encontramos al estudiante, enviamos un error
    if (studentError || !student) {
      return res.status(404).json({ error: 'No se encontró un estudiante con ese email.' });
    }

    const student_id = student.id;

    // Inserta la relación en student_groups
    const { data, error } = await supabase
      .from('student_groups')
      .insert([{ student_id, group_id }])
      .select();
      
    if (error) {
      if (error.code === '23505') { // Alumno ya inscrito
        return res.status(409).json({ error: 'Este estudiante ya pertenece a este grupo.' });
      }
      throw error;
    }

    res.status(201).json({ message: 'Estudiante añadido al grupo con éxito.' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Función para que un estudiante se una a un grupo con un código
const joinGroup = async (req, res) => {
  try {
    const { join_code } = req.body;
    const student_id = req.user.id;

    // Busca el grupo por join_code
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('groups_id') // Solo necesitamos su ID
      .eq('join_code', join_code)
      .single();

    // Si no se encuentra el grupo, enviamos un error
    if (groupError || !group) {
      return res.status(404).json({ error: 'Código de grupo no válido o no encontrado.' });
    }

    const group_id = group.groups_id;

    // Inserta relación en student_groups
    const { error: insertError } = await supabase
      .from('student_groups')
      .insert([{ student_id, group_id }]);
      
    if (insertError) {
      if (insertError.code === '23505') { // Estudiante ya inscrito
        return res.status(409).json({ error: 'Ya perteneces a este grupo.' });
      }
      throw insertError;
    }

    res.status(200).json({ message: '¡Te has unido al grupo con éxito!' });

  } catch (error) {
    console.error("Error detallado al unirse al grupo:", error);
    res.status(500).json({ error: 'Error inesperado en el servidor.' });
  }
};

// Actualizar el nombre de un grupo
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params; // id del grupo
    const { name } = req.body;
    const profesor_id = req.user.id;

    // Actualiza el grupo si pertenece al profesor
    const { data, error } = await supabase
      .from('groups')
      .update({ name })
      .eq('groups_id', id) 
      .eq('profesor_id', profesor_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Grupo actualizado con éxito', group: data });
  } catch (error) {
    console.error('Error al actualizar grupo:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un grupo del profesor
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const profesor_id = req.user.id;

    // Elimina el grupo si pertenece al profesor
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('groups_id', id)
      .eq('profesor_id', profesor_id);

    if (error) throw error;

    res.json({ message: 'Grupo eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    res.status(500).json({ error: error.message });
  }
};

// Exporta todas las funciones de grupos
module.exports = {
  createGroup,
  getGroups,
  addStudentToGroup,
  joinGroup,
  updateGroup,
  deleteGroup
};

