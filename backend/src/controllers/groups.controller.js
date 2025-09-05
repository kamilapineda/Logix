const supabase = require('../config/supabaseClient');

// Función para crear un nuevo grupo 
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const profesor_id = req.user.id; 

    // Generamos un código aleatorio de 6 caracteres
    const join_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase
      .from('groups')
      // Añadimos el join_code al objeto que insertamos
      .insert([{ name, profesor_id, join_code }])
      .select()
      .single(); // Usamos .single() para obtener un objeto, no un array

    if (error) {
      throw error;
    }
    res.status(201).json({ message: 'Grupo creado con éxito', group: data });
  } catch (error) {
    // Añadimos un console.error para ver el detalle en nuestra terminal
    console.error('Error detallado al crear grupo:', error); 
    res.status(500).json({ error: error.message });
  }
};

// Función para obtener todos los grupos de un profesor
const getGroups = async (req, res) => {
  try {
    // Obtenemos el ID del profesor que está haciendo la petición
    const profesor_id = req.user.id;

    // Buscamos en la tabla 'groups' todas las filas donde 'profesor_id' coincida
    const { data, error } = await supabase
      .from('groups')
      .select('*') // Queremos toda la información de los grupos
      .eq('profesor_id', profesor_id); // El criterio de búsqueda

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Enviamos la lista de grupos encontrados
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: 'Error inesperado en el servidor' });
  }
};

const addStudentToGroup = async (req, res) => {
  try {
    // Obtenemos el email del estudiante y el ID del grupo
    const { email, group_id } = req.body;

    // 1. Buscamos al usuario (estudiante) por su email
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

    // 2. Creamos el enlace en la tabla 'student_groups'
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
    // Obtenemos el código del cuerpo de la petición
    const { join_code } = req.body;
    // Obtenemos el ID del estudiante que está logueado
    const student_id = req.user.id;

    // 1. Buscamos el grupo que tenga ese código de invitación
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

    // 2. Creamos el enlace en la tabla 'student_groups'
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

// Exportamos AMBAS funciones
module.exports = {
  createGroup,
  getGroups,
  addStudentToGroup,
  joinGroup,
};

