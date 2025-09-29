const express = require('express');
const router = express.Router();

// Importar funciones del controlador y middleware
const { createMission, getMissions,  getMissionDetails, updateMission, deleteMission  } = require('../controllers/missions.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Crear una nueva misión
router.post('/', authMiddleware, createMission);

// Obtener todas las misiones del profesor logueado
router.get('/', authMiddleware, getMissions);

// Obtener los detalles de una misión específica
router.get('/:id', authMiddleware, getMissionDetails);

// Actualizar una misión
router.put('/:id', authMiddleware, updateMission);

// Eliminar una misión
router.delete('/:id', authMiddleware, deleteMission);

module.exports = router;