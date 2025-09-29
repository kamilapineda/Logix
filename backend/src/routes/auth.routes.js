const express = require('express');
const router = express.Router();

// Importar funciones del controlador de autenticación
const { test, register, login, validateToken, logout } = require('../controllers/auth.controller');

// Ruta de prueba de autenticación
router.get('/', test);

// Registrar un nuevo usuario
router.post('/register', register);

// Iniciar sesión y generar token
router.post('/login', login);

// Validar o renovar la sesión del usuario
router.get('/validate', validateToken);

// Cerrar sesión del usuario
router.post('/logout', logout);

module.exports = router;
