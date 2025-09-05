import { useState, createContext, useEffect } from 'react';

// 1. Creamos el "tablón de anuncios" (Contexto)
export const AuthContext = createContext();

// 2. Creamos el componente "Proveedor" que publicará la información
export const AuthProvider = ({ children }) => {
  // Esta es la "memoria" o el estado que compartiremos
  const [user, setUser] = useState(null); // Empieza como null porque no hay nadie logueado

  // Esta es la función que los componentes usarán para iniciar sesión
  const login = (userData) => {
    setUser(userData);
  };

  // Esta es la función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // 3. Publicamos la información en el "tablón" para que otros la lean
  //    Compartimos el estado del usuario, y las funciones para cambiarlo.
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};