const express = require('express');
const router = express.Router();

// Importar funciones del controlador y middleware de autenticación
const { assignMissionToGroup, getAssignments, updateAssignment, deleteAssignment } = require('../controllers/assignments.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Asignar una misión a un grupo
router.post('/', authMiddleware, assignMissionToGroup);

// Obtener todas las asignaciones del profesor
router.get('/', authMiddleware, getAssignments);

// Actualizar una asignación específica
router.put('/:mission_id/:group_id', authMiddleware, updateAssignment);

// Eliminar una asignación específica
router.delete('/:mission_id/:group_id', authMiddleware, deleteAssignment);

module.exports = router;