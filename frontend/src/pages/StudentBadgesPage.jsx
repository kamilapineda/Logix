import { useEffect, useState, useContext } from "react";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";

function StudentBadges() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [lastScore, setLastScore] = useState(0);
  const [newBadge, setNewBadge] = useState(null);

  // Nombres y iconos
  const badgeNames = [
    "Explorador Novato","Cazador de Conocimiento","Maestro Curioso","Arquitecto de Código",
    "Destructor de Bugs","Gurú de la Lógica","Alquimista Digital","Viajero del Tiempo",
    "Sabio del Algoritmo","Guerrero del Debug","Artista del Código","Mago del Reintento",
    "Cronista de Misiones","Visionario de la Data","Defensor de la Limpieza","Ingeniero Oculto",
    "Explorador del Pixel","Navegante del Menú","Conquistador de Retos","Creador de Patrones",
    "Centinela del Error","Campeón del XP","Maestro del Nivel","Vigilante de Misiones",
    "Forjador de Soluciones","Dominador del Score","Conquistador de la Red","Erudito Digital",
    "Señor de la Experiencia","Líder del Progreso","Innovador Intrépido","Aventurero Cibernético",
    "Explorador Legendario","Sabio Iluminado","Alquimista del Saber","Guerrero Experto",
    "Maestro Supremo","Visionario del Código","Oráculo del Debug","Artista Experto",
    "Mago del XP","Cronista Legendario","Arquitecto Supremo","Navegante Estelar",
    "Campeón del Conocimiento","Defensor de la Lógica","Conquistador de la Experiencia","Gran Forjador"
  ];

  const icons = [
    "https://img.icons8.com/color/96/star.png",
    "https://img.icons8.com/color/96/rocket.png",
    "https://img.icons8.com/color/96/magic-wand.png",
    "https://img.icons8.com/color/96/trophy.png",
    "https://img.icons8.com/color/96/crown.png",
    "https://img.icons8.com/color/96/medal.png",
    "https://img.icons8.com/color/96/diamond.png",
    "https://img.icons8.com/color/96/gemstone.png"
  ];

  // Fetch de stats y generar badges
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/stats/student/${user.id}`);
        const data = await res.json();
        setStats(data);
        setLoading(false);

        const totalScore = data.total_score || 0;

        // Generar 50 badges con dificultad progresiva
        const generatedBadges = Array.from({ length: 50 }, (_, i) => {
          const score =
            i < 10 ? 50 + i*50 :
            i < 20 ? 500 + (i-10)*100 :
            i < 30 ? 1500 + (i-20)*200 :
            i < 40 ? 3500 + (i-30)*300 :
            6500 + (i-40)*400;
          
          return {
            id: i + 1,
            nombre: badgeNames[i % badgeNames.length],
            descripcion: `Gana ${score} puntos para desbloquear`,
            score,
            icono: icons[i % icons.length],
            earned: totalScore >= score,
            category: i < 10 ? "inicio" : i < 30 ? "progreso" : "experto"
          };
        });

        setBadges(generatedBadges);

        // Detectar la última insignia desbloqueada
        const unlockedBadges = generatedBadges.filter(
          b => b.earned && lastScore < b.score
        );

        if (unlockedBadges.length > 0) {
          const latestBadge = unlockedBadges[unlockedBadges.length - 1];
          const lastBadgeShown = localStorage.getItem("lastBadgeId");

          if (lastBadgeShown !== String(latestBadge.id)) {
            setNewBadge(latestBadge);
            localStorage.setItem("lastBadgeId", latestBadge.id);
          }
        }

        setLastScore(totalScore);
      } catch (err) {
        setError("Error al cargar estadísticas");
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, lastScore]);

  if (loading) return <p className="text-white text-center p-6">Cargando...</p>;
  if (error) return <p className="text-red-500 text-center p-6">{error}</p>;

  const categories = [...new Set(badges.map(b => b.category))];

  const renderBadgeCard = (badge) => (
    <div key={badge.id} className="flex flex-col items-center p-4 transition-transform transform hover:scale-110">
      <div
        className={`
          w-28 h-28 rounded-full flex items-center justify-center
          bg-gradient-to-tr from-slate-800 to-slate-700
          ${badge.earned ? "border-4 border-yellow-400 animate-glow-slow" : "border-2 border-gray-600 opacity-50"}
        `}
      >
        <img src={badge.icono} alt={badge.nombre} className="w-16 h-16 object-contain" />
      </div>
      <h2 className="mt-3 text-lg font-bold text-center">{badge.nombre}</h2>
      <p className="text-sm text-center">{badge.descripcion}</p>
      {badge.earned && <p className="mt-1 text-yellow-400 font-bold animate-pulse">¡Desbloqueada!</p>}
    </div>
  );

  return (
    <div className="bg-slate-900 min-h-screen text-white">
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-center text-yellow-400">Mis Insignias</h1>
        {categories.map(cat => (
          <div key={cat} className="mb-12">
            <h2 className={`text-2xl font-semibold mb-4 ${
              cat === "inicio" ? "text-yellow-400" :
              cat === "progreso" ? "text-blue-400" : "text-purple-400"
            }`}>
              {cat === "inicio" ? "Retos de Inicio" : cat === "progreso" ? "Retos de Progresión" : "Retos Expertos"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {badges.filter(b => b.category === cat).map(renderBadgeCard)}
            </div>
          </div>
        ))}
      </div>

      {/* Popup de nueva insignia */}
      {newBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-2xl w-80 flex flex-col items-center animate-fade-in">
            
            {/* Icono con glow */}
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center mb-4 animate-glow-slow">
              <img src={newBadge.icono} alt={newBadge.nombre} className="w-16 h-16 object-contain"/>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 text-center drop-shadow-lg">¡Nueva Insignia!</h2>
            <p className="text-white text-center mb-3">{newBadge.nombre}</p>

            <button
              className="mt-2 px-5 py-2 rounded-xl font-semibold bg-white text-yellow-500 hover:bg-gray-200"
              onClick={() => setNewBadge(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/*Animaciones y glow */}
      <style>{`
        @keyframes glow-slow {
          0%, 100% { box-shadow: 0 0 15px 5px rgba(252,211,77,0.7); }
          50% { box-shadow: 0 0 30px 10px rgba(252,211,77,1); }
        }
        .animate-glow-slow {
          animation: glow-slow 2.5s infinite alternate;
          border-radius: 50%;
        }

        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default StudentBadges;
