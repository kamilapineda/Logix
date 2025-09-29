const supabase = require("../config/supabaseClient");

//Estadísticas de un estudiante
async function getStudentStats(req, res) {
  try {
    const { id } = req.params;

    // Obtener resumen de misiones del estudiante
    const { data: summary, error: summaryError } = await supabase
      .from("student_mission_status")
      .select("mission_score, reset_count, mission_id")
      .eq("student_id", id);

    if (summaryError) throw summaryError;

    // Calcular totales de puntaje y resets
    const total_score = summary.reduce((acc, s) => acc + (s.mission_score || 0), 0);
    const total_resets = summary.reduce((acc, s) => acc + (s.reset_count || 0), 0);

    // Contar respuestas incorrectas
    const { data: errors, error: errorCount } = await supabase
      .from("student_answers")
      .select("id", { count: "exact" })
      .eq("student_id", id)
      .eq("is_correct", false);

    if (errorCount) throw errorCount;

    // Obtener detalle de las misiones
    const { data: missions, error: missionsError } = await supabase
      .from("missions")
      .select("mission_id, nombre, dificultad")
      .in(
        "mission_id",
        summary.map((s) => s.mission_id)
      );

    if (missionsError) throw missionsError;

    // Unir misiones con estadísticas del estudiante
    const missionStats = missions.map((m) => {
      const st = summary.find((s) => s.mission_id === m.mission_id);
      return {
        mission_name: m.nombre,
        dificultad: m.dificultad,
        mission_score: st?.mission_score || 0,
        errors: errors?.length || 0,
        reset_count: st?.reset_count || 0,
      };
    });

    res.json({
      total_score,
      total_errors: errors?.length || 0,
      total_resets,
      missions: missionStats,
    });
  } catch (err) {
    console.error("❌ Error getStudentStats:", err);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
}

// Estadísticas de todos los estudiantes de un profesor
async function getProfessorStats(req, res) {
  try {
    const { id } = req.params;

    //Obtener grupos del profesor
    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select("groups_id")
      .eq("profesor_id", id);

    if (groupsError) throw groupsError;
    if (!groups || groups.length === 0) return res.json([]);

    const groupIds = groups.map(g => g.groups_id);

    // Obtener estudiantes de los grupos
    const { data: studentGroups, error: sgError } = await supabase
      .from("student_groups")
      .select("student_id, group_id")
      .in("group_id", groupIds);

    if (sgError) throw sgError;
    const studentIds = [...new Set((studentGroups || []).map(sg => sg.student_id))];
    if (studentIds.length === 0) return res.json([]);

    // Obtener info de los estudiantes
    const { data: students, error: stuError } = await supabase
      .from("users")
      .select("id, name, email")
      .in("id", studentIds);

    if (stuError) throw stuError;

    // Obtener progreso en misiones
    const { data: statsRows, error: statsError } = await supabase
      .from("student_mission_status")
      .select("student_id, mission_id, mission_score, reset_count")
      .in("student_id", studentIds);

    if (statsError) throw statsError;

    // Obtener respuestas incorrectas
    const { data: answersRows, error: answersError } = await supabase
      .from("student_answers")
      .select("student_id, mission_id, is_correct")
      .in("student_id", studentIds)
      .eq("is_correct", false);

    if (answersError) throw answersError;

    // Obtener datos de misiones
    const missionIds = [...new Set((statsRows || []).map(r => r.mission_id))];
    let missions = [];
    if (missionIds.length > 0) {
      const { data: missionsData, error: missionsErr } = await supabase
        .from("missions")
        .select("mission_id, nombre, dificultad")
        .in("mission_id", missionIds);
      if (missionsErr) throw missionsErr;
      missions = missionsData || [];
    }

    // Preparar datos en mapas
    const missionsById = new Map((missions || []).map(m => [m.mission_id, m]));
    const statsByStudent = (statsRows || []).reduce((acc, r) => {
      acc[r.student_id] = acc[r.student_id] || [];
      acc[r.student_id].push(r);
      return acc;
    }, {});
    const answersByStudentMission = (answersRows || []).reduce((acc, a) => {
      acc[a.student_id] = acc[a.student_id] || {};
      acc[a.student_id][a.mission_id] = (acc[a.student_id][a.mission_id] || 0) + 1;
      return acc;
    }, {});
    const totalErrorsByStudent = {};
    for (let sid of studentIds) {
      const byMission = answersByStudentMission[sid] || {};
      totalErrorsByStudent[sid] = Object.values(byMission).reduce((s,v)=>s+v, 0);
    }

    // Construir resultado final por estudiante
    const results = (students || []).map(student => {
      const sRows = statsByStudent[student.id] || [];

      const missionsArr = sRows.map(s => {
        const m = missionsById.get(s.mission_id) || {};
        const errorsForThis = answersByStudentMission[student.id]?.[s.mission_id] || 0;
        return {
          mission_id: s.mission_id,
          mission_name: m.nombre || null,        
          dificultad: m.dificultad || null,      
          mission_score: s.mission_score || 0,
          reset_count: s.reset_count || 0,
          errors: errorsForThis
        };
      });

      const total_score = sRows.reduce((acc, r) => acc + (r.mission_score || 0), 0);
      const total_resets = sRows.reduce((acc, r) => acc + (r.reset_count || 0), 0);
      const total_errors = totalErrorsByStudent[student.id] || 0;

      return {
        student_name: student.name,
        email: student.email,
        total_score,
        total_resets,
        total_errors,
        missions: missionsArr
      };
    });

    return res.json(results);
  } catch (err) {
    console.error("Error getProfessorStats:", err);
    return res.status(500).json({ message: "Error al obtener estadísticas de estudiantes" });
  }
}


//Estadísticas generales por pilar de un profesor
async function getProfessorPillarStats(req, res) {
  try {
    const { id } = req.params; // 

    // Obtener preguntas del profesor con su pilar
    const { data: questions, error: qErr } = await supabase
      .from("questions")
      .select("questions_id, pillar")
      .eq("profesor_id", id);

    if (qErr) throw qErr;
    if (!questions || questions.length === 0) {
      return res.json([]);
    }

    const questionIds = questions.map(q => q.questions_id);

    // Obtener respuestas de esas preguntas
    const { data: answers, error: aErr } = await supabase
      .from("student_answers")
      .select("question_id, is_correct")
      .in("question_id", questionIds);

    if (aErr) throw aErr;

    //Inicializar los 5 pilares fijos
    const allPillars = [
      "Abstracción",
      "Descomposición",
      "Pensamiento Algorítmico",
      "Evaluación",
      "Reconocimiento de Patrones",
    ];

    const pillarStats = {};
    allPillars.forEach(p => {
      pillarStats[p] = { total: 0, count: 0 };
    });

    //Sumar resultados por pilar
    for (let ans of answers) {
      const q = questions.find(q => q.questions_id === ans.question_id);
      if (!q || !q.pillar) continue;

      let pilares = q.pillar;
      if (typeof pilares === "string") {
        try {
          pilares = JSON.parse(pilares);
        } catch {
          pilares = [pilares];
        }
      }
      if (!Array.isArray(pilares)) pilares = [pilares];

      pilares.forEach(p => {
        if (!pillarStats[p]) return; 
        pillarStats[p].total += ans.is_correct ? 1 : 0;
        pillarStats[p].count += 1;
      });
    }

    //Calcular promedio por pilar
    const results = allPillars.map(p => ({
      pillar: p,
      promedio:
        pillarStats[p].count > 0
          ? (pillarStats[p].total / pillarStats[p].count).toFixed(2)
          : 0,
    }));

    res.json(results);
  } catch (err) {
    console.error("❌ Error getProfessorPillarStats:", err);
    res.status(500).json({ message: "Error al obtener estadísticas por pilar" });
  }
}

module.exports = {
  getStudentStats,
  getProfessorStats,
  getProfessorPillarStats,
};
