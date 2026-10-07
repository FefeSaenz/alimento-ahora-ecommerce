import { useEffect } from 'react';
import { CHECKOUT_DRAFT_KEY } from '@/src/constants/storage';

const TTL = 30 * 60 * 1000; // 30 minutos

/**
 * Ofuscación ligera (Base64 sobre bytes UTF-8) del borrador antes de guardarlo en localStorage.
 * Evita dejar PII legible en texto plano ante scrapers o lecturas casuales; NO es cifrado:
 * quien tenga acceso al código puede revertirlo.
 * Se pasa por TextEncoder porque btoa() solo admite Latin1 y rompe con "ñ", tildes, etc.
 */
const encodeDraft = (value: unknown): string => {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
};

const decodeDraft = (encoded: string): any => {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
};

export const useCheckoutPersistence = (formData: any, setFormData: (data: any) => void) => {
    // Cargar datos al iniciar
    useEffect(() => {
        const saved = localStorage.getItem(CHECKOUT_DRAFT_KEY);
        if (saved) {
            try {
                const { data, timestamp } = decodeDraft(saved);
                if (Date.now() - timestamp < TTL) {
                    setFormData((prev: any) => ({ ...prev, ...data }));
                } else {
                    localStorage.removeItem(CHECKOUT_DRAFT_KEY);
                }
            } catch (error) {
                localStorage.removeItem(CHECKOUT_DRAFT_KEY);
            }
        }
    }, [setFormData]);

    // Guardar datos al cambiar
    useEffect(() => {
        const hasData = Object.values(formData).some(val => val !== '');
        if (hasData) {
            localStorage.setItem(CHECKOUT_DRAFT_KEY, encodeDraft({
                data: formData,
                timestamp: Date.now()
            }));
        }
    }, [formData]);

    const clearPersistence = () => localStorage.removeItem(CHECKOUT_DRAFT_KEY);

    return { clearPersistence };
};