// La URL base de nuestro backend
const BASE_URL =  '/api';

// Función para crear un nuevo grupo
export const createGroupAPI = async (groupData) => {

  //Hacemos la petición fetch, pero esta vez...
  const response = await fetch(`${BASE_URL}/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(groupData)
  });

  if (!response.ok) {
    // Si la respuesta no es exitosa, lanzamos un error
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo crear el grupo');
  }

  // Devolvemos los datos si todo fue bien
  return response.json();

};

// Función para obtener los grupos de un profesor
export const getGroupsAPI = async () => {

  const response = await fetch(`${BASE_URL}/groups`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo obtener la lista de grupos');
  }

  return response.json();
};

//Editar un grupo
export const updateGroupAPI = async (id, data) => {

  const response = await fetch(`${BASE_URL}/groups/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
     
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo actualizar el grupo');
  }
  return response.json();
};

//Eliminar un grupo (con cookie httpOnly)
export const deleteGroupAPI = async (id) => {
  const response = await fetch(`${BASE_URL}/groups/${id}`, {
    method: 'DELETE',
    credentials: 'include', // 👈 manda la cookie automáticamente
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo eliminar el grupo');
  }

  return response.json();
};


//Función para crear una nueva pregunta (con cookie httpOnly)
export const createQuestionAPI = async (questionData) => {
  const response = await fetch(`${BASE_URL}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // 
    body: JSON.stringify(questionData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo crear la pregunta');
  }

  return response.json();
};

// Función para obtener las preguntas de un profesor (con cookie httpOnly)
export const getQuestionsAPI = async () => {
  const response = await fetch(`${BASE_URL}/questions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include' 
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo obtener la lista de preguntas');
  }

  return response.json();
};

// Editar pregunta (usa cookie httpOnly)
export const updateQuestionAPI = async (id, data) => {
  const response = await fetch(`${BASE_URL}/questions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', 
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo actualizar la pregunta');
  }

  return response.json();
};

// Eliminar pregunta (usa cookie httpOnly)
export const deleteQuestionAPI = async (id) => {
  const response = await fetch(`${BASE_URL}/questions/${id}`, {
    method: 'DELETE',
    credentials: 'include', 
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo eliminar la pregunta');
  }

  return response.json();
};


// Crear una nueva misión (usa cookie httpOnly)
export const createMissionAPI = async (missionData) => {

  const response = await fetch(`${BASE_URL}/missions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify(missionData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo crear la misión');
  }

  return response.json();
};

// Obtener las misiones de un profesor (usa cookie httpOnly)
export const getMissionsAPI = async () => {
  const response = await fetch(`${BASE_URL}/missions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo obtener la lista de misiones');
  }

  return response.json();
};

// Editar misión (usa cookie httpOnly)
export const updateMissionAPI = async (id, data) => {
  const response = await fetch(`${BASE_URL}/missions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo actualizar la misión');
  }

  return response.json();
};


//Eliminar misión (usa cookie httpOnly)
export const deleteMissionAPI = async (id) => {
  const response = await fetch(`${BASE_URL}/missions/${id}`, {
    method: 'DELETE',
    credentials: 'include', 
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo eliminar la misión');
  }

  return response.json();
};

// Función para asignar una misión a un grupo
export const assignMissionAPI = async (assignmentData) => {
  // assignmentData será un objeto como: { mission_id: 1, group_id: 2 }
  const response = await fetch(`${BASE_URL}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(assignmentData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo asignar la misión');
  }

  return response.json();
};

// Función para obtener las asignaciones de un profesor
export const getAssignmentsAPI = async () => {
  const response = await fetch(`${BASE_URL}/assignments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo obtener la lista de asignaciones');
  }

  return response.json();
};

// Editar asignación
export const updateAssignmentAPI = async (mission_id, group_id, data) => {
  const response = await fetch(`${BASE_URL}/assignments/${mission_id}/${group_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo actualizar la asignación');
  }

  return response.json();
};

//Eliminar asignación
export const deleteAssignmentAPI = async (mission_id, group_id) => {
  const response = await fetch(`${BASE_URL}/assignments/${mission_id}/${group_id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo eliminar la asignación');
  }

  return response.json();
};

// Función para añadir un estudiante a un grupo
export const addStudentToGroupAPI = async (data) => {
  // data será un objeto como: { email: 'student@mail.com', group_id: 5 }
  const response = await fetch(`${BASE_URL}/groups/add-student`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo añadir al estudiante');
  }

  return response.json();
};

// Función para que un estudiante se una a un grupo
export const joinGroupAPI = async (joinCode) => {
  const response = await fetch(`${BASE_URL}/groups/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify({ join_code: joinCode }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo unir al grupo');
  }

  return response.json();
};

// Función para que un estudiante obtenga sus misiones
export const getMyMissionsAPI = async () => {
  const response = await fetch(`${BASE_URL}/student/my-missions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo obtener la lista de misiones');
  }

  return response.json();
};

// Función para obtener los detalles de UNA misión específica (incluyendo sus preguntas)
export const getMissionDetailsAPI = async (missionId) => {
  const response = await fetch(`${BASE_URL}/missions/${missionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo obtener los detalles de la misión');
  }

  return response.json();
};

//Función para enviar la respuesta de un estudiante y obtener el resultado
export const submitAnswerAPI = async (answerData) => {

  const response = await fetch(`${BASE_URL}/game/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(answerData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo enviar la respuesta');
  }

  return response.json(); 
};

// Resetear el progreso de una misión
export const resetMissionProgressAPI = async (missionId) => {
  const response = await fetch(`${BASE_URL}/game/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify({ mission_id: missionId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo resetear la misión');
  }

  return response.json();
};

// Obtener perfil del usuario autenticado
export const getProfileAPI = async () => {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'No se pudo obtener el perfil');
  }

  return response.json(); 
};

// Actualizar perfil del usuario autenticado
export const updateProfileAPI = async (profileData) => {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'No se pudo actualizar el perfil');
  }

  return response.json(); // devuelve { message, user }
};

//Obtener estadísticas del profesor (con cookie httpOnly)
export const getProfessorStatsAPI = async (professorId) => {
  const response = await fetch(`${BASE_URL}/stats/professor/${professorId}`, {
    method: 'GET',
    credentials: 'include', 
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo obtener estadísticas del profesor');
  }

  return response.json();
};


// ✅ Obtener estadísticas del estudiante logueado (con cookie httpOnly)
export const getMyStatsAPI = async () => {
  const response = await fetch(`${BASE_URL}/stats/my`, {
    method: 'GET',
    credentials: 'include', 
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo obtener tus estadísticas');
  }

  return response.json();
};

const API_URL = import.meta.env.VITE_API_URL; // http://localhost:5000

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/uploads`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Error al subir la imagen");
  }

  return res.json(); // { path: "uploads/..." }
}