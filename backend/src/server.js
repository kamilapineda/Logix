  const express = require('express');
  const cors = require('cors');
  const cookieParser = require('cookie-parser');
  const app = express();
  const path = require('path');
  const port = process.env.PORT || 3000;


  // Importar rutas
  const authRoutes = require('./routes/auth.routes');
  const groupRoutes = require('./routes/groups.routes'); 
  const questionRoutes = require('./routes/questions.routes');
  const missionRoutes = require('./routes/missions.routes');
  const assignmentRoutes = require('./routes/assignments.routes');
  const studentRoutes = require('./routes/student.routes');
  const gameRoutes = require('./routes/game.routes');
  const profileRoutes = require('./routes/profile.routes');
  const statsRoutes = require('./routes/stats.routes');
  const uploadsRouter = require('./routes/uploads');

  // Configuración de CORS
  const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // ajusta según tu frontend
    credentials: true, // permite cookies
  };

  // Si está en producción detrás de un proxy (Heroku, Vercel, Nginx, etc.)
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  //Middlewares globales
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json());

  //Carpeta pública para servir archivos
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Rutas de la api
  app.use('/api/auth', authRoutes);
  app.use('/api/groups', groupRoutes);
  app.use('/api/questions', questionRoutes);
  app.use('/api/missions', missionRoutes);
  app.use('/api/assignments', assignmentRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/game', gameRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/stats', statsRoutes);   
  app.use('/api/uploads', uploadsRouter);

  // Iniciar servidor
  app.listen(port, () => {
    console.log(`Servidor de LogiX corriendo en http://localhost:${port}`);
  });
