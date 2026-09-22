import React from 'react';
import { Cupcake } from '../models/types';
import { 
  Plus, 
  Check, 
  AlertCircle, 
  Star, 
  Info, 
  Flame, 
  Wheat, 
  Milk, 
  Egg, 
  Nut
} from 'lucide-react';

interface CupcakeCardProps {
  cupcake: Cupcake;
  onSelect: (cupcake: Cupcake) => void;
  onAddToCart: (cupcake: Cupcake) => void;
  isAddedAnimation?: boolean;
}

export const CupcakeCard: React.FC<CupcakeCardProps> = ({
  cupcake,
  onSelect,
  onAddToCart,
  isAddedAnimation
}) => {
  const isOutOfStock = cupcake.stock <= 0;

  const getAllergenIcon = (allergen: string) => {
    switch (allergen) {
      case 'Glúten':
        return <span title="Contém Glúten" className="inline-flex"><Wheat className="w-3 h-3 text-amber-700" /></span>;
      case 'Lactose':
        return <span title="Contém Lactose" className="inline-flex"><Milk className="w-3 h-3 text-sky-700" /></span>;
      case 'Ovos':
        return <span title="Contém Ovos" className="inline-flex"><Egg className="w-3 h-3 text-amber-600" /></span>;
      case 'Nozes / Castanhas':
        return <span title="Contém Nozes / Castanhas" className="inline-flex"><Nut className="w-3 h-3 text-orange-700" /></span>;
      default:
        return <span title={allergen} className="inline-flex"><AlertCircle className="w-3 h-3 text-stone-500" /></span>;
    }
  };

  return (
    <div 
      className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden shadow-xs hover:shadow-md ${
        isOutOfStock ? 'opacity-80 border-stone-200' : 'border-stone-200 hover:border-rose-300'
      }`}
    >
      {/* Product Image Area */}
      <div 
        className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden cursor-pointer"
        onClick={() => onSelect(cupcake)}
      >
        <img
          src={cupcake.image}
          alt={cupcake.name}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-stone-900/80 backdrop-blur-xs text-white shadow-xs">
          {cupcake.category}
        </span>

        {/* Stock status or Promo badge */}
        {isOutOfStock ? (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-stone-800 text-white shadow-xs">
            Esgotado
          </span>
        ) : cupcake.promoPrice ? (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-600 text-white shadow-xs">
            Promoção
          </span>
        ) : (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-stone-700 backdrop-blur-xs flex items-center gap-1 shadow-xs">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {cupcake.rating.toFixed(1)}
          </span>
        )}

        {/* Quick view button overlay */}
        <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-3 py-1.5 bg-white/95 backdrop-blur-xs text-stone-900 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-rose-600" />
            Ver Detalhes
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title & Description */}
          <h4 
            onClick={() => onSelect(cupcake)}
            className="text-sm font-bold text-stone-900 line-clamp-1 hover:text-rose-600 cursor-pointer transition-colors"
          >
            {cupcake.name}
          </h4>
          
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {cupcake.description}
          </p>

          {/* Allergens row */}
          <div className="mt-2.5 pt-2 border-t border-stone-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-stone-400 font-semibold uppercase">Alérgenos:</span>
            {cupcake.allergens.map((allergen, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-100 text-[10px] font-medium text-stone-700"
              >
                {getAllergenIcon(allergen)}
                <span>{allergen}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Price and Add Action */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-stone-400 block font-medium">Preço unitário</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-stone-900">
                R$ {(cupcake.promoPrice || cupcake.price).toFixed(2).replace('.', ',')}
              </span>
              {cupcake.promoPrice && (
                <span className="text-xs text-stone-400 line-through">
                  R$ {cupcake.price.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>
          </div>

          <button
            id={`add-btn-${cupcake.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) onAddToCart(cupcake);
            }}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                : isAddedAnimation
                ? 'bg-emerald-600 text-white scale-95'
                : 'bg-rose-600 hover:bg-rose-700 text-white hover:shadow-md hover:shadow-rose-600/20 active:scale-95'
            }`}
            title={isOutOfStock ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
          >
            {isOutOfStock ? (
              <span>Esgotado</span>
            ) : isAddedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Adicionado!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
