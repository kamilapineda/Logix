// La URL base de nuestro backend
const BASE_URL = 'http://localhost:3000/api';

// Función para crear un nuevo grupo
export const createGroupAPI = async (groupData) => {
  // 1. Obtenemos el token de nuestra "caja fuerte"
  const token = localStorage.getItem('authToken');

  // 2. Hacemos la petición fetch, pero esta vez...
  const response = await fetch(`${BASE_URL}/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 3. ...añadimos el token en el encabezado de Autorización
      'Authorization': `Bearer ${token}`
    },
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
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${BASE_URL}/groups`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // No te olvides de enviar el "pase de acceso"
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo obtener la lista de grupos');
  }

  return response.json();
};

// Función para crear una nueva pregunta
export const createQuestionAPI = async (questionData) => {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${BASE_URL}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(questionData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo crear la pregunta');
  }

  return response.json();
};

// Función para obtener las preguntas de un profesor
export const getQuestionsAPI = async () => {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${BASE_URL}/questions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo obtener la lista de preguntas');
  }

  return response.json();
};

// Función para crear una nueva misión
export const createMissionAPI = async (missionData) => {
  // missionData será un objeto como: { nombre: 'Mi Misión', dificultad: 'Fácil', question_ids: [1, 5, 8] }
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${BASE_URL}/missions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(missionData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo crear la misión');
  }

  return response.json();
};

// Función para obtener las misiones de un profesor
export const getMissionsAPI = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${BASE_URL}/missions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo obtener la lista de misiones');
  }

  return response.json();
};

// Función para asignar una misión a un grupo
export const assignMissionAPI = async (assignmentData) => {
  // assignmentData será un objeto como: { mission_id: 1, group_id: 2 }
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${BASE_URL}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(assignmentData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo asignar la misión');
  }

  return response.json();
};

// Función para obtener las asignaciones de un profesor
export const getAssignmentsAPI = async () => {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${BASE_URL}/assignments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo obtener la lista de asignaciones');
  }

  return response.json();
};

// Función para añadir un estudiante a un grupo
export const addStudentToGroupAPI = async (data) => {
  // data será un objeto como: { email: 'student@mail.com', group_id: 5 }
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${BASE_URL}/groups/add-student`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo añadir al estudiante');
  }

  return response.json();
};

// Función para que un estudiante se una a un grupo
export const joinGroupAPI = async (joinCode) => {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${BASE_URL}/groups/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ join_code: joinCode })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo unir al grupo');
  }

  return response.json();
};

// Función para que un estudiante obtenga sus misiones
export const getMyMissionsAPI = async () => {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${BASE_URL}/student/my-missions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo obtener la lista de misiones');
  }

  return response.json();
};

// Función para obtener los detalles de UNA misión específica (incluyendo sus preguntas)
export const getMissionDetailsAPI = async (missionId) => {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${BASE_URL}/missions/${missionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo obtener los detalles de la misión');
  }

  return response.json();
};

// Función para enviar la respuesta de un estudiante y obtener el resultado
export const submitAnswerAPI = async (answerData) => {
  // answerData será un objeto como: { mission_id, question_id, answer_given }
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${BASE_URL}/game/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(answerData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo enviar la respuesta');
  }

  return response.json(); // Esto devolverá { isCorrect, scoreAwarded, correctAnswer }
};


export const resetMissionProgressAPI = async (missionId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`http://localhost:3000/api/game/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ mission_id: missionId })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo resetear la misión');
  }

  return response.json();
};