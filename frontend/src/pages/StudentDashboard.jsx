import { useState, useEffect } from 'react';
// --- 1. IMPORTAMOS Link ---
import { Link } from 'react-router-dom';
import { joinGroupAPI, getMyMissionsAPI } from '../services/api';
import Header from '../components/Header';

function StudentDashboard() {
  const [joinCode, setJoinCode] = useState('');
  const [message, setMessage] = useState('');
  const [myGroupsData, setMyGroupsData] = useState([]);

  useEffect(() => {
    const fetchMyMissions = async () => {
      try {
        const data = await getMyMissionsAPI();
        setMyGroupsData(data);
      } catch (error) {
        setMessage(error.message);
      }
    };
    fetchMyMissions();
  }, []);

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!joinCode) return setMessage('Por favor, ingresa un código.');
    try {
      const result = await joinGroupAPI(joinCode);
      setMessage(result.message);
      setJoinCode('');
      const data = await getMyMissionsAPI();
      setMyGroupsData(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white p-8">
      <Header />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Panel del Aventurero del Saber</h1>
        
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl mb-8">
          <h2 className="text-2xl font-bold mb-4">Unirse a un Grupo</h2>
          <form onSubmit={handleJoinGroup} className="flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Ingresa el código"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="flex-grow p-2 bg-slate-700 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest text-center"
            />
            <button type="submit" className="bg-green-600 hover:bg-green-700 font-bold py-2 px-4 rounded transition-colors duration-300">
              Unirse
            </button>
          </form>
          {message && <p className="mt-4 text-center">{message}</p>}
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-4">Mis Aventuras</h2>
          {myGroupsData.length === 0 ? (
            <p className="text-slate-400">Aún no tienes misiones. ¡Únete a un grupo para empezar la aventura!</p>
          ) : (
            <div className="space-y-6">
              {myGroupsData.map(group => (
                <div key={group.groups_id || group.id} className="bg-slate-800 p-4 rounded-lg">
                  <h3 className="text-2xl font-semibold text-yellow-400 mb-3">{group.name}</h3>
                  {group.missions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.missions.map(mission => {
                        const missionId = mission.mission_id || mission.id;
                        return (
                          // --- 2. ENVOLVEMOS LA TARJETA EN EL LINK ---
                          <Link to={`/mission/${missionId}`} key={missionId}>
                            <div className="bg-slate-700 p-4 rounded shadow-md hover:bg-slate-600 cursor-pointer h-full transition-colors duration-200">
                              <h4 className="font-bold text-lg">{mission.nombre}</h4>
                              <p className="text-sm text-slate-300">Dificultad: {mission.dificultad}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-400">Este grupo aún no tiene misiones asignadas.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;