import { useState, useEffect } from 'react';
import { 
  createGroupAPI, getGroupsAPI, 
  createQuestionAPI, getQuestionsAPI, 
  createMissionAPI, getMissionsAPI,
  assignMissionAPI, getAssignmentsAPI,
  addStudentToGroupAPI 
} from '../services/api';
import Header from '../components/Header';

function ProfessorDashboard() {
  // --- ESTADOS ---
  const [groups, setGroups] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [missions, setMissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [message, setMessage] = useState('');

  // Estados para los formularios
  const [groupName, setGroupName] = useState('');
  const [newQuestion, setNewQuestion] = useState({ titulo: '', enunciado: '', tipo: 'multiple_option', opciones: '', respuesta_correcta: '' });
  const [newMission, setNewMission] = useState({ nombre: '', dificultad: 'Fácil' });
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [assignment, setAssignment] = useState({ mission_id: '', group_id: '' });
  const [enrollment, setEnrollment] = useState({ email: '', group_id: '' });

  // --- Cargar datos iniciales ---
  const fetchData = async () => {
    try {
      const [groupsData, questionsData, missionsData, assignmentsData] = await Promise.all([
        getGroupsAPI(),
        getQuestionsAPI(),
        getMissionsAPI(),
        getAssignmentsAPI()
      ]);
      setGroups(groupsData);
      setQuestions(questionsData);
      setMissions(missionsData);
      setAssignments(assignmentsData);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS (FUNCIONES) ---
  const handleCreateGroup = async (event) => {
    event.preventDefault();
    setMessage('');
    if (!groupName) return setMessage('Por favor, escribe un nombre para el grupo.');
    try {
      await createGroupAPI({ name: groupName });
      setMessage(`¡Grupo "${groupName}" creado!`);
      setGroupName('');
      fetchData(); 
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const dataToSubmit = { ...newQuestion, opciones: newQuestion.opciones.split(',').map(opt => opt.trim()) };
      const result = await createQuestionAPI(dataToSubmit);
      setMessage(`¡Pregunta "${result.question.titulo}" creada!`);
      setNewQuestion({ titulo: '', enunciado: '', tipo: 'multiple_option', opciones: '', respuesta_correcta: '' });
      fetchData();
    } catch (error) {
      setMessage(error.message);
    }
  };
  
  const handleMissionChange = (e) => {
    const { name, value } = e.target;
    setNewMission(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionSelect = (questionId) => {
    const id = questionId; 
    if (!id) return;
    setSelectedQuestions(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCreateMission = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!newMission.nombre || selectedQuestions.length === 0) return setMessage('Una misión necesita un nombre y al menos una pregunta.');
    try {
      const missionData = { ...newMission, question_ids: selectedQuestions };
      await createMissionAPI(missionData);
      setMessage(`¡Misión "${newMission.nombre}" creada!`);
      setNewMission({ nombre: '', dificultad: 'Fácil' });
      setSelectedQuestions([]);
      fetchData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setAssignment(prev => ({ ...prev, [name]: value }));
  };

  const handleAssignMission = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!assignment.mission_id || !assignment.group_id) return setMessage('Debes seleccionar una misión y un grupo.');
    try {
      const assignmentData = {
        mission_id: Number(assignment.mission_id),
        group_id: Number(assignment.group_id)
      };
      await assignMissionAPI(assignmentData);
      setMessage('¡Misión asignada con éxito!');
      setAssignment({ mission_id: '', group_id: '' });
      fetchData();
    } catch (error) {
      setMessage(error.message);
    }
  };
  const handleEnrollmentChange = (e) => {
    const { name, value } = e.target;
    setEnrollment(prev => ({ ...prev, [name]: value }));
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!enrollment.email || !enrollment.group_id) {
      return setMessage('Se necesita un email y un grupo.');
    }
    try {
      await addStudentToGroupAPI(enrollment);
      setMessage(`¡Estudiante ${enrollment.email} añadido al grupo con éxito!`);
      setEnrollment({ email: '', group_id: '' }); // Limpia el formulario
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white p-8">
      <Header />
      <h1 className="text-4xl font-bold mb-8">Panel del Arquitecto del Conocimiento</h1>
      {message && <p className="mb-4 text-center text-xl bg-slate-700 p-2 rounded-lg">{message}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
        
        {/* COLUMNA 1: Asignar Misión */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Asignar Misión</h2>
          <form onSubmit={handleAssignMission} className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Seleccionar Misión:</label>
              <select name="mission_id" value={assignment.mission_id} onChange={handleAssignmentChange} className="w-full p-2 bg-slate-700 rounded" required>
                <option value="">-- Elige una misión --</option>
                {missions.map(m => <option key={m.mission_id || m.id} value={m.mission_id || m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold">Asignar al Grupo:</label>
              <select name="group_id" value={assignment.group_id} onChange={handleAssignmentChange} className="w-full p-2 bg-slate-700 rounded" required>
                <option value="">-- Elige un grupo --</option>
                {groups.map(g => <option key={g.groups_id || g.id} value={g.groups_id || g.id}>{g.name}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded">Asignar Misión</button>
          </form>
        </div>

        {/* COLUMNA 2: Crear Misión */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Crear Nueva Misión</h2>
          <form onSubmit={handleCreateMission} className="space-y-4">
            <input name="nombre" value={newMission.nombre} onChange={handleMissionChange} placeholder="Nombre de la misión" className="w-full p-2 bg-slate-700 rounded" required />
            <select name="dificultad" value={newMission.dificultad} onChange={handleMissionChange} className="w-full p-2 bg-slate-700 rounded">
              <option value="Fácil">Fácil</option>
              <option value="Medio">Medio</option>
              <option value="Difícil">Difícil</option>
            </select>
            <div className="border-t border-slate-700 pt-4">
              <h3 className="font-semibold mb-2">Seleccionar Preguntas:</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto p-1">
                {questions.map(q => {
                  const id = q.questions_id || q.id;
                  return (
                    <div key={id} className="flex items-center bg-slate-700/50 p-2 rounded hover:bg-slate-700">
                      <input type="checkbox" id={`q-${id}`} checked={selectedQuestions.includes(id)} onChange={() => handleQuestionSelect(id)} className="h-4 w-4 rounded" />
                      <label htmlFor={`q-${id}`} className="ml-3 text-sm">{q.titulo}</label>
                    </div>
                  );
                })}
              </div>
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-2 px-4 rounded">Crear Misión</button>
          </form>
        </div>
        
        {/* COLUMNA 3: Crear Pregunta */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Crear Nueva Pregunta</h2>
          <form onSubmit={handleCreateQuestion} className="space-y-4">
            <input name="titulo" value={newQuestion.titulo} onChange={handleQuestionChange} placeholder="Título" className="w-full p-2 bg-slate-700 rounded" required />
            <textarea name="enunciado" value={newQuestion.enunciado} onChange={handleQuestionChange} placeholder="Enunciado" className="w-full p-2 bg-slate-700 rounded" required />
            <select name="tipo" value={newQuestion.tipo} onChange={handleQuestionChange} className="w-full p-2 bg-slate-700 rounded">
              <option value="multiple_option">Opción Múltiple</option>
              <option value="true_false">Verdadero/Falso</option>
              <option value="numeric">Numérica</option>
            </select>
            <textarea name="opciones" value={newQuestion.opciones} onChange={handleQuestionChange} placeholder="Opciones separadas por coma" className="w-full p-2 bg-slate-700 rounded" />
            <input name="respuesta_correcta" value={newQuestion.respuesta_correcta} onChange={handleQuestionChange} placeholder="Respuesta Correcta" className="w-full p-2 bg-slate-700 rounded" required />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 font-bold py-2 px-4 rounded">Crear Pregunta</button>
          </form>
        </div>
        
        {/* COLUMNA 4: Listas */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Mis Grupos</h2>
           <div className="space-y-2 max-h-40 overflow-y-auto p-1">
              {groups.map(g => (
                <div key={g.groups_id || g.id} className="bg-slate-700 p-3 rounded text-sm">
                  <p className="font-bold">{g.name}</p>
                  {/* --- LÍNEA AÑADIDA --- */}
                  <p className="text-xs text-yellow-400 font-mono bg-slate-800 px-2 py-1 rounded mt-1">
                    Código: {g.join_code}
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4 mt-4 border-t border-slate-700 pt-4">
                <input type="text" placeholder="Nombre del nuevo grupo" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full p-2 bg-slate-700 rounded" />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded">Crear Grupo</button>
            </form>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Mis Preguntas</h2>
            <div className="space-y-2 max-h-40 overflow-y-auto p-1">
              {questions.map(q => (<div key={q.questions_id || q.id} className="bg-slate-700 p-3 rounded">{q.titulo}</div>))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Mis Misiones</h2>
            <div className="space-y-2 max-h-40 overflow-y-auto p-1">
              {missions.map(m => (
                <div key={m.mission_id || m.id} className="bg-slate-700 p-3 rounded">
                  <p className="font-bold">{m.nombre}</p>
                  <p className="text-sm text-slate-400">Dificultad: {m.dificultad}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Misiones Asignadas</h2>
            <div className="space-y-2 max-h-40 overflow-y-auto p-1">
              {assignments
                // 1. Primero, filtramos cualquier asignación "rota" que pueda tener datos nulos.
                .filter(a => a.missions && a.groups) 
                .map(a => (
                  <div key={`${a.mission_id}-${a.group_id}`} className="bg-slate-600 p-3 rounded text-sm">
                    {/* 2. Usamos el "optional chaining" (?.) para acceder de forma segura.
                        Si a.missions es null, no intentará leer .nombre y no se romperá. */}
                    <p><span className="font-bold">{a.missions?.nombre}</span></p>
                    <p className="text-slate-300">→ asignada a <span className="font-semibold">{a.groups?.name}</span></p>
                  </div>
              ))}
              {/* Mostramos este mensaje si, después de filtrar, no queda ninguna asignación válida */}
              {assignments.filter(a => a.missions && a.groups).length === 0 && (
                <p className="text-slate-400">Aún no has asignado ninguna misión.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  
}

export default ProfessorDashboard;