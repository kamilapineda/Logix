const express = require('express');
const router = express.Router();

const { createQuestion, getQuestions, updateQuestion, deleteQuestion } = require('../controllers/questions.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Crear una pregunta
router.post('/', authMiddleware, createQuestion);

// Obtener todas las preguntas del profesor logueado
router.get('/', authMiddleware, getQuestions);

// Actualizar una pregunta existente
router.put('/:id', authMiddleware, updateQuestion);

// Eliminar una pregunta existente
router.delete('/:id', authMiddleware, deleteQuestion);

module.exports = router;