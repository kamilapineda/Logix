const express = require('express');
const router = express.Router();

// 1. Importa AMBAS funciones del controlador
const { createMission, getMissions,  getMissionDetails  } = require('../controllers/missions.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Ruta para CREAR una nueva misión
router.post('/', authMiddleware, createMission);

// Ruta para OBTENER todas las misiones del profesor logueado
router.get('/', authMiddleware, getMissions);

// Ruta para OBTENER los detalles de UNA misión específica
router.get('/:id', authMiddleware, getMissionDetails);

module.exports = router;