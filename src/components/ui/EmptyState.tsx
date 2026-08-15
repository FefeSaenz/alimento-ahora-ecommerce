import React from 'react';

interface EmptyStateProps {
  message: string;
  icon?: string; // Ejemplo: "fa-basket-shopping" o "fa-magnifying-glass"
  children?: React.ReactNode; // Por si querés poner un botón de "Reiniciar filtros"
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon, children }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in duration-700">
      {icon && (
        <div className="mb-6 text-orange-100">
          <i className={`fa-solid ${icon} text-7xl`}></i>
        </div>
      )}
      {/* Texto Fredoka amigable */}
      <h3 className="text-lg font-fredoka font-semibold text-gray-500 max-w-62.5 leading-relaxed">
        {message}
      </h3>
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
};

export default EmptyState;