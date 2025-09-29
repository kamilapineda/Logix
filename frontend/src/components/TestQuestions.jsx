import { useEffect } from 'react';
import { getQuestionsAPI } from '../services/api';

function TestQuestions() {
  useEffect(() => {
    // Función para probar la carga de preguntas desde el backend
    const testFetch = async () => {
      try {
        console.log("--- INICIANDO PRUEBA DE CARGA DE PREGUNTAS ---");
        const questions = await getQuestionsAPI(); // Llama API de preguntas
        console.log("--- DATOS RECIBIDOS DEL BACKEND ---");
        console.table(questions); // Muestra los datos en una tabla
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
export default TestQuestions;