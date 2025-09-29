import { useEffect } from 'react';
import { getGroupsAPI, getMissionsAPI } from '../services/api';

function TestData() {
  useEffect(() => {
    // Función para probar la carga de datos desde el backend
    const testFetch = async () => {
      try {
        console.log("--- CARGANDO GRUPOS ---");
        const groups = await getGroupsAPI();  // Llama API de grupos
        console.table(groups);

        console.log("--- CARGANDO MISIONES ---");
        const missions = await getMissionsAPI(); // Llama API de misiones
        console.table(missions);
      } catch (error) {
        console.error("--- ERROR EN LA PRUEBA ---", error); // Captura errores
      }
    };
    testFetch(); // Ejecuta prueba al montar componente
  }, []);

  return (
    <div className="bg-slate-900 text-white p-10">
      <h1 className="text-3xl">Realizando prueba. Revisa la consola (F12).</h1>
    </div>
  );
}
export default TestData;