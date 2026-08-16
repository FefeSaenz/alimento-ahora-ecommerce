import React from 'react';

const WhatsAppButton: React.FC = () => {
  const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER; 
  const defaultMessage = "¡Hola! Vengo de la tienda online de ALIMENTO AHORA y necesito ayuda.";
  const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    // Fijate que lo bajamos a z-40 y le sacamos toda la lógica de ocultamiento
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* BURBUJA DE TEXTO */}
      <div className="relative bg-white text-gray-800 px-3 py-2 rounded-2xl shadow-xl border border-gray-100 animate-bounce-pause pointer-events-auto flex items-center justify-center">
        <span className="text-xs font-fredoka font-bold tracking-wide leading-none select-none">¿Te ayudamos?</span>
        {/* El triangulito de la burbuja */}
        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
      </div>

      {/* BOTÓN VERDE WHATSAPP */}
      <a 
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        // Cambiamos el bg-black al verde de WhatsApp (#25D366)
        className="bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:bg-[#1fa952] hover:shadow-2xl transition-all duration-300 hover:scale-110 pointer-events-auto group"
        aria-label="Contactar por WhatsApp"
      >
        <i className="fa-brands fa-whatsapp text-3xl group-hover:rotate-12 transition-transform duration-300"></i>
      </a>
      
    </div>
  );
};

export default WhatsAppButton;