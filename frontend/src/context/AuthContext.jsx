import { createContext, useState, useEffect } from "react";
import { getProfileAPI } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Estado inicial: intenta leer usuario de localStorage
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

    // Inicia sesión guardando datos de usuario
  const login = (userData) => {
    setUser(userData);
  };

    // Cierra sesión limpiando backend y localStorage
  const logout = async () => {
    try {
      await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    localStorage.removeItem("user");
  };

  // Al montar: valida cookie y recupera perfil
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const profile = await getProfileAPI(); // usa credentials:'include'
        if (!mounted) return;
        setUser(profile);
      } catch (err) {
        console.warn("No se pudo recuperar perfil:", err.message || err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Sincroniza cambios de user con localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

    // Provee contexto a los hijos
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
