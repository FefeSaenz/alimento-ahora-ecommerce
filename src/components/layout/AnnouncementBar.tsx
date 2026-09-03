import React from 'react';
import huellaSvg from '@/src/assets/huella.svg';

interface AnnouncementBarProps {
  messages: string[];
  speed?: number;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ messages, speed = 60 }) => {
  const repeatedMessages = Array(15).fill(messages).flat();

  return (
    <div className="bg-brand-primary text-white py-2 overflow-hidden flex relative w-full">
    
      <div 
        className="flex w-max animate-marquee-base items-center text-xs font-fredoka font-bold uppercase tracking-widest"
        style={{ animationDuration: `${speed}s` }}
      >
        
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