import React from 'react';
import { Link } from 'react-router-dom';
import { Dog, Cat } from 'lucide-react';
import SectionTitle from '@/src/components/ui/SectionTitle';

const CATEGORIES = [
  { id: 'perros', label: 'Perros', icon: Dog, to: '/productos?especie=Perro' },
  { id: 'gatos', label: 'Gatos', icon: Cat, to: '/productos?especie=Gato' },
];

const QuickCategories: React.FC = () => {
  return (
    <section aria-label="Categorías rápidas">
      <SectionTitle title="Categorías" />
      <div className="max-w-360 mx-auto px-6 grid grid-cols-2 gap-6 md:gap-8 md:max-w-3xl">
        {CATEGORIES.map(({ id, label, icon: Icon, to }) => (
          <Link
            key={id}
            to={to}
            className="group flex flex-col md:flex-row items-center justify-center gap-2 md:gap-5 rounded-2xl border-2 border-gray-100 bg-white px-3 py-8 md:px-6 md:py-10 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <span className="flex h-14 w-14 md:h-20 md:w-20 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary transition-colors duration-300 group-hover:bg-brand-primary group-hover:text-white">
              <Icon className="h-7 w-7 md:h-10 md:w-10" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="font-lilita text-xl md:text-3xl tracking-wide text-gray-800 group-hover:text-brand-primary transition-colors">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickCategories;
