const express = require("express");
const router = express.Router();
const { getStudentStats, getProfessorStats,  getProfessorPillarStats } = require("../controllers/stats.controller");

// Obtener estadísticas de un estudiante
router.get("/student/:id", getStudentStats);

// Obtener estadísticas generales de un profesor
router.get("/professor/:id", getProfessorStats);

// Obtener estadísticas por pilares de un profesor
router.get("/professor/:id/pillars", getProfessorPillarStats);

module.exports = router;
