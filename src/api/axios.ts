import axios from "axios";
import { ApiResponse } from "@/src/types/api";

// Helper: Generador de UUID seguro para todos los entornos
const generateSafeUUID = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID(); // <-- PRODUCCIÓN (Vercel) / Localhost
  }
  // <-- CELULAR / Red Local (HTTP)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Evento global: axios vive fuera de React y no puede navegar; avisa y la app reacciona (ver AppContent)
export const SESSION_EXPIRED_EVENT = 'session-expired';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 8000,
});

// Interceptor: Gestión de Sesión
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('alimento_token'); 
    let guestId = localStorage.getItem('alimento_guest_id');
    
    if (!guestId) {
        // Usamos la función segura en vez del crypto directo
        guestId = generateSafeUUID();
        localStorage.setItem('alimento_guest_id', guestId);
    }

    if (!config.headers) config.headers = {} as any;

    config.headers['X-Guest-ID'] = guestId;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => Promise.reject(error));

// INTERCEPTOR DE RESPUESTAS (Manejo de errores)
api.interceptors.response.use(
    (response) => response, 
    (error) => {
        // Solo hay "sesión expirada" si existía una sesión (evita reaccionar a 401 de invitados, ej. código OTP inválido)
        if (error.response?.status === 401 && localStorage.getItem('alimento_token')) {
            console.warn("Sesión expirada. Notificando a la app...");
            window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
        }
        return Promise.reject(error);
    }
);

// Servicios de Tienda
export const getFrontData = async (): Promise<ApiResponse['data']> => {
    const response = await api.get<ApiResponse>("/shop/page/");
    return response.data.data;
};

// Flujo de Autenticación
export const requestLoginCode = async (email: string) => {
    return await api.post("/shop/auth/", { email });
};

export const verifyLoginCode = async (email: string, code: string) => {
    return await api.post("/shop/verify/", { email, code });
};

export default api;