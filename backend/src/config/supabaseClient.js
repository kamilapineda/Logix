// 1. Importamos la herramienta 'dotenv' para leer nuestro archivo .env
require('dotenv').config();

// 2. Importamos la función para crear un cliente de Supabase
const { createClient } = require('@supabase/supabase-js');

// 3. Leemos la URL y la llave desde nuestras variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// 4. Creamos el cliente (el "puente") con nuestras credenciales
const supabase = createClient(supabaseUrl, supabaseKey);

// 5. Exportamos el puente para poder usarlo en otras partes de la aplicación
module.exports = supabase;