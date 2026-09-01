import React from 'react';
import NavLink from '@/src/components/ui/NavLink';
import { useApp } from '@/src/context/AppContext';
import logoAlimentoAhora from '@/src/assets/logo-alimentoAhora.svg'

const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER; 
const defaultMessage = "¡Hola! Vengo de la tienda online de ALIMENTO AHORA y necesito ayuda.";
const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

interface FooterProps {
  onOpenTerms: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenTerms }) => {
  const { menuItems } = useApp(); 
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isScroll?: boolean) => {
    if (isScroll) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-black text-white pt-20">
      <div className="max-w-360 mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        
        {/* COLUMNA 1: BRANDING (Logo + Eslogan) */}
        <div className="md:col-span-6 flex flex-col gap-1 justify-start items-start md:pt-2">
          <img 
            src={logoAlimentoAhora} 
            alt="ALIMENTO AHORA"
            className="w-48 md:w-56 object-contain"
          />
          {/* Volvemos al naranja (brand-primary) y eliminamos el margin-left para que se alinee con INFORMACIÓN */}
          <p className="text-[17px] font-lilita font-medium text-brand-primary tracking-wide">
            Amor, de a kilos.
          </p>
        </div>

        {/* COLUMNA 2: INFO LINKS */}
        <div className="md:col-span-3">
          <h4 className="text-xl font-lilita tracking-wide mb-6 text-brand-primary uppercase">INFORMACIÓN</h4>
          <ul className="flex flex-col space-y-3">
            {menuItems && menuItems.length > 0 ? (
              menuItems.map((item) => (
                <li key={item.id}>
                  <NavLink 
                    item={item}
                    onClick={handleNavClick}
                    showSubmenu={false}
                    className="text-sm font-sans font-medium tracking-wide text-gray-400 hover:text-brand-primary py-1 transition-colors uppercase"
                  />
                </li>
              ))
            ) : (
              <span className="text-sm font-sans text-gray-400 animate-pulse">CARGANDO MENÚ...</span>
            )}
            
            {/* BOTÓN: TÉRMINOS Y CONDICIONES (Clonado exacto de NavLink) */}
            <li>
              <button 
                onClick={onOpenTerms} 
                className="text-sm font-sans font-medium tracking-wide text-gray-400 hover:text-brand-primary transition-colors cursor-pointer text-left w-full py-1 uppercase opacity-80 hover:opacity-100"
              >
                Términos y condiciones
              </button>
            </li>
          </ul>
        </div>

        {/* COLUMNA 3: REDES SOCIALES */}
        <div className="md:col-span-3">
          <h4 className="text-xl font-lilita tracking-wide mb-6 text-brand-primary uppercase">SEGUINOS</h4>
          <ul className="flex flex-col space-y-4">
            <li>
              <a href="https://www.instagram.com/alimentoahora/" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-sans font-medium tracking-wide text-gray-400 hover:text-brand-primary transition-colors group uppercase opacity-80 hover:opacity-100">
                <i className="fa-brands fa-instagram text-lg group-hover:scale-110 transition-transform"></i> INSTAGRAM
              </a>
            </li>
            <li>
              <a href={waLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-sans font-medium tracking-wide text-gray-400 hover:text-brand-primary transition-colors group uppercase opacity-80 hover:opacity-100">
                <i className="fa-brands fa-whatsapp text-lg group-hover:scale-110 transition-transform"></i> WHATSAPP
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* COPYRIGHT DINÁMICO (Limpio y centrado) */}
      <div className="mt-16 md:mt-24 border-t border-gray-900">
          <div className='max-w-360 mx-auto px-6 py-8 flex justify-center text-center'>
            <p className="text-xs font-sans tracking-wide text-gray-600 uppercase">
              © {new Date().getFullYear()} ALIMENTO AHORA. PARANÁ, ENTRE RÍOS. TODOS LOS DERECHOS RESERVADOS.
            </p>
          </div>
      </div>
    </footer>
  );
};

export default Footer;