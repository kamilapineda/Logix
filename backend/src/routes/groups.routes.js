const express = require('express');
const router = express.Router();

// 1. Importa la nueva función del controlador
const { createGroup, getGroups, addStudentToGroup, joinGroup } = require('../controllers/groups.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Ruta para OBTENER todos los grupos del profesor logueado
router.get('/', authMiddleware, getGroups);

// Ruta para CREAR un nuevo grupo
router.post('/', authMiddleware, createGroup);

//Ruta para AÑADIR un estudiante a un grupo
router.post('/add-student', authMiddleware, addStudentToGroup);

// Ruta para que un estudiante se una a un grupo
router.post('/join', authMiddleware, joinGroup);

module.exports = router;