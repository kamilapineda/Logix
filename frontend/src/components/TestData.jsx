import { useEffect } from 'react';
import { getGroupsAPI, getMissionsAPI } from '../services/api';

function TestData() {
  useEffect(() => {
    const testFetch = async () => {
      try {
        console.log("--- CARGANDO GRUPOS ---");
        const groups = await getGroupsAPI();
        console.table(groups);

        console.log("--- CARGANDO MISIONES ---");
        const missions = await getMissionsAPI();
        console.table(missions);
      } catch (error) {
        console.error("--- ERROR EN LA PRUEBA ---", error);
      }
    };
    testFetch();
  }, []);

  return (
    <div className="bg-slate-900 text-white p-10">
      <h1 className="text-3xl">Realizando prueba. Revisa la consola (F12).</h1>
    </div>
  );
}
export default TestData;