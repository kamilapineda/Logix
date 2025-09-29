const supabase = require('../config/supabaseClient');

// Obtener perfil del usuario logueado
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar datos del usuario por id
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, avatar, bio, grade, institution')
      .eq('id', userId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error getProfile:', err);
    res.status(500).json({ error: err.message || 'Error al obtener perfil.' });
  }
};

// Actualizar perfil del usuario logueado
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, avatar, bio, grade, institution } = req.body;

    // Verificar si el nuevo email ya está en uso
    if (email) {
      const { data: existingUsers, error: exErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', email);

      if (exErr) throw exErr;
      if (existingUsers && existingUsers.length > 0 && existingUsers[0].id !== userId) {
        return res.status(409).json({ error: 'El email ya está en uso por otro usuario.' });
      }
    }

    // Crear objeto con campos a actualizar
    const updateObj = { name, email, avatar, bio, grade, institution };
    Object.keys(updateObj).forEach(k => updateObj[k] === undefined && delete updateObj[k]);

    const { data, error } = await supabase
      .from('users')
      .update(updateObj)
      .eq('id', userId)
      .select('id, name, email, role, avatar, bio, grade, institution')
      .single();

    if (error) throw error;
    res.json({ message: 'Perfil actualizado', user: data });
  } catch (err) {
    console.error('Error updateProfile:', err);
    res.status(500).json({ error: err.message || 'Error al actualizar perfil.' });
  }
};

module.exports = { getProfile, updateProfile };
