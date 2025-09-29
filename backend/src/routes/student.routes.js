const express = require('express');
const router = express.Router();

const { getMyMissions } = require('../controllers/student.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Obtener las misiones asignadas a un estudiante
router.get('/my-missions', authMiddleware, getMyMissions);

module.exports = router;