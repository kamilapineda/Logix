import { useEffect } from 'react';
import { getQuestionsAPI } from '../services/api';

function TestQuestions() {
  useEffect(() => {
    const testFetch = async () => {
      try {
        console.log("--- INICIANDO PRUEBA DE CARGA DE PREGUNTAS ---");
        const questions = await getQuestionsAPI();
        console.log("--- DATOS RECIBIDOS DEL BACKEND ---");
        console.table(questions); // Muestra los datos en una tabla clara
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
export default TestQuestions;