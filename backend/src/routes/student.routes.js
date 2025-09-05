const express = require('express');
const router = express.Router();

const { getMyMissions } = require('../controllers/student.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Ruta para que un estudiante obtenga sus misiones asignadas
// Usamos /my-missions para que sea descriptivo
router.get('/my-missions', authMiddleware, getMyMissions);

module.exports = router;