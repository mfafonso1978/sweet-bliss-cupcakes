import React, { useState } from 'react';
import { CartItem } from '../models/types';
import { CartController } from '../controllers/CartController';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Package
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cupcakeId: string, delta: number) => void;
  onRemoveItem: (cupcakeId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);

  if (!isOpen) return null;

  // Cálculos delegados ao CartController (MVC)
  const { subtotal, totalItemsCount, isBelowMinOrder, minOrderValue } =
    CartController.calculateTotals(items);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => {
          setShowClearConfirm(false);
          onClose();
        }}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="relative w-screen max-w-md bg-white shadow-2xl border-l border-stone-200 flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Confirmação para Esvaziar Carrinho */}
          {showClearConfirm && (
            <div className="absolute inset-0 z-30 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-6 shadow-2xl border border-stone-100 max-w-xs w-full text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-inner">
                  <Trash2 className="w-7 h-7" />
                </div>
                
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-stone-900">
                    Limpar o carrinho?
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Tem certeza de que deseja remover todos os itens? Essa ação não pode ser desfeita.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition-all active:scale-98"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClearCart();
                      setShowClearConfirm(false);
                      setClearedSuccess(true);
                      setTimeout(() => setClearedSuccess(false), 4000);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 active:scale-98"
                  >
                    Sim, Limpar
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Carrinho de Compras
                </h3>
                <span className="text-xs text-stone-500">
                  {totalItemsCount} {totalItemsCount === 1 ? 'cupcake' : 'cupcakes'} selecionados
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-[11px] text-stone-400 hover:text-rose-600 transition-colors font-medium mr-1"
                  title="Esvaziar todo o carrinho"
                >
                  Limpar
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                {clearedSuccess && (
                  <div className="w-full max-w-xs p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Todos os itens foram removidos com sucesso!</span>
                  </div>
                )}
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-400 flex items-center justify-center text-3xl">
                  🧁
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    Seu carrinho está vazio
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Explore nossa vitrine de cupcakes gourmet e adicione deliciosos sabores ao seu pedido!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Ir para a Vitrine
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemPrice = item.cupcake.promoPrice || item.cupcake.price;
                const itemTotal = itemPrice * item.quantity;
                return (
                  <div
                    key={item.cupcake.id}
                    className="flex gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 transition-all hover:border-stone-300"
                  >
                    {/* Thumbnail */}
                    <img
                      src={item.cupcake.image}
                      alt={item.cupcake.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-stone-900 truncate">
                            {item.cupcake.name}
                          </h5>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[11px] text-stone-500 font-medium">
                              R$ {itemPrice.toFixed(2).replace('.', ',')} un.
                            </span>
                            <span className="text-stone-300 text-xs">•</span>
                            <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                              item.cupcake.stock <= 3
                                ? 'bg-amber-50 text-amber-800 border-amber-200/60'
                                : 'bg-white text-stone-600 border-stone-200/80 shadow-2xs'
                            }`}>
                              <Package className="w-2.5 h-2.5 text-stone-400 flex-shrink-0" />
                              <span>Estoque: <strong className="font-semibold text-stone-800">{item.cupcake.stock} un.</strong></span>
                            </span>
                          </div>
                        </div>

                        {/* Trash button */}
                        <button
                          onClick={() => onRemoveItem(item.cupcake.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center bg-white rounded-lg border border-stone-200 shadow-xs">
                          <button
                            onClick={() => onUpdateQuantity(item.cupcake.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-l-lg transition-colors"
                            title="Diminuir quantidade"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-mono font-bold text-xs text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.cupcake.id, 1)}
                            disabled={item.quantity >= item.cupcake.stock}
                            className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-r-lg transition-colors disabled:opacity-30"
                            title="Aumentar quantidade"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-extrabold text-stone-900 font-mono">
                          R$ {itemTotal.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer / Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              {/* Subtotal calculation */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal dos Produtos:</span>
                  <span className="font-mono font-bold text-stone-900">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Frete calculado no checkout:</span>
                  <span className="italic">A calcular</span>
                </div>
              </div>

              {/* Minimum order warning */}
              {isBelowMinOrder && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Pedido mínimo da loja: <strong>R$ {minOrderValue.toFixed(2).replace('.', ',')}</strong>. Faltam R$ {(minOrderValue - subtotal).toFixed(2).replace('.', ',')}.
                  </span>
                </div>
              )}

              {/* Checkout Action Button */}
              <button
                onClick={onProceedToCheckout}
                disabled={isBelowMinOrder}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                  isBelowMinOrder
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-98'
                }`}
              >
                <span>Finalizar Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Itens salvos com segurança</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
