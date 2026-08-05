import React from 'react';

const WhatsAppButton: React.FC = () => {
  const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER; 
  const defaultMessage = "¡Hola! Vengo de la tienda online de ALIMENTO AHORA y necesito ayuda.";
  const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    // Fijate que lo bajamos a z-40 y le sacamos toda la lógica de ocultamiento
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* BURBUJA DE TEXTO */}
      <div className="relative bg-white text-black px-2.5 py-2.5 rounded-sm shadow-2xl border border-gray-100 animate-bounce-pause pointer-events-auto flex items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-[2px] leading-none select-none">¿Te podemos ayudar?</span>
        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
      </div>

      {/* BOTÓN NEGRO */}
      <a 
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-black text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:bg-[#25D366] transition-all duration-300 hover:scale-110 pointer-events-auto group"
        aria-label="Contactar por WhatsApp"
      >
        <i className="fa-brands fa-whatsapp text-3xl group-hover:rotate-12 transition-transform duration-300"></i>
      </a>
      
    </div>
  );
};

export default WhatsAppButton;