const express = require('express');
const router = express.Router();

// 1. Importa AMBAS funciones del controlador
const { createQuestion, getQuestions } = require('../controllers/questions.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Ruta para CREAR una pregunta
router.post('/', authMiddleware, createQuestion);

// 2. NUEVO: Ruta para OBTENER todas las preguntas del profesor
router.get('/', authMiddleware, getQuestions);

module.exports = router;