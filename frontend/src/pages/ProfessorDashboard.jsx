import { useState, useEffect } from 'react';
import {
  createGroupAPI, getGroupsAPI, updateGroupAPI, deleteGroupAPI,
  createQuestionAPI, getQuestionsAPI, updateQuestionAPI, deleteQuestionAPI,
  createMissionAPI, getMissionsAPI, updateMissionAPI, deleteMissionAPI,
  assignMissionAPI, getAssignmentsAPI, updateAssignmentAPI, deleteAssignmentAPI, getMissionDetailsAPI
} from '../services/api';
import { uploadFile } from "../services/storage";
import Header from '../components/Header';

function ProfessorDashboard() {
    // Estados principales
  const [groups, setGroups] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [missions, setMissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [message, setMessage] = useState('');
  const [editGroup, setEditGroup] = useState(null);
  const [editAssignment, setEditAssignment] = useState(null);

  // Formularios
  const [groupName, setGroupName] = useState('');
  const [newQuestion, setNewQuestion] = useState({
    titulo: '',
    enunciado: '',
    tipo: 'multiple_option',
    opciones: [],
    respuesta_correcta: '',
    pillar: [],
    showPilarOptions: false
  });
  const [newMission, setNewMission] = useState({ nombre: '', dificultad: 'Fácil' });
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [assignment, setAssignment] = useState({ mission_id: '', group_id: '' });

  // Modales / selección
  const [openModal, setOpenModal] = useState(''); // create / edit modal key
  const [selectedItem, setSelectedItem] = useState(null); // visualización (view modal)
  const [viewModal, setViewModal] = useState(''); // tipo de visualización

 // Estados de edición
  const [editQuestion, setEditQuestion] = useState(null);
  const [editMission, setEditMission] = useState(null);

   // Loading / errores para misiones
  const [loadingMission, setLoadingMission] = useState(false);
  const [missionError, setMissionError] = useState('');
  const [loadingEditMission, setLoadingEditMission] = useState(false);

   // Cargar datos iniciales
  const fetchData = async () => {
    try {
      const [groupsData, questionsData, missionsData, assignmentsData] = await Promise.all([
        getGroupsAPI(), getQuestionsAPI(), getMissionsAPI(), getAssignmentsAPI()
      ]);
      setGroups(groupsData || []);
      setQuestions(questionsData || []);
      setMissions(missionsData || []);
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('fetchData error', error);
      setMessage(error.message || 'Error cargando datos');
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Crear grupo
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName) return setMessage('Escribe un nombre para el grupo.');
    try {
      await createGroupAPI({ name: groupName });
      setMessage(`Grupo "${groupName}" creado!`);
      setGroupName('');
      await fetchData();
      setOpenModal('');
    } catch (error) { setMessage(error.message); }
  };

    // Crear pregunta
 const handleCreateQuestion = async (e) => {
  e.preventDefault();

  if (newQuestion.tipo === 'multiple_option' && newQuestion.opciones.length === 0) {
    return setMessage('Agrega al menos una opción.');
  }

  if (!newQuestion.pillar || newQuestion.pillar.length === 0) {
    return setMessage('Selecciona al menos un pilar.');
  }

  try {
    const payload = {
      ...newQuestion,
      opciones: JSON.stringify(newQuestion.opciones || []),
      pillar: JSON.stringify(newQuestion.pillar || []),
    };

    await createQuestionAPI(payload);

    setMessage(`Pregunta "${newQuestion.titulo}" creada!`);
    setNewQuestion({
      titulo: '',
      enunciado: '',
      tipo: 'multiple_option',
      opciones: [],
      respuesta_correcta: '',
      pillar: [],
      showPilarOptions: false
    });
    await fetchData();
    setOpenModal('');
  } catch (error) {
    setMessage(error.message);
  }
};

 // Crear misión
  const handleCreateMission = async (e) => {
    e.preventDefault();
    if (!newMission.nombre || selectedQuestions.length === 0) return setMessage('Una misión necesita un nombre y al menos una pregunta.');
    try {
      await createMissionAPI({ ...newMission, question_ids: selectedQuestions });
      setMessage(`Misión "${newMission.nombre}" creada!`);
      setNewMission({ nombre: '', dificultad: 'Fácil' });
      setSelectedQuestions([]);
      await fetchData();
      setOpenModal('');
    } catch (error) { setMessage(error.message); }
  };

    // Asignar misión a grupo
  const handleAssignMission = async (e) => {
    e.preventDefault();
    if (!assignment.mission_id || !assignment.group_id) return setMessage('Selecciona una misión y un grupo.');
    try {
      await assignMissionAPI({ mission_id: Number(assignment.mission_id), group_id: Number(assignment.group_id) });
      setMessage('Misión asignada con éxito!');
      setAssignment({ mission_id: '', group_id: '' });
      await fetchData();
      setOpenModal('');
    } catch (error) { setMessage(error.message); }
  };

   // Abrir edición de grupo
  const handleUpdateGroup = (g) => {
    setEditGroup({ ...g });
    setOpenModal('editGroup');
  };

    // Guardar edición de grupo
  const handleSubmitEditGroup = async (e) => {
    e.preventDefault();
    if (!editGroup) return;
    try {
      await updateGroupAPI(editGroup.groups_id || editGroup.id, { name: editGroup.name });
      setMessage("Grupo actualizado!");
      await fetchData();
      setOpenModal('');
      setEditGroup(null);
    } catch (error) {
      setMessage(error.message);
    }
  };

 // Abrir edición de pregunta
const handleUpdateQuestion = (q) => {
  // Normalizar opciones
  let opcionesParsed = [];
  if (q.opciones) {
    try {
      const raw = Array.isArray(q.opciones) ? q.opciones : JSON.parse(q.opciones);
      opcionesParsed = raw.map(opt =>
        typeof opt === "string"
          ? { type: "text", content: opt }
          : opt // si ya es { type, content }
      );
    } catch (e) {
      console.error("Error parseando opciones:", e);
      opcionesParsed = [];
    }
  }

  // Normalizar pilares
  let pilaresParsed = [];
  if (q.pillar) {
    try {
      pilaresParsed = Array.isArray(q.pillar) ? q.pillar : JSON.parse(q.pillar);
    } catch (e) {
      console.error("Error parseando pilares:", e);
      pilaresParsed = [];
    }
  }

  // Normalizar enunciado extendido
  let contentParsed = [];
  if (q.question_content) {
    try {
      const raw = Array.isArray(q.question_content)
        ? q.question_content
        : JSON.parse(q.question_content);
      contentParsed = raw.map(block =>
        typeof block === "string"
          ? { type: "text", content: block }
          : block
      );
    } catch (e) {
      console.error("Error parseando question_content:", e);
      contentParsed = [];
    }
  }

  setEditQuestion({
    ...q,
    opciones: opcionesParsed,
    pillar: pilaresParsed,
    question_content: contentParsed,
    showPilarOptions: false
  });
  setOpenModal("editQuestion");
};

  // Guardar edición de pregunta
const handleSubmitEditQuestion = async (e) => {
  e.preventDefault();

  if (editQuestion.tipo === 'multiple_option' && (!editQuestion.opciones || editQuestion.opciones.length === 0)) {
    return setMessage('Agrega al menos una opción.');
  }

  if (!editQuestion.pillar || editQuestion.pillar.length === 0) {
    return setMessage('Selecciona al menos un pilar.');
  }

  try {
    const payload = {
      ...editQuestion,
      opciones: JSON.stringify(editQuestion.opciones || []),
      pillar: JSON.stringify(editQuestion.pillar || []),
      question_content: JSON.stringify(editQuestion.question_content || []),
    };

    const res = await fetch(`/api/questions/${editQuestion.questions_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Error al actualizar pregunta");

    const data = await res.json();

    // refrescar preguntas en la lista
    setQuestions((prev) =>
      prev.map((q) => (q.questions_id === data.questions_id ? data : q))
    );

    setMessage(`Pregunta "${editQuestion.titulo}" actualizada!`);
    setOpenModal("");
    setEditQuestion(null);
  } catch (err) {
    console.error("Error actualizando pregunta:", err);
    setMessage(err.message);
  }
};

  // Ver misión con detalles
  const handleViewMission = async (mission) => {
    const missionId = mission.mission_id || mission.id;
    try {
      setViewModal('mission');
      setSelectedItem(null);
      setMissionError('');
      setLoadingMission(true);

      const details = await getMissionDetailsAPI(missionId);
      // normalizar si backend usa fields distintos
      const normalized = {
        ...details,
        mission_id: details.mission_id || details.id,
        questions: details.questions || details.question_list || []
      };
      setSelectedItem(normalized);
    } catch (err) {
      console.error('Error cargando detalles de misión:', err);
      setMissionError(err.message || 'Error al cargar detalles de la misión.');
    } finally {
      setLoadingMission(false);
    }
  };

 // Abrir edición de misión
  const handleEditMissionClick = async (mission) => {
    const missionId = mission.mission_id || mission.id;
    try {
      setLoadingEditMission(true);
      const fullMission = await getMissionDetailsAPI(missionId);

      // normalizar: questions -> question_ids
      const question_ids = (fullMission.questions || []).map(q => q.questions_id || q.id).filter(Boolean);

      setEditMission({
        ...fullMission,
        mission_id: fullMission.mission_id || fullMission.id,
        question_ids
      });

      setOpenModal("editMission");
    } catch (err) {
      console.error('handleEditMissionClick error', err);
      setMessage("Error cargando la misión: " + (err.message || err));
    } finally {
      setLoadingEditMission(false);
    }
  };

    // Guardar edición de misión
  const handleSubmitEditMission = async (e) => {
    e.preventDefault();
    if (!editMission) return;

    try {
      const missionId = editMission.mission_id || editMission.id;
      await updateMissionAPI(missionId, {
        nombre: editMission.nombre,
        dificultad: editMission.dificultad,
        description: editMission.description,
        question_ids: editMission.question_ids || []
      });

      setMessage("Misión actualizada!");
      await fetchData();
      setOpenModal("");
      setEditMission(null);
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Abrir edición de asignación
const handleUpdateAssignment = (assignment) => {
  setEditAssignment({
    ...assignment,
    old_mission_id: assignment.mission_id, 
    old_group_id: assignment.group_id,     
    mission_id: assignment.mission_id,     
    group_id: assignment.group_id,
  });
  setOpenModal("editAssignment");
};

  // Guardar edición de asignación
const handleSubmitEditAssignment = async (e) => {
  e.preventDefault();
  if (!editAssignment?.mission_id || !editAssignment?.group_id) {
    return setMessage("Selecciona misión y grupo.");
  }

  try {
    await updateAssignmentAPI(
      editAssignment.old_mission_id, // ID viejo misión
      editAssignment.old_group_id,   // ID viejo grupo
      {
        new_mission_id: editAssignment.mission_id, // ID nuevo misión
        new_group_id: editAssignment.group_id      // ID nuevo grupo
      }
    );

    setMessage("Asignación actualizada!");
    await fetchData();
    setOpenModal("");
    setEditAssignment(null);
  } catch (error) {
    setMessage(error.message);
  }
};

  // Eliminar grupo
  const handleDeleteGroup = async (id) => {
    if (!window.confirm("¿Eliminar este grupo?")) return;
    try {
      await deleteGroupAPI(id);
      setMessage("Grupo eliminado!");
      await fetchData();
    } catch (error) { setMessage(error.message); }
  };

    // Eliminar pregunta
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("¿Eliminar esta pregunta?")) return;
    try {
      await deleteQuestionAPI(id);
      setMessage("Pregunta eliminada!");
      await fetchData();
    } catch (error) { setMessage(error.message); }
  };

    // Eliminar misión
  const handleDeleteMission = async (id) => {
    if (!window.confirm("¿Eliminar esta misión?")) return;
    try {
      await deleteMissionAPI(id);
      setMessage("Misión eliminada!");
      await fetchData();
    } catch (error) { setMessage(error.message); }
  };

    // Eliminar asignación
  const handleDeleteAssignment = async (mission_id, group_id) => {
    if (!window.confirm("¿Eliminar esta asignación?")) return;
    try {
      await deleteAssignmentAPI(mission_id, group_id);
      setMessage("Asignación eliminada!");
      await fetchData();
    } catch (error) { setMessage(error.message); }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white p-8">
      <Header />
      <h1 className="text-4xl font-bold mb-8 text-center">Panel del Arquitecto del Conocimiento</h1>
      {message && <p className="mb-4 text-center text-xl bg-slate-700 p-2 rounded-lg">{message}</p>}

      {/* Tarjetas de acción */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {[
          { title: 'Crear Grupo', color: 'blue', modal: 'createGroup' },
          { title: 'Crear Pregunta', color: 'green', modal: 'createQuestion' },
          { title: 'Crear Misión', color: 'purple', modal: 'createMission' },
          { title: 'Asignar Misión', color: 'red', modal: 'assignMission' },
        ].map(card => (
          <div
            key={card.title}
            onClick={() => setOpenModal(card.modal)}
            className={`cursor-pointer bg-${card.color}-600 p-6 rounded-lg shadow-xl hover:bg-${card.color}-700 text-center transition transform hover:scale-105`}
          >
            <h2 className="text-2xl font-bold mb-2">{card.title}</h2>
            <p className="text-sm text-slate-200">Haz click para abrir el formulario</p>
          </div>
        ))}
      </div>

      {/* Listas (grupos, preguntas, misiones, asignaciones) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {/* Grupos */}
        <div className="bg-slate-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Mis Grupos</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {groups.map(g => (
              <div key={g.groups_id || g.id} className="flex justify-between items-center bg-blue-700 p-3 rounded-lg hover:bg-blue-600 transition">
                <div className="cursor-pointer" onClick={() => { setSelectedItem(g); setViewModal('group'); }}>
                  <p className="font-bold">{g.name}</p>
                  <p className="text-xs text-yellow-400 font-mono">Código: {g.join_code}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleUpdateGroup(g)}>✏️</button>
                  <button onClick={() => handleDeleteGroup(g.groups_id || g.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preguntas */}
        <div className="bg-slate-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Mis Preguntas</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {questions.map(q => {
              const icon = q.tipo === 'multiple_option' ? '📝' : q.tipo === 'true_false' ? '✔️' : '🔢';
              return (
                <div key={q.questions_id || q.id} className="flex justify-between items-center bg-green-700 p-3 rounded-lg hover:bg-green-600 transition">
                  <span className="cursor-pointer" onClick={() => { setSelectedItem(q); setViewModal('question'); }}>
                    {icon} {q.titulo}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateQuestion(q)}>✏️</button>
                    <button onClick={() => handleDeleteQuestion(q.questions_id || q.id)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Misiones */}
        <div className="bg-slate-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Mis Misiones</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {missions.map(m => {
              let color = m.dificultad === 'Fácil' ? 'bg-purple-500' : m.dificultad === 'Medio' ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={m.mission_id || m.id} className={`${color} p-3 rounded-lg text-white hover:brightness-110 transition flex justify-between items-center`}>
                  <div className="cursor-pointer" onClick={() => handleViewMission(m)}>
                    <p className="font-bold">{m.nombre}</p>
                    <p className="text-xs">Dificultad: {m.dificultad}</p>
                    <p className="text-xs">Descripcion: {m.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditMissionClick(m)} className="hover:scale-110 transition">✏️</button>
                    <button onClick={() => handleDeleteMission(m.mission_id || m.id)} className="hover:scale-110 transition">🗑️</button>
                  </div>
                </div>
              );
            })} 
          </div>
        </div>

        {/* Asignaciones */}
        <div className="bg-slate-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Misiones Asignadas</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {assignments.filter(a => a.missions && a.groups).map(a => {
              let color = a.missions?.dificultad === 'Fácil' ? 'bg-purple-500' : a.missions?.dificultad === 'Medio' ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={`${a.mission_id}-${a.group_id}`} className={`${color} p-3 rounded-lg text-white hover:brightness-110 transition flex justify-between items-center`}>
                  <div className="cursor-pointer" onClick={() => { setSelectedItem(a); setViewModal('assignment'); }}>
                    <p className="font-bold">{a.missions?.nombre}</p>
                    <p className="text-xs">Grupo: {a.groups?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateAssignment(a)}>✏️</button>
                    <button onClick={() => handleDeleteAssignment(a.mission_id, a.group_id)}>🗑️</button>
                  </div>
                </div>
              );
            })}
            {assignments.filter(a => a.missions && a.groups).length === 0 && (
              <p className="text-slate-400 text-sm">Aún no has asignado misiones.</p>
            )}
          </div>
        </div>
      </div>

      {/*Modales de CREAR / EDIT (un overlay para todos)*/}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-lg relative shadow-xl">
            <button onClick={() => { setOpenModal(''); setEditQuestion(null); setEditMission(null); }} className="absolute top-2 right-2 text-sm underline">Cerrar</button>

            {/* Crear Grupo */}
            {openModal === 'createGroup' && (
              <>
                <h2 className="text-2xl font-bold mb-4">Crear Grupo</h2>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <input type="text" placeholder="Nombre del grupo" value={groupName} onChange={e => setGroupName(e.target.value)} className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-blue-500"/>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded font-bold transition transform hover:scale-105">Crear Grupo</button>
                </form>
              </>
            )}

  {/* Crear Pregunta */}
  {openModal === 'createQuestion' && (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-slate-800 w-11/12 h-[90vh] rounded-xl p-6 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6">Crear Pregunta</h2>

        <form onSubmit={handleCreateQuestion} className="grid grid-cols-2 gap-6">
          {/* Columna Izquierda */}
          <div className="space-y-4">
            {/* Título */}
            <input
              type="text"
              placeholder="Título"
              value={newQuestion.titulo}
              onChange={e => setNewQuestion(prev => ({ ...prev, titulo: e.target.value }))}
              className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-green-500"
              required
            />
             {/* Pregunta principal */}
          <input
            type="text"
            placeholder="Pregunta principal (enunciado corto)"
            value={newQuestion.enunciado}
            onChange={e =>
              setNewQuestion(prev => ({ ...prev, enunciado: e.target.value }))
            }
            className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-green-500"
            required
          />
          {/* Enunciado enriquecido */}
          <div className="space-y-3">
            <h3 className="font-semibold">Enunciado extendido</h3>

            {(newQuestion.question_content || []).map((block, i) => (
              <div key={i} className="flex gap-2 items-start">
                {/* Selector tipo */}
                <select
                  value={block.type}
                  onChange={e => {
                    const updated = [...newQuestion.question_content];
                    updated[i].type = e.target.value;
                    setNewQuestion(prev => ({
                      ...prev,
                      question_content: updated,
                    }));
                  }}
                  className="p-2 rounded border border-slate-600 bg-slate-700"
                >
                  <option value="text">Texto</option>
                  <option value="image">Imagen</option>
                </select>

                {/* Contenido dinámico */}
                {block.type === "text" ? (
                  <textarea
                    placeholder="Escribe parte del enunciado..."
                    value={block.content}
                    onChange={e => {
                      const updated = [...newQuestion.question_content];
                      updated[i].content = e.target.value;
                      setNewQuestion(prev => ({
                        ...prev,
                        question_content: updated,
                      }));
                    }}
                    className="flex-1 p-2 rounded border border-slate-600 bg-slate-700 resize-y"
                  />
                ) : (
                  <div
                    className={`flex-1 p-2 border-2 border-dashed rounded text-center cursor-pointer transition 
    ${block.isDragging ? "border-blue-400 bg-blue-900/30" : "border-slate-600 bg-slate-800"}`}
  onDrop={async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      try {
        const publicUrl = await uploadFile(file);
        const updated = [...newQuestion.question_content];
        updated[i].content = publicUrl;
        updated[i].isDragging = false;
        setNewQuestion(prev => ({ ...prev, question_content: updated }));
      } catch (err) {
        console.error("Error subiendo imagen:", err);
      }
    }
  }}
  onDragOver={(e) => e.preventDefault()}
  onDragEnter={() => {
    const updated = [...newQuestion.question_content];
    updated[i].isDragging = true;
    setNewQuestion(prev => ({ ...prev, question_content: updated }));
  }}
  onDragLeave={() => {
    const updated = [...newQuestion.question_content];
    updated[i].isDragging = false;
    setNewQuestion(prev => ({ ...prev, question_content: updated }));
  }}
>
  {block.content ? (
    <div className="space-y-2">
      <img src={block.content} alt="enunciado" className="max-h-40 mx-auto rounded" />
      <button
        type="button"
        onClick={() => {
          const updated = [...newQuestion.question_content];
          updated[i].content = "";
          setNewQuestion(prev => ({ ...prev, question_content: updated }));
        }}
        className="text-sm px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
      >
        Quitar imagen
      </button>
    </div>
  ) : (
    "Arrastra y suelta una imagen aquí"
  )}
                  </div>
                )}

                {/* Botón borrar */}
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...newQuestion.question_content];
                    updated.splice(i, 1);
                    setNewQuestion(prev => ({
                      ...prev,
                      question_content: updated,
                    }));
                  }}
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white"
                >
                  ❌
                </button>
              </div>
            ))}

            {/* Botón añadir bloque */}
            <button
              type="button"
              onClick={() =>
                setNewQuestion(prev => ({
                  ...prev,
                  question_content: [
                    ...(prev.question_content || []),
                    { type: "text", content: "" },
                  ],
                }))
              }
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
              ➕ Añadir bloque
            </button>
          </div>

          </div>

          {/* Columna Derecha */}
          <div className="space-y-6">
            {/* Tipo */}
            <select
              value={newQuestion.tipo}
              onChange={e => setNewQuestion(prev => ({ ...prev, tipo: e.target.value, respuesta_correcta: '' }))}
              className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-green-500"
            >
              <option value="multiple_option">Opción Múltiple</option>
              <option value="true_false">Verdadero/Falso</option>
              <option value="numeric">Numérica</option>
            </select>

            {/* Pilares */}
            <div>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-2"
                onClick={() => setNewQuestion(prev => ({ ...prev, showPilarOptions: !prev.showPilarOptions }))}
              >
                {newQuestion.showPilarOptions ? 'Ocultar pilares' : 'Seleccionar pilares'}
              </button>
              {newQuestion.showPilarOptions && (
                <div className="grid grid-cols-2 gap-2 border p-2 rounded bg-slate-700">
                  {['Abstracción','Descomposición','Pensamiento Algorítmico','Evaluación','Reconocimiento de Patrones'].map((p, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newQuestion.pillar?.includes(p)}
                        onChange={() => {
                          if (newQuestion.pillar?.includes(p)) {
                            setNewQuestion(prev => ({ ...prev, pillar: prev.pillar.filter(x => x !== p) }));
                          } else {
                            setNewQuestion(prev => ({ ...prev, pillar: [...(prev.pillar || []), p] }));
                          }
                        }}
                        className="accent-yellow-400"
                      />
                      {p}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Opciones */}
            {newQuestion.tipo === 'multiple_option' && (
              <div className="space-y-3">
                {(newQuestion.opciones || []).map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    {/* Selector tipo */}
                    <select
                      value={opt.type}
                      onChange={e => {
                        const updated = [...newQuestion.opciones];
                        updated[i].type = e.target.value;
                        setNewQuestion(prev => ({ ...prev, opciones: updated }));
                      }}
                      className="p-2 rounded border border-slate-600 bg-slate-700"
                    >
                      <option value="text">Texto</option>
                      <option value="image">Imagen</option>
                    </select>

                    {/* Entrada dinámica */}
                    {opt.type === "text" ? (
                      <input
                        type="text"
                        placeholder={`Opción ${i + 1}`}
                        value={opt.content}
                        onChange={e => {
                          const updated = [...newQuestion.opciones];
                          updated[i].content = e.target.value;
                          setNewQuestion(prev => ({ ...prev, opciones: updated }));
                        }}
                        className="flex-1 p-2 rounded border border-slate-600 bg-slate-700"
                      />
                    ) : (
 <div
  className={`flex-1 p-2 border-2 border-dashed rounded text-center cursor-pointer transition 
    ${opt.isDragging ? "border-blue-400 bg-blue-900/30" : "border-slate-600 bg-slate-800"}`}
  onDrop={async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      try {
        const publicUrl = await uploadFile(file);
        const updated = [...newQuestion.opciones];
        updated[i].content = publicUrl;
        updated[i].isDragging = false;
        setNewQuestion(prev => ({ ...prev, opciones: updated }));
      } catch (err) {
        console.error("Error subiendo imagen:", err);
      }
    }
  }}
  onDragOver={(e) => e.preventDefault()}
  onDragEnter={() => {
    const updated = [...newQuestion.opciones];
    updated[i].isDragging = true;
    setNewQuestion(prev => ({ ...prev, opciones: updated }));
  }}
  onDragLeave={() => {
    const updated = [...newQuestion.opciones];
    updated[i].isDragging = false;
    setNewQuestion(prev => ({ ...prev, opciones: updated }));
  }}
>
  {opt.content ? (
    <div className="space-y-2">
      <img src={opt.content} alt="preview" className="max-h-20 mx-auto rounded" />
      <button
        type="button"
        onClick={() => {
          const updated = [...newQuestion.opciones];
          updated[i].content = "";
          setNewQuestion(prev => ({ ...prev, opciones: updated }));
        }}
        className="text-sm px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
      >
        Quitar imagen
      </button>
    </div>
  ) : (
    "Arrastra y suelta una imagen aquí"
  )}
</div>
                    )}

                    {/* Seleccionar como respuesta correcta */}
                    <input
                      type="radio"
                      name="respuesta_correcta"
                      checked={newQuestion.respuesta_correcta === opt.content}
                      onChange={() => setNewQuestion(prev => ({ ...prev, respuesta_correcta: opt.content }))}
                      className="accent-green-500"
                    />

                    {/* Borrar */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...newQuestion.opciones];
                        updated.splice(i, 1);
                        setNewQuestion(prev => ({ ...prev, opciones: updated }));
                      }}
                      className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white"
                    >
                      ❌
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setNewQuestion(prev => ({
                      ...prev,
                      opciones: [...(prev.opciones || []), { type: "text", content: "" }]
                    }))
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                  Añadir Opción
                </button>
              </div>
            )}

            {/* Respuesta para Verdadero/Falso */}
            {newQuestion.tipo === "true_false" && (
              <select
                value={newQuestion.respuesta_correcta}
                onChange={e => setNewQuestion(prev => ({ ...prev, respuesta_correcta: e.target.value }))}
                className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Seleccione respuesta</option>
                <option value="Verdader">Verdadero</option>
                <option value="Falso">Falso</option>
              </select>
            )}

            {/* Respuesta numérica */}
            {newQuestion.tipo === "numeric" && (
              <input
                type="number"
                placeholder="Respuesta correcta"
                value={newQuestion.respuesta_correcta}
                onChange={e => setNewQuestion(prev => ({ ...prev, respuesta_correcta: e.target.value }))}
                className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-green-500"
              />
            )}
          </div>

          {/* Botón guardar */}
          <div className="col-span-2 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setOpenModal(null)}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
            >
              Guardar Pregunta
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* Editar Pregunta */}
  {openModal === 'editQuestion' && editQuestion && (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-slate-800 w-11/12 h-[90vh] rounded-xl p-6 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6">Editar Pregunta</h2>

        <form onSubmit={handleSubmitEditQuestion} className="grid grid-cols-2 gap-6">
          {/* Columna Izquierda */}
          <div className="space-y-4">
            {/* Título */}
            <input
              type="text"
              placeholder="Título"
              value={editQuestion.titulo}
              onChange={e => setEditQuestion(prev => ({ ...prev, titulo: e.target.value }))}
              className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-green-500"
              required
            />

            {/* Pregunta principal */}
            <input
              type="text"
              placeholder="Pregunta principal (enunciado corto)"
              value={editQuestion.enunciado}
              onChange={e =>
                setEditQuestion(prev => ({ ...prev, enunciado: e.target.value }))
              }
              className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-green-500"
              required
            />

            {/* Enunciado extendido */}
            <div className="space-y-3">
              <h3 className="font-semibold">Enunciado extendido</h3>

              {(editQuestion.question_content || []).map((block, i) => (
                <div key={i} className="flex gap-2 items-start">
                  {/* Selector tipo */}
                  <select
                    value={block.type}
                    onChange={e => {
                      const updated = [...editQuestion.question_content];
                      updated[i].type = e.target.value;
                      setEditQuestion(prev => ({
                        ...prev,
                        question_content: updated,
                      }));
                    }}
                    className="p-2 rounded border border-slate-600 bg-slate-700"
                  >
                    <option value="text">Texto</option>
                    <option value="image">Imagen</option>
                  </select>

                  {/* Contenido dinámico */}
                  {block.type === "text" ? (
                    <textarea
                      placeholder="Escribe parte del enunciado..."
                      value={block.content}
                      onChange={e => {
                        const updated = [...editQuestion.question_content];
                        updated[i].content = e.target.value;
                        setEditQuestion(prev => ({
                          ...prev,
                          question_content: updated,
                        }));
                      }}
                      className="flex-1 p-2 rounded border border-slate-600 bg-slate-700 resize-y"
                    />
                  ) : (
<div
  className={`flex-1 p-2 border-2 border-dashed rounded text-center cursor-pointer transition 
    ${block.isDragging ? "border-blue-400 bg-blue-900/30" : "border-slate-600 bg-slate-800"}`}
  onDrop={async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      try {
        const publicUrl = await uploadFile(file);
        const updated = [...editQuestion.question_content];
        updated[i].content = publicUrl;
        updated[i].isDragging = false;
        setEditQuestion(prev => ({ ...prev, question_content: updated }));
      } catch (err) {
        console.error("Error subiendo imagen:", err);
      }
    }
  }}
  onDragOver={(e) => e.preventDefault()}
  onDragEnter={() => {
    const updated = [...editQuestion.question_content];
    updated[i].isDragging = true;
    setEditQuestion(prev => ({ ...prev, question_content: updated }));
  }}
  onDragLeave={() => {
    const updated = [...editQuestion.question_content];
    updated[i].isDragging = false;
    setEditQuestion(prev => ({ ...prev, question_content: updated }));
  }}
>
  {block.content ? (
    <div className="space-y-2">
      <img src={block.content} alt="enunciado" className="max-h-40 mx-auto rounded" />
      <button
        type="button"
        onClick={() => {
          const updated = [...editQuestion.question_content];
          updated[i].content = "";
          setEditQuestion(prev => ({ ...prev, question_content: updated }));
        }}
        className="text-sm px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
      >
        Quitar imagen
      </button>
    </div>
  ) : (
    "Arrastra y suelta una imagen aquí"
  )}
</div>

                  )}

                  {/* Botón borrar */}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...editQuestion.question_content];
                      updated.splice(i, 1);
                      setEditQuestion(prev => ({
                        ...prev,
                        question_content: updated,
                      }));
                    }}
                    className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white"
                  >
                    ❌
                  </button>
                </div>
              ))}

              {/* Botón añadir bloque */}
              <button
                type="button"
                onClick={() =>
                  setEditQuestion(prev => ({
                    ...prev,
                    question_content: [
                      ...(prev.question_content || []),
                      { type: "text", content: "" },
                    ],
                  }))
                }
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
              >
                ➕ Añadir bloque
              </button>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-6">
            {/* Tipo */}
            <select
              value={editQuestion.tipo}
              onChange={e => setEditQuestion(prev => ({ ...prev, tipo: e.target.value, respuesta_correcta: '' }))}
              className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-green-500"
            >
              <option value="multiple_option">Opción Múltiple</option>
              <option value="true_false">Verdadero/Falso</option>
              <option value="numeric">Numérica</option>
            </select>

            {/* Pilares */}
            <div>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-2"
                onClick={() => setEditQuestion(prev => ({ ...prev, showPilarOptions: !prev.showPilarOptions }))}
              >
                {editQuestion.showPilarOptions ? 'Ocultar pilares' : 'Seleccionar pilares'}
              </button>
              {editQuestion.showPilarOptions && (
                <div className="grid grid-cols-2 gap-2 border p-2 rounded bg-slate-700">
                  {['Abstracción','Descomposición','Pensamiento Algorítmico','Evaluación','Reconocimiento de Patrones'].map((p, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editQuestion.pillar?.includes(p)}
                        onChange={() => {
                          if (editQuestion.pillar?.includes(p)) {
                            setEditQuestion(prev => ({ ...prev, pillar: prev.pillar.filter(x => x !== p) }));
                          } else {
                            setEditQuestion(prev => ({ ...prev, pillar: [...(prev.pillar || []), p] }));
                          }
                        }}
                        className="accent-yellow-400"
                      />
                      {p}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Opciones */}
            {editQuestion.tipo === 'multiple_option' && (
              <div className="space-y-3">
                {(editQuestion.opciones || []).map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    {/* Selector tipo */}
                    <select
                      value={opt.type}
                      onChange={e => {
                        const updated = [...editQuestion.opciones];
                        updated[i].type = e.target.value;
                        setEditQuestion(prev => ({ ...prev, opciones: updated }));
                      }}
                      className="p-2 rounded border border-slate-600 bg-slate-700"
                    >
                      <option value="text">Texto</option>
                      <option value="image">Imagen</option>
                    </select>

                    {/* Entrada dinámica */}
                    {opt.type === "text" ? (
                      <input
                        type="text"
                        placeholder={`Opción ${i + 1}`}
                        value={opt.content}
                        onChange={e => {
                          const updated = [...editQuestion.opciones];
                          updated[i].content = e.target.value;
                          setEditQuestion(prev => ({ ...prev, opciones: updated }));
                        }}
                        className="flex-1 p-2 rounded border border-slate-600 bg-slate-700"
                      />
                    ) : (
                     <div
  className={`flex-1 p-2 border-2 border-dashed rounded text-center cursor-pointer transition 
    ${opt.isDragging ? "border-blue-400 bg-blue-900/30" : "border-slate-600 bg-slate-800"}`}
  onDrop={async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      try {
        const publicUrl = await uploadFile(file);
        const updated = [...editQuestion.opciones];
        updated[i].content = publicUrl;
        updated[i].isDragging = false;
        setEditQuestion(prev => ({ ...prev, opciones: updated }));
      } catch (err) {
        console.error("Error subiendo imagen:", err);
      }
    }
  }}
  onDragOver={(e) => e.preventDefault()}
  onDragEnter={() => {
    const updated = [...editQuestion.opciones];
    updated[i].isDragging = true;
    setEditQuestion(prev => ({ ...prev, opciones: updated }));
  }}
  onDragLeave={() => {
    const updated = [...editQuestion.opciones];
    updated[i].isDragging = false;
    setEditQuestion(prev => ({ ...prev, opciones: updated }));
  }}
>
  {opt.content ? (
    <div className="space-y-2">
      <img src={opt.content} alt="preview" className="max-h-20 mx-auto rounded" />
      <button
        type="button"
        onClick={() => {
          const updated = [...editQuestion.opciones];
          updated[i].content = "";
          setEditQuestion(prev => ({ ...prev, opciones: updated }));
        }}
        className="text-sm px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
      >
        Quitar imagen
      </button>
    </div>
  ) : (
    "Arrastra y suelta una imagen aquí"
  )}
</div>

                    )}

                    {/* Seleccionar como respuesta correcta */}
                    <input
                      type="radio"
                      name="respuesta_correcta"
                      checked={editQuestion.respuesta_correcta === opt.content}
                      onChange={() => setEditQuestion(prev => ({ ...prev, respuesta_correcta: opt.content }))}
                      className="accent-green-500"
                    />

                    {/* Borrar */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...editQuestion.opciones];
                        updated.splice(i, 1);
                        setEditQuestion(prev => ({ ...prev, opciones: updated }));
                      }}
                      className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white"
                    >
                      ❌
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setEditQuestion(prev => ({
                      ...prev,
                      opciones: [...(prev.opciones || []), { type: "text", content: "" }]
                    }))
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                  Añadir Opción
                </button>
              </div>
            )}

            {/* Respuesta para Verdadero/Falso */}
            {editQuestion.tipo === "true_false" && (
              <select
                value={editQuestion.respuesta_correcta}
                onChange={e => setEditQuestion(prev => ({ ...prev, respuesta_correcta: e.target.value }))}
                className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Seleccione respuesta</option>
                <option value="Verdadero">Verdadero</option>
                <option value="Falso">Falso</option>
              </select>
            )}

            {/* Respuesta numérica */}
            {editQuestion.tipo === "numeric" && (
              <input
                type="number"
                placeholder="Respuesta correcta"
                value={editQuestion.respuesta_correcta}
                onChange={e => setEditQuestion(prev => ({ ...prev, respuesta_correcta: e.target.value }))}
                className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-green-500"
              />
            )}
          </div>

          {/* Botón guardar */}
          <div className="col-span-2 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setOpenModal(null)}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

{/* Editar Grupo */}
{openModal === 'editGroup' && editGroup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="w-full max-w-md bg-slate-800 p-6 rounded-lg relative">
      <button
        onClick={() => { setOpenModal(''); setEditGroup(null); }}
        className="absolute top-4 right-4 text-slate-300 hover:text-white text-xl"
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold mb-6 text-center">Editar Grupo</h2>

      <form onSubmit={handleSubmitEditGroup} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre del grupo"
          value={editGroup.name || ''}
          onChange={e => setEditGroup(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-3 rounded border border-slate-600 bg-slate-700"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded text-white font-bold"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  </div>
)}

            {/* Crear Misión */}
            {openModal === 'createMission' && (
              <>
                <h2 className="text-2xl font-bold mb-4">Crear Misión</h2>
                <form onSubmit={handleCreateMission} className="space-y-4">
                  <input placeholder="Nombre Misión" value={newMission.nombre} onChange={e=>setNewMission(prev=>({...prev,nombre:e.target.value}))} className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-purple-500"/>

                  <textarea
                    placeholder="Descripción de la misión"
                    value={newMission.description || ""}
                    onChange={e=>setNewMission(prev=>({...prev, description:e.target.value}))}
                    className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-purple-500 resize-y"
                    rows={3}
                  />
                  <select value={newMission.dificultad} onChange={e=>setNewMission(prev=>({...prev,dificultad:e.target.value}))} className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-purple-500">
                    <option value="Fácil">Fácil</option>
                    <option value="Medio">Medio</option>
                    <option value="Difícil">Difícil</option>
                  </select>
                  <div className="border-t border-slate-700 pt-2">
                    <p className="font-semibold mb-2">Seleccionar Preguntas:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {questions.map(q=>{
                        const id=q.questions_id||q.id;
                        return(
                          <div key={id} className="flex items-center gap-2 bg-slate-700 p-2 rounded hover:bg-slate-600">
                            <input type="checkbox" checked={selectedQuestions.includes(id)} onChange={()=>setSelectedQuestions(prev=>prev.includes(id)?prev.filter(i=>i!==id):[...prev,id])}/>
                            <span>{q.titulo}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded font-bold mt-2 transition transform hover:scale-105">Crear Misión</button>
                </form>
              </>
            )}

            {/* Asignar Misión */}
            {openModal === 'assignMission' && (
              <>
                <h2 className="text-2xl font-bold mb-4">Asignar Misión</h2>
                <form onSubmit={handleAssignMission} className="space-y-4">
                  <select value={assignment.mission_id} onChange={e=>setAssignment(prev=>({...prev,mission_id:e.target.value}))} className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-red-500">
                    <option value="">-- Selecciona Misión --</option>
                    {missions.map(m=><option key={m.mission_id||m.id} value={m.mission_id||m.id}>{m.nombre}</option>)}
                  </select>
                  <select value={assignment.group_id} onChange={e=>setAssignment(prev=>({...prev,group_id:e.target.value}))} className="w-full p-3 rounded border border-slate-600 bg-slate-700 focus:ring-2 focus:ring-red-500">
                    <option value="">-- Selecciona Grupo --</option>
                    {groups.map(g=><option key={g.groups_id||g.id} value={g.groups_id||g.id}>{g.name}</option>)}
                  </select>
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-3 rounded font-bold transition transform hover:scale-105">Asignar Misión</button>
                </form>
              </>
            )}

            {/* EDITAR MISIÓN (ahora dentro del mismo overlay openModal) */}
            {openModal === 'editMission' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Editar Misión</h2>

                {loadingEditMission && <p>Cargando misión...</p>}

                {!loadingEditMission && editMission && (
                  <form onSubmit={handleSubmitEditMission} className="space-y-4">
                    <input type="text" placeholder="Nombre de la misión" value={editMission.nombre || ''} onChange={e => setEditMission(prev => ({ ...prev, nombre: e.target.value }))} className="w-full p-3 rounded border border-slate-600 bg-slate-700" required/>

                    {/* Descripción */}
                    <textarea
                      placeholder="Descripción de la misión"
                      value={editMission.description || ""}
                      onChange={e => setEditMission(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 rounded border border-slate-600 bg-slate-700 resize-y"
                      rows={3}
                    />

                    <select value={editMission.dificultad || 'Fácil'} onChange={e => setEditMission(prev => ({ ...prev, dificultad: e.target.value }))} className="w-full p-3 rounded border border-slate-600 bg-slate-700">
                      <option value="Fácil">Fácil</option>
                      <option value="Medio">Medio</option>
                      <option value="Difícil">Difícil</option>
                    </select>

                    <div className="border-t border-slate-700 pt-3">
                      <p className="font-semibold mb-2">Preguntas asociadas</p>
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {questions.map(q => {
                          const qid = q.questions_id || q.id;
                          const checked = (editMission.question_ids || []).includes(qid);
                          return (
                            <label key={qid} className="flex items-center gap-3 bg-slate-700 p-2 rounded hover:bg-slate-600">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setEditMission(prev => {
                                    const ids = prev.question_ids ? [...prev.question_ids] : [];
                                    if (ids.includes(qid)) return { ...prev, question_ids: ids.filter(x => x !== qid) };
                                    else return { ...prev, question_ids: [...ids, qid] };
                                  });
                                }}
                                className="accent-yellow-400"
                              />
                              <span>{q.titulo}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded font-bold">Guardar Cambios</button>
                  </form>
                )}

                {!loadingEditMission && !editMission && <p className="text-slate-400">No se pudo cargar la misión para editar.</p>}
              </div>
            )}
          </div>
        </div>
      )}


{/* Editar Asignación */}
{openModal === "editAssignment" && editAssignment && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="w-full max-w-md bg-slate-800 p-6 rounded-lg relative">
      {/* Botón de cerrar */}
      <button
        onClick={() => { setOpenModal(""); setEditAssignment(null); }}
        className="absolute top-4 right-4 text-slate-300 hover:text-white text-xl"
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold mb-4 text-center">Editar Asignación</h2>
      <form onSubmit={handleSubmitEditAssignment} className="space-y-4">
        {/* Seleccionar Misión */}
        <div>
          <label className="block mb-1">Misión</label>
          <select
            value={editAssignment.mission_id}
            onChange={(e) =>
              setEditAssignment((prev) => ({ ...prev, mission_id: e.target.value }))
            }
            className="w-full p-3 rounded border border-slate-600 bg-slate-700"
          >
            <option value="">-- Selecciona misión --</option>
            {missions.map((m) => (
              <option key={m.mission_id || m.id} value={m.mission_id || m.id}>
                {m.nombre} (ID: {m.mission_id || m.id})
              </option>
            ))}
          </select>
        </div>

        {/* Seleccionar Grupo */}
        <div>
          <label className="block mb-1">Grupo</label>
          <select
            value={editAssignment.group_id}
            onChange={(e) =>
              setEditAssignment((prev) => ({ ...prev, group_id: e.target.value }))
            }
            className="w-full p-3 rounded border border-slate-600 bg-slate-700"
          >
            <option value="">-- Selecciona grupo --</option>
            {groups.map((g) => (
              <option key={g.groups_id || g.id} value={g.groups_id || g.id}>
                {g.name} (ID: {g.groups_id || g.id})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-600 hover:bg-yellow-700 py-3 rounded font-bold transition transform hover:scale-105"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  </div>
)}

      {/*Modales de VISUALIZACIÓN*/}
      {viewModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-40">
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-lg relative shadow-xl overflow-auto max-h-[90vh]">
            <button onClick={() => { setViewModal(''); setSelectedItem(null); }} className="absolute top-2 right-2 text-sm underline">Cerrar</button>

            {/* Grupo */}
            {viewModal === 'group' && (
              <>
                <h2 className="text-2xl font-bold mb-4">{selectedItem.name}</h2>
                <p><span className="font-semibold">Código:</span> {selectedItem.join_code}</p>
                <p><span className="font-semibold">ID:</span> {selectedItem.groups_id || selectedItem.id}</p>
                <p><span className="font-semibold">Estudiantes:</span> {selectedItem.students?.length ?? selectedItem.student_count ?? 0}</p>
              </>
            )}

{/* Pregunta */}
{viewModal === 'question' && selectedItem && (
  <>
    <h2 className="text-2xl font-bold mb-4">{selectedItem.titulo}</h2>
    <p><span className="font-semibold">Enunciado:</span> {selectedItem.enunciado}</p>
    <p><span className="font-semibold">Tipo:</span> {selectedItem.tipo}</p>

    {/* Opciones */}
    {selectedItem.tipo === 'multiple_option' && (
      <ul className="list-disc ml-5 mt-2">
        {(Array.isArray(selectedItem.opciones) 
          ? selectedItem.opciones 
          : JSON.parse(selectedItem.opciones || "[]")
        ).map((o, i) => {
          const text = typeof o === "string" ? o : o.content;
          return <li key={i}>{text}</li>;
        })}
      </ul>
    )}

    <p className="mt-2">
      <span className="font-semibold">Respuesta Correcta:</span> {selectedItem.respuesta_correcta}
    </p>

    {/* Pilares */}
    <p className="mt-2">
      <span className="font-semibold">Pilares:</span>{" "}
      {(Array.isArray(selectedItem.pillar) 
        ? selectedItem.pillar 
        : JSON.parse(selectedItem.pillar || "[]")
      ).join(", ") || "No asignados"}
    </p>
  </>
)}
            {/* Misión (visualizar preguntas asociadas) */}
            {viewModal === 'mission' && (
              <div>
                {loadingMission && <p className="text-center">Cargando detalles de la misión...</p>}
                {!loadingMission && missionError && <p className="text-red-400 text-center">Error: {missionError}</p>}
                {!loadingMission && !missionError && selectedItem && (
                  <>
                    <h2 className="text-2xl font-bold mb-2">{selectedItem.nombre}</h2>
                    <p className="mb-2"><span className="font-semibold">Dificultad:</span> {selectedItem.dificultad ?? missions.find(m => (m.mission_id||m.id) === (selectedItem.mission_id || selectedItem.id))?.dificultad}</p>
                    <p className="mb-4"> <span className="font-semibold">Descripción:</span>{" "} {selectedItem.description || "Sin descripción"}</p>
                    <p className="font-semibold mt-2">Preguntas:</p>
                    <ul className="list-disc ml-5 mb-4">
                      {selectedItem.questions && selectedItem.questions.length > 0 ? (
                        selectedItem.questions.map((q) => (
                          <li key={q.questions_id || q.id} className="mb-3">
                            <div className="font-medium">{q.titulo}</div>
                            <div className="text-sm text-slate-300">{q.enunciado}</div>
                            {q.pillar && <div className="mt-1 flex flex-wrap gap-2">{(Array.isArray(q.pillar) ? q.pillar : [q.pillar]).map((p,i) => <span key={i} className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs">{p}</span>)}</div>}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400">No hay preguntas asignadas a esta misión.</li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* Asignación */}
            {viewModal === 'assignment' && (() => {
              const mission = missions.find(m => (m.mission_id||m.id) === (selectedItem.mission_id || selectedItem.missions?.mission_id || selectedItem.missions?.id));
              const group = groups.find(g => (g.groups_id||g.id) === (selectedItem.group_id || selectedItem.groups?.groups_id || selectedItem.groups?.id));
              return (
                <>
                  <h2 className="text-2xl font-bold mb-4">{mission?.nombre || selectedItem.missions?.nombre}</h2>
                  <p><span className="font-semibold">Asignada a:</span> {group?.name || selectedItem.groups?.name}</p>
                  <p><span className="font-semibold">Dificultad:</span> {mission?.dificultad || selectedItem.missions?.dificultad}</p>
                </>
              );
            })()}

          </div>
        </div>
      )}
    </div>
  );
}

export default ProfessorDashboard;
