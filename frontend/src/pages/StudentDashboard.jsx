import { useState, useEffect } from 'react';
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
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 min-h-screen text-white p-6">
      <Header />
      <div className="max-w-6xl mx-auto">

        {/* Título */}
        <h1 className="text-5xl font-extrabold mb-10 text-center text-yellow-400 drop-shadow-lg">
          Panel del Aventurero del Saber
        </h1>

        {/* Sección superior: Unirse a grupo */}
        <div className="bg-slate-800 rounded-3xl shadow-2xl p-6 mb-12 border-2 border-yellow-400">
          <h2 className="text-3xl font-bold mb-4 text-yellow-400">Unirse a un Grupo</h2>
          <form onSubmit={handleJoinGroup} className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Código del grupo"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="flex-grow p-4 bg-slate-700 rounded-xl border-2 border-yellow-400 text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all hover:scale-105"
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all hover:scale-105"
            >
              Unirse
            </button>
          </form>
          {message && <p className="mt-4 text-center text-red-400 font-semibold">{message}</p>}
        </div>

        {/* Mis Aventuras */}
        <div>
          <h2 className="text-4xl font-bold mb-6 text-yellow-400 text-center drop-shadow-md">Mis Aventuras</h2>
          {myGroupsData.length === 0 ? (
            <p className="text-slate-400 text-lg text-center">
              Aún no tienes misiones. ¡Únete a un grupo para empezar la aventura!
            </p>
          ) : (
            <div className="space-y-10">
              {myGroupsData.map(group => (
                <div key={group.groups_id || group.id} className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl shadow-2xl p-6 border-2 border-indigo-500">
                  
                  {/* Nombre del grupo */}
                  <h3 className="text-3xl font-bold text-indigo-400 mb-6 drop-shadow-md text-center">
                    {group.name}
                  </h3>

                  {/* Contenedor de misiones tipo tablero */}
                  {group.missions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {group.missions.map(mission => {
                        const missionId = mission.mission_id || mission.id;
                        return (
                          <Link to={`/mission/${missionId}`} key={missionId}>
                            <div className="bg-gradient-to-b from-slate-700 to-slate-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-yellow-400 flex flex-col justify-between h-full">
                              <h4 className="font-extrabold text-xl text-yellow-300 mb-3">{mission.nombre}</h4>
                              <p className="text-slate-300 text-sm mb-4"> {mission.description || "Sin descripción"}</p>
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold w-max ${
                                mission.dificultad === 'Alta' ? 'bg-red-500 text-white' :
                                mission.dificultad === 'Media' ? 'bg-yellow-500 text-black' :
                                'bg-green-500 text-black'
                              }`}>
                                {mission.dificultad}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-lg text-center">Este grupo aún no tiene misiones asignadas.</p>
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
