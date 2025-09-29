import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MissionPage from "./pages/MissionPage";
import QuestionPage from "./pages/QuestionPage";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import StudentStatsPage from "./pages/StudentStatsPage";
import ProfessorStatsPage from "./pages/ProfessorStatsPage";
import StudentBadges from "./pages/StudentBadgesPage";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/professor"
          element={
            <ProtectedRoute>
              <ProfessorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mission/:missionId"
          element={
            <ProtectedRoute>
              <MissionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mission/:missionId/question/:questionIndex"
          element={
            <ProtectedRoute>
              <QuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/stats"
          element={
            <ProtectedRoute>
              <StudentStatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professor/stats"
          element={
            <ProtectedRoute>
              <ProfessorStatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/badges"
          element={
            <ProtectedRoute>
              <StudentBadges />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
