import React from 'react';
import { Truck, MessageCircle, Award, ShieldCheck } from 'lucide-react';

const BADGES = [
  { id: 'envios', icon: Truck, title: 'Envíos en el día', subtitle: 'Pedí temprano y lo recibís hoy' },
  { id: 'asesoramiento', icon: MessageCircle, title: 'Asesoramiento por WhatsApp', subtitle: 'Te ayudamos a elegir el alimento ideal' },
  { id: 'marcas', icon: Award, title: 'Mejores Marcas', subtitle: 'Alimento premium para tu mascota' },
  { id: 'compra', icon: ShieldCheck, title: 'Compra Segura', subtitle: 'Atención personalizada en cada pedido' },
];

const TrustBadges: React.FC = () => {
  return (
    <section aria-label="Beneficios de comprar con nosotros" className="w-full border-b border-gray-100 bg-gray-50 -mt-10">
      <ul className="max-w-360 mx-auto px-6 py-6 md:py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
        {BADGES.map(({ id, icon: Icon, title, subtitle }) => (
          <li key={id} className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
              <Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-fredoka font-bold text-gray-800 leading-tight">{title}</p>
              <p className="font-fredoka text-sm text-gray-500 leading-snug">{subtitle}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TrustBadges;
