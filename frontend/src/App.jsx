import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ProfessorDashboard from './pages/ProfessorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import MissionPage from './pages/MissionPage';
import QuestionPage from './pages/QuestionPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route path="/" element={<AuthPage />} />
        <Route path="/professor" element={<ProtectedRoute><ProfessorDashboard /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/mission/:missionId" element={ <ProtectedRoute><MissionPage /></ProtectedRoute>} />
        <Route  path="/mission/:missionId/question/:questionIndex" element={<ProtectedRoute> <QuestionPage /></ProtectedRoute> }  />
      </Routes>
    </div>
  )
}

export default App;