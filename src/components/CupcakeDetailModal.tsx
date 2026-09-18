import React, { useState } from 'react';
import { Cupcake } from '../types';
import { 
  X, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Wheat, 
  Milk, 
  Egg, 
  Nut, 
  Flame, 
  CheckCircle, 
  AlertTriangle,
  Star,
  ShieldCheck
} from 'lucide-react';

interface Props {
  cupcake: Cupcake | null;
  onClose: () => void;
  onAddToCart: (cupcake: Cupcake, quantity: number) => void;
}

export const CupcakeDetailModal: React.FC<Props> = ({
  cupcake,
  onClose,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!cupcake) return null;

  const isOutOfStock = cupcake.stock <= 0;
  const unitPrice = cupcake.promoPrice || cupcake.price;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(cupcake, quantity);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 600);
  };

  const getAllergenBadge = (allergen: string) => {
    switch (allergen) {
      case 'Glúten':
        return (
          <span key={allergen} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
            <Wheat className="w-4 h-4 text-amber-700" />
            Contém Glúten
          </span>
        );
      case 'Lactose':
        return (
          <span key={allergen} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 text-xs font-semibold">
            <Milk className="w-4 h-4 text-sky-700" />
            Contém Lactose
          </span>
        );
      case 'Ovos':
        return (
          <span key={allergen} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-900 border border-orange-200 text-xs font-semibold">
            <Egg className="w-4 h-4 text-orange-600" />
            Contém Ovos
          </span>
        );
      case 'Nozes / Castanhas':
        return (
          <span key={allergen} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100/60 text-amber-950 border border-amber-300 text-xs font-semibold">
            <Nut className="w-4 h-4 text-amber-800" />
            Contém Nozes / Castanhas
          </span>
        );
      default:
        return (
          <span key={allergen} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-stone-600" />
            {allergen}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative aspect-16/9 sm:aspect-21/9 w-full bg-stone-100 overflow-hidden">
          <img
            src={cupcake.image}
            alt={cupcake.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80';
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent"></div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center transition-colors backdrop-blur-xs shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4 text-white">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 shadow-xs mb-1.5 inline-block">
                {cupcake.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-display leading-tight">
                {cupcake.name}
              </h3>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{cupcake.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-700">
          
          {/* Description */}
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Sobre a Receita Artesanal
            </span>
            <p className="text-sm text-stone-600 leading-relaxed">
              {cupcake.description}
            </p>
          </div>

          {/* Allergen Warning Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Segurança Alimentar & Alérgenos
              </span>
            </div>
            <p className="text-xs text-amber-800">
              Informação mandatória para transparência ao consumidor. Verifique a presença de ingredientes sensíveis:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {cupcake.allergens.length > 0 ? (
                cupcake.allergens.map(al => getAllergenBadge(al))
              ) : (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  Livre dos principais alérgenos comuns
                </span>
              )}
            </div>
          </div>

          {/* Full Ingredients List */}
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">
              Lista Completa de Ingredientes
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {cupcake.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span className="text-stone-700">{ing}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <span className="text-[10px] uppercase text-stone-400 block font-semibold">Estoque Atual</span>
              <span className={`text-sm font-bold font-mono ${isOutOfStock ? 'text-red-600' : 'text-stone-900'}`}>
                {isOutOfStock ? '0 (Esgotado)' : `${cupcake.stock} unidades`}
              </span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <span className="text-[10px] uppercase text-stone-400 block font-semibold">Valor Energético</span>
              <span className="text-sm font-bold font-mono text-stone-900">
                {cupcake.calories || 280} kcal
              </span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase text-stone-400 block font-semibold">Origem</span>
              <span className="text-sm font-bold text-stone-900">Produção Diária</span>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Total</span>
              <span className="text-xl font-extrabold text-stone-900">
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center bg-white rounded-xl border border-stone-200 p-1 shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold font-mono text-stone-900 text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(cupcake.stock, quantity + 1))}
                  disabled={quantity >= cupcake.stock}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : addedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-95'
            }`}
          >
            {isOutOfStock ? (
              <span>Produto Indisponível no Estoque</span>
            ) : addedSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Adicionado com Sucesso!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Adicionar ao Carrinho</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
