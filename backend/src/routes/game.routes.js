const express = require('express');
const router = express.Router();

const { submitAnswer } = require('../controllers/game.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { resetMissionProgress } = require('../controllers/game.controller');


// Ruta para que un estudiante envíe su respuesta a una pregunta
router.post('/answer', authMiddleware, submitAnswer);

// Ruta para resetear misión
router.post('/reset', authMiddleware, resetMissionProgress);

module.exports = router;