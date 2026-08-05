import React from 'react';

interface EmptyStateProps {
  message: string;
  icon?: string; // Ejemplo: "fa-shopping-bag" o "fa-magnifying-glass"
  children?: React.ReactNode; // Por si querés poner un botón de "Reiniciar filtros"
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon, children }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in duration-700">
      {icon && (
        <div className="mb-6 text-gray-200">
          <i className={`fa-solid ${icon} text-6xl`}></i>
        </div>
      )}
      <h3 className="text-[11px] font-black uppercase tracking-[4px] text-gray-400 max-w-62.5 leading-relaxed">
        {message}
      </h3>
      {children && <div className="mt-10">{children}</div>}
    </div>
  );
};

export default EmptyState;