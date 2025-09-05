const express = require('express');
const router = express.Router();

// 1. Importa AMBAS funciones del controlador
const { assignMissionToGroup, getAssignments } = require('../controllers/assignments.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Ruta para ASIGNAR una misión a un grupo
router.post('/', authMiddleware, assignMissionToGroup);

// 2. NUEVO: Ruta para OBTENER todas las asignaciones del profesor
router.get('/', authMiddleware, getAssignments);

module.exports = router;