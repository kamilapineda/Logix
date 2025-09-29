const express = require('express');
const router = express.Router();

// Importar funciones del controlador de juego y middleware de autenticación
const { submitAnswer } = require('../controllers/game.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { resetMissionProgress } = require('../controllers/game.controller');

// Guardar respuesta de un estudiante
router.post('/answer', authMiddleware, submitAnswer);

// Reiniciar el progreso de una misión
router.post('/reset', authMiddleware, resetMissionProgress);

module.exports = router;