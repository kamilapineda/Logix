import { useState, useEffect } from "react";
import { getSignedUrl } from "../services/storage";

function OptionImage({ path }) {
  const [url, setUrl] = useState(null); // Estado para guardar la URL firmada

  useEffect(() => {
    // Obtiene la URL firmada cuando cambia la ruta
    (async () => {
      const signed = await getSignedUrl(path);
      setUrl(signed);
    })();
  }, [path]);

  if (!url) return <div className="text-gray-400">Cargando...</div>;

  return <img src={url} alt="opción" className="rounded-lg max-h-40" />;
}

export default OptionImage;
