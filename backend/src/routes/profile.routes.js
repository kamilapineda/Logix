const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { getProfile, updateProfile } = require('../controllers/profile.controller');

// Obtener perfil del usuario logueado
router.get('/', authMiddleware, getProfile);

// Actualizar perfil del usuario logueado
router.put('/', authMiddleware, updateProfile);

module.exports = router;
