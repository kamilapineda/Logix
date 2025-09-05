const express = require('express');
const router = express.Router();

// 1. Importa 'login' junto a las otras funciones
const { test, register, login } = require('../controllers/auth.controller');

// Ruta de prueba
router.get('/', test);

// Ruta para el registro de usuarios
router.post('/register', register);

// 2. NUEVO: Ruta para el inicio de sesión
router.post('/login', login);

module.exports = router;