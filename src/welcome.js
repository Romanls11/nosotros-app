import { createContext, useContext } from 'react';

// Permite volver a mostrar la bienvenida desde Ajustes
export const WelcomeContext = createContext(() => {});
export const useShowWelcome = () => useContext(WelcomeContext);
