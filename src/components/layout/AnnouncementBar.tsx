import React from 'react';
import huellaSvg from '@/src/assets/huella.svg';

interface AnnouncementBarProps {
  messages: string[];
  speed?: number; // Opcional, para controlar la velocidad
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ messages, speed = 60 }) => {
  // Repetimos los mensajes originales un par de veces para llenar la pantalla sobradamente.
  const repeatedMessages = Array(15).fill(messages).flat();

  return (
    // Fondo Naranja de la marca
    <div className="bg-brand-primary text-white py-3 overflow-hidden flex relative w-full">
      
      {/* 
        Inyectamos los Keyframes directamente acá para que no dependas del tailwind.config.js
        La animación mueve el contenedor desde el 0% de su propio ancho hasta el -50%.
        Como el contenedor tiene 2 copias idénticas del texto adentro, al llegar al -50% 
        vuelve al 0% mágicamente y parece infinito.
      */}
      <style>{`
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: scrollMarquee ${speed}s linear infinite;
        }
      `}</style>

      <div className="flex w-max animate-marquee items-center text-sm font-fredoka font-bold uppercase tracking-widest">
        
        {/* Renderizamos DOS VECES exactamente el mismo bloque de textos enteros */}
        {/* Así nos aseguramos de que cuando la animación llegue a la mitad, el segundo bloque 
            esté ocupando la posición exacta del primero y el reinicio sea invisible. */}
        
        {/* MITAD 1 */}
        <div className="flex items-center">
          {repeatedMessages.map((msg, idx) => (
            <React.Fragment key={`block1-${idx}`}>
              <span className="px-6 whitespace-nowrap">{msg}</span>
              <img 
                src={huellaSvg} 
                alt="" 
                aria-hidden="true" 
                className="w-4 h-4 invert opacity-90 object-contain mx-2 shrink-0" 
              />
            </React.Fragment>
          ))}
        </div>

        {/* MITAD 2 */}
        <div className="flex items-center">
          {repeatedMessages.map((msg, idx) => (
            <React.Fragment key={`block2-${idx}`}>
              <span className="px-6 whitespace-nowrap">{msg}</span>
              <img 
                src={huellaSvg} 
                alt="" 
                aria-hidden="true" 
                className="w-4 h-4 invert opacity-90 object-contain mx-2 shrink-0" 
              />
            </React.Fragment>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AnnouncementBar;