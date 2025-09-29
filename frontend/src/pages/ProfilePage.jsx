import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfileAPI, updateProfileAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { uploadFile } from "../services/storage";

function ProfilePage() {
    // Contexto de autenticación para acceder al usuario y la función login
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

    // Limpiar el rol (algunos vienen con comillas en la BD)
  const cleanRole = user?.role?.replace(/'/g, '');
  const isProfesor = cleanRole === "Profesor";

    // Estado con los datos del perfil
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: '',
    bio: '',
    grade: '',
    institution: '',
    specialty: '',
    experience: ''
  });
    // Estado para manejar los cambios del formulario
  const [formData, setFormData] = useState({ ...profile });
    // Control de carga
  const [loading, setLoading] = useState(true);
    // Preview de imagen de perfil
  const [preview, setPreview] = useState('');
    // Mensajes de error o estado
  const [message, setMessage] = useState('');
   // Control para mostrar/ocultar popup de edición
  const [showEditPopup, setShowEditPopup] = useState(false);
    // Estado de éxito en la actualización
  const [showSuccess, setShowSuccess] = useState(false);

   //Cargar datos del perfil al montar el componente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfileAPI();
        setProfile(data);
        setPreview(data.avatar || '/default-avatar.png');
        if (login && !user) login(data);
      } catch (err) {
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [login, user]);

    // Abrir popup de edición con los datos actuales
  const handleEdit = () => {
    setFormData(profile);
    setPreview(profile.avatar || '/default-avatar.png');
    setShowEditPopup(true);
  };

    // Manejar cambios en inputs de texto
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

    // Manejar cambio de archivo (avatar)
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    // Subir al storage
    const publicUrl = await uploadFile(file);

    // Actualizar preview y formData con URL pública
    setPreview(publicUrl);

    setFormData((prev) => ({ ...prev, avatar: publicUrl }));
  } catch (err) {
    setMessage("Error al subir imagen: " + err.message);
  }
};

 // Guardar cambios del perfil
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setMessage('');
      // Avatar ya es la URL pública del storage
    const result = await updateProfileAPI(formData);

          // Si el backend devuelve el usuario actualizado, refrescar contexto
    if (result.user && login) login(result.user);
          // Actualizar perfil en estado local
    setProfile(result.user || formData);
          // Cerrar popup y mostrar confirmación
    setShowEditPopup(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  } catch (err) {
    setMessage(err.message);
  }
};

  // Volver a dashboard según el rol
  const goBack = () => {
    navigate(isProfesor ? '/professor' : '/student');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-900">
        <div className="w-96 h-96 bg-slate-700 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start py-12 px-4 bg-slate-900 text-white relative">
      {/* Notificación de éxito */}
      {showSuccess && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-8 py-4 rounded-3xl shadow-2xl text-xl font-bold animate-fadeInOut z-50">
          ¡Perfil guardado exitosamente!
        </div>
      )}

      <div className="w-full max-w-4xl p-10 rounded-3xl shadow-2xl bg-slate-800 relative">

        {/* Botón volver */}
        <button
          onClick={goBack}
          className="absolute top-6 left-6 flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-full shadow-md transition transform hover:scale-105"
        >
          <span>←</span>
          <span>Volver</span>
        </button>

        {/* Título */}
        <h1 className="text-4xl font-extrabold mb-6 text-center drop-shadow-lg">
          Mi Perfil
        </h1>

        {/* Mensaje de error */}
        {message && (
          <div className="mb-6 p-3 bg-red-500 text-white rounded-2xl text-center shadow-md">
            {message}
          </div>
        )}

        {/* Perfil en vista solo lectura */}
        <div className="flex flex-col items-center space-y-6 mb-8">
          <div className="relative">
            <img
              src={profile.avatar || '/default-avatar.png'}
              alt="avatar"
              className={`w-32 h-32 rounded-full object-cover border-4 ${isProfesor ? 'border-indigo-500' : 'border-yellow-400'} shadow-2xl`}
            />
          </div>

          {/* Barra de rol */}
          <div className="flex justify-center mb-2">
            {Array.from({ length: isProfesor ? 4 : 3 }).map((_, idx) => (
              <span
                key={idx}
                className={`w-4 h-4 rounded-full mx-1 shadow-md ${isProfesor ? 'bg-indigo-500' : 'bg-yellow-400'}`}
              ></span>
            ))}
          </div>

          <h2 className="text-2xl font-bold">{profile.name}</h2>
          <div className="text-center text-sm italic mb-2">{isProfesor ? 'Profesor' : 'Estudiante'}</div>

          {/* Bio con sombra suave */}
          {profile.bio && (
            <p className="text-center text-gray-200 italic px-6 py-2 rounded-2xl bg-slate-700 shadow-inner">
              {profile.bio}
            </p>
          )}

          {/* Info extra con hover */}
          <div className="flex space-x-6 mt-4">
            {!isProfesor && (
              <div className="bg-slate-700 rounded-lg px-6 py-3 shadow-md hover:shadow-xl transition transform hover:scale-105 text-center">
                <div className="font-bold text-yellow-400">{profile.grade || '—'}</div>
                <div className="text-sm">Semestre</div>
              </div>
            )}

          </div>

          <button
            onClick={handleEdit}
            className={`mt-6 ${isProfesor ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-yellow-400 hover:bg-yellow-500'} text-black font-bold px-6 py-2 rounded-2xl shadow-md transition transform hover:scale-105`}
          >
            Editar Perfil
          </button>
        </div>

        {/* Popup de edición */}
        {showEditPopup && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-slate-800 rounded-3xl p-8 w-full max-w-3xl relative">
              <h2 className="text-2xl font-bold mb-6 text-center">Editar Perfil</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={preview}
                      alt="avatar"
                      className={`w-28 h-28 rounded-full object-cover border-4 ${isProfesor ? 'border-indigo-500' : 'border-yellow-400'} shadow-md`}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className={`absolute bottom-0 right-0 ${isProfesor ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold px-3 py-1 rounded-full shadow-md`}
                    >
                      Cambiar
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-1">Nombre</label>
                    <input
                      name="name"
                      value={formData.name || ''}
                      onChange={handleFormChange}
                      className="w-full p-4 rounded-xl bg-slate-700 focus:ring-2 focus:ring-yellow-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Email</label>
                    <input
                      name="email"
                      value={formData.email || ''}
                      onChange={handleFormChange}
                      className="w-full p-4 rounded-xl bg-slate-700 focus:ring-2 focus:ring-yellow-400 transition"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1">Biografía</label>
                  <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleFormChange}
                    className="w-full p-4 rounded-xl bg-slate-700 focus:ring-2 focus:ring-yellow-400 transition"
                    rows="4"
                  />
                </div>

                {isProfesor ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm mb-1">Semestre</label>
                      <input
                        name="grade"
                        value={formData.grade || ''}
                        onChange={handleFormChange}
                        className="w-full p-4 rounded-xl bg-slate-700 focus:ring-2 focus:ring-yellow-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Institución</label>
                      <input
                        name="institution"
                        value={formData.institution || ''}
                        onChange={handleFormChange}
                        className="w-full p-4 rounded-xl bg-slate-700 focus:ring-2 focus:ring-yellow-400 transition"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditPopup(false)}
                    className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-2xl font-bold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-2xl font-bold transition ${isProfesor ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-yellow-400 hover:bg-yellow-500'}`}
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
