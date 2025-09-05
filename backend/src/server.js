const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Importamos rutas
const authRoutes = require('./routes/auth.routes');
const groupRoutes = require('./routes/groups.routes'); 
const questionRoutes = require('./routes/questions.routes');
const missionRoutes = require('./routes/missions.routes');
const assignmentRoutes = require('./routes/assignments.routes');
const studentRoutes = require('./routes/student.routes');
const gameRoutes = require('./routes/game.routes');


app.use(cors()); 
app.use(express.json());

// Le decimos a nuestra app que use las rutas
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/game', gameRoutes);

app.listen(port, () => {
  console.log(`Servidor de LogiX corriendo en http://localhost:${port}`);
});