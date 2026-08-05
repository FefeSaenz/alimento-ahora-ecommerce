import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definimos la estructura del usuario autenticado
export interface User {
    email: string;
    token: string;
    // Más adelante acá puede venir el ID del usuario, nombre, etc.
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Al cargar la app, buscamos si hay una sesión guardada
    useEffect(() => {
        const storedToken = localStorage.getItem('pulso_token');
        const storedEmail = localStorage.getItem('pulso_email');

        if (storedToken && storedEmail) {
            setUser({ email: storedEmail, token: storedToken });
        }
        setIsInitialized(true);
    }, []);

    // Función para loguear (la vamos a usar en el Checkout y en el Drawer)
    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('pulso_token', userData.token);
        localStorage.setItem('pulso_email', userData.email);
    };

    // Función para cerrar sesión
    const logout = () => {
        setUser(null);
        localStorage.removeItem('pulso_token');
        localStorage.removeItem('pulso_email');
    };

    // Evita parpadeos mientras lee el localStorage al recargar la página
    if (!isInitialized) return null;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};