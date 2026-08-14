import React from 'react';
import huellaSvg from '@/src/assets/huella.svg';

interface AnnouncementBarProps {
  messages: string[];
  speed?: number; // Opcional, para controlar la velocidad
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ messages, speed = 60 }) => {
  // Repetimos los mensajes originales 10 veces para asegurarnos de que llenen la pantalla
  const repeatedMessages = Array(10).fill(messages).flat();

  return (
    // Fondo Naranja de la marca
    <div className="bg-brand-primary text-white py-3 overflow-hidden flex">
      <div 
        // Tipografía amigable (Fredoka)
        className="flex items-center w-max text-sm font-fredoka font-bold uppercase tracking-widest"
        style={{ animation: `marquee ${speed}s linear infinite` }}
      >
        {/* Renderizamos el bloque 2 veces para que la animación de la marquesina sea infinita sin cortes */}
        <div className="flex items-center px-4">
          {repeatedMessages.map((msg, idx) => (
            <React.Fragment key={`block1-${idx}`}>
              <span className="px-6 whitespace-nowrap">{msg}</span>
              <img 
                src={huellaSvg} 
                alt="" 
                aria-hidden="true" 
                // Usamos 'invert' por si la huella original es negra, para que se vea blanca
                className="w-4 h-4 invert opacity-90 object-contain" 
              />
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center px-4">
          {repeatedMessages.map((msg, idx) => (
            <React.Fragment key={`block2-${idx}`}>
              <span className="px-6 whitespace-nowrap">{msg}</span>
              <img 
                src={huellaSvg} 
                alt="" 
                aria-hidden="true" 
                className="w-4 h-4 invert opacity-90 object-contain" 
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;