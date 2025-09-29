const express = require('express');
const multer = require('multer');
const supabase = require('../config/supabaseClient');
const router = express.Router();

// Configuración de multer para guardar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Subir archivo al bucket "uploads" en Supabase
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió archivo' });
    }

    // Generar nombre único para el archivo
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `questions/${fileName}`;  // Guardar en carpeta "questions"

    // Subir archivo a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false, // no sobrescribir
      });

    if (uploadError) throw uploadError;

    // Responder con la ruta del archivo
    res.json({ path: filePath });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
