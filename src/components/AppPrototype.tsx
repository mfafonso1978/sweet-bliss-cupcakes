import React, { useState } from 'react';
import { Cupcake, CupcakeCategory } from '../types';
import { CupcakeCard } from './CupcakeCard';
import { 
  Search, 
  Sparkles, 
  ShoppingBag, 
  Bike, 
  PackageCheck, 
  X, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  ArrowDown,
  RotateCcw
} from 'lucide-react';

interface Props {
  cupcakes: Cupcake[];
  onSelectCupcake: (cupcake: Cupcake) => void;
  onAddToCart: (cupcake: Cupcake) => void;
  addedCupcakeId: string | null;
  onOpenCart: () => void;
  cartCount: number;
}

export const AppPrototype: React.FC<Props> = ({
  cupcakes,
  onSelectCupcake,
  onAddToCart,
  addedCupcakeId,
  onOpenCart,
  cartCount
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CupcakeCategory>('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [allergenFilter, setAllergenFilter] = useState<string | null>(null);

  const categories: CupcakeCategory[] = ['Todas', 'Gourmet', 'Vegano', 'Zero Açúcar', 'Sazonais'];

  const hasActiveFilters = selectedCategory !== 'Todas' || searchTerm.trim() !== '' || allergenFilter !== null;

  const handleResetFilters = () => {
    setSelectedCategory('Todas');
    setSearchTerm('');
    setAllergenFilter(null);
  };

  const handleViewFullMenu = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    handleResetFilters();
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredCupcakes = cupcakes.filter((c) => {
    const matchesCat = selectedCategory === 'Todas' || c.category === selectedCategory;

    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ingredients.some(i => i.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.allergens.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAllergen = allergenFilter ? !c.allergens.includes(allergenFilter as any) : true;

    return matchesCat && matchesSearch && matchesAllergen;
  });

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner with Artisanal Bakery Vibe */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-rose-950 to-stone-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.18),transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-rose-200 text-xs font-semibold border border-white/10">
              <Sparkles className="w-4 h-4 text-rose-300" />
              <span>Confeitaria Artesanal • Feito à mão com amor</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-display leading-[1.15] tracking-tight">
              Doces artesanais que <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-300">encantam</span> seu dia.
            </h1>

            <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed max-w-xl">
              Cupcakes frescos com massa aerada, recheios cremosos e coberturas especiais. Peça online e receba embalado com carinho na sua porta.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleViewFullMenu}
                className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition-all hover:scale-102 active:scale-98 inline-flex items-center gap-2 cursor-pointer"
                title="Exibir todos os produtos sem nenhum filtro aplicado"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ver Cardápio Completo</span>
              </button>

              {cartCount > 0 ? (
                <button
                  onClick={onOpenCart}
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-rose-300" />
                  <span>Ver Meu Carrinho ({cartCount})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleViewFullMenu}
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <ArrowDown className="w-4 h-4 text-rose-300" />
                  <span>Conhecer Sabores</span>
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-stone-300">
              <span className="flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-rose-400" />
                Entrega Rápida em até 45 min
              </span>
              <span className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-rose-400" />
                PIX com QR Code Dinâmico
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                Ingredientes 100% Selecionados
              </span>
            </div>
          </div>

          {/* Featured Highlight Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl blur-md opacity-30"></div>
              <div className="relative rounded-3xl bg-stone-900 border border-white/10 overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
                  alt="Destaque Confeitaria Artesanal"
                  referrerPolicy="no-referrer"
                  className="w-full h-72 object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-stone-950/75 backdrop-blur-md border border-white/20 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-400/40 mb-1">
                        <Sparkles className="w-2.5 h-2.5 text-rose-300" />
                        O Queridinho
                      </span>
                      <h4 className="font-bold text-sm text-white">Red Velvet Especial</h4>
                    </div>
                    <span className="text-xs font-extrabold bg-rose-600 text-white px-2.5 py-1 rounded-lg shadow-sm">
                      R$ 14,50
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Buying Experience Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Facilidade & Praticidade
            </span>
            <h3 className="text-xl font-bold font-display text-stone-900 mt-1">
              Como funciona seu pedido
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Peça seus doces favoritos com total comodidade, rapidez e segurança:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Escolha seus Cupcakes</h4>
                <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                  Explore nosso cardápio com opções Gourmet, Veganas, Zero Açúcar ou Sazonais.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Pagamento Flexível</h4>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Pague com PIX com confirmação automática, Cartão de Crédito ou em Dinheiro na entrega.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Entrega Rápida & Rastreada</h4>
                <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                  Acompanhe em tempo real o preparo na cozinha e o deslocamento do motoboy até você.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 scroll-mt-20">
        
        {/* Search & Category Filter Bar */}
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold font-display text-stone-900">
                  Cardápio de Cupcakes
                </h2>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Remover todos os filtros e exibir cardápio completo"
                  >
                    <RotateCcw className="w-3 h-3 text-rose-600" />
                    <span>Ver Cardápio Completo</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {hasActiveFilters ? (
                  <span>
                    Exibindo <strong className="text-stone-700">{filteredCupcakes.length}</strong> de <strong className="text-stone-700">{cupcakes.length}</strong> cupcakes cadastrados
                  </span>
                ) : (
                  'Selecione os sabores que deseja saborear hoje'
                )}
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por sabor ou ingrediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Categories and Allergen Exclusion Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs scale-102'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Quick Allergen Exclusion Tag */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase hidden sm:inline">
                Restrições alimentares:
              </span>
              {['Glúten', 'Lactose'].map((alg) => (
                <button
                  key={alg}
                  onClick={() => setAllergenFilter(allergenFilter === alg ? null : alg)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    allergenFilter === alg
                      ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  Sem {alg}
                </button>
              ))}
              {allergenFilter && (
                <button
                  onClick={() => setAllergenFilter(null)}
                  className="text-[11px] text-rose-600 underline ml-1"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cupcakes Grid */}
        {filteredCupcakes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
            <span className="text-3xl">🧁</span>
            <h3 className="text-base font-bold text-stone-800">Nenhum cupcake encontrado</h3>
            <p className="text-xs text-stone-500">Tente buscar por outro termo ou limpe os filtros de restrição alimentar.</p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ver Cardápio Completo</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCupcakes.map((cupcake) => (
              <CupcakeCard
                key={cupcake.id}
                cupcake={cupcake}
                onSelect={onSelectCupcake}
                onAddToCart={onAddToCart}
                isAddedAnimation={addedCupcakeId === cupcake.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
