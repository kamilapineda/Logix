const express = require('express');
const router = express.Router();

// Importar funciones del controlador y middleware
const { createGroup, getGroups, addStudentToGroup, joinGroup, updateGroup, deleteGroup } = require('../controllers/groups.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Obtener todos los grupos del profesor logueado
router.get('/', authMiddleware, getGroups);

// Crear un nuevo grupo
router.post('/', authMiddleware, createGroup);

// Añadir un estudiante a un grupo
router.post('/add-student', authMiddleware, addStudentToGroup);

// Unirse a un grupo
router.post('/join', authMiddleware, joinGroup);

// Actualizar un grupo existente
router.put('/:id', authMiddleware, updateGroup);

// Eliminar un grupo existente
router.delete('/:id', authMiddleware, deleteGroup);

module.exports = router;