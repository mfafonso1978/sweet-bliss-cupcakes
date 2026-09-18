import React, { useState } from 'react';
import { Order, User } from '../types';
import { 
  X, 
  Star, 
  ChevronRight, 
  Package
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onOpenOrderDetails: (order: Order) => void;
  onSaveRating: (orderId: string, rating: number, feedback: string) => void;
  currentUser?: User | null;
  onRequireLogin?: () => void;
}

export const OrderHistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  orders,
  onOpenOrderDetails,
  onSaveRating,
  currentUser,
  onRequireLogin
}) => {
  const [activeRatingOrderId, setActiveRatingOrderId] = useState<string | null>(null);
  const [stars, setStars] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');

  const handleOpenRating = (order: Order) => {
    setActiveRatingOrderId(order.id);
    setStars(order.rating || 5);
    setFeedbackText(order.ratingFeedback || '');
  };

  const handleSaveFeedback = (orderId: string) => {
    onSaveRating(orderId, stars, feedbackText);
    setActiveRatingOrderId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col my-8 max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Meus Pedidos & Avaliações
              </h3>
              <p className="text-[11px] text-stone-500">
                Acompanhe o status dos seus pedidos e avalie os cupcakes recebidos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-stone-700">
          {orders.length === 0 ? (
            !currentUser ? (
              <div className="p-10 text-center space-y-3">
                <Package className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="text-sm font-bold text-stone-800">Nenhum pedido para exibir</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Você não está conectado a nenhuma conta. Entre ou cadastre-se para ver seus pedidos anteriores.
                </p>
                {onRequireLogin && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onRequireLogin();
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Acessar Minha Conta
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 text-center space-y-3">
                <Package className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="text-sm font-bold text-stone-800">Nenhum pedido realizado ainda</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Olá, {currentUser.name}! Assim que você concluir uma compra na vitrine, seus pedidos aparecerão aqui para acompanhamento e avaliação.
                </p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const isDelivered = order.status === 'Entregue';
                const isRatingThis = activeRatingOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 hover:border-stone-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-stone-900 block">
                          #{order.id}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {order.createdAt} • {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          isDelivered 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>
                        <span className="font-mono font-extrabold text-stone-900 block text-xs mt-0.5">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    {/* Items with product images */}
                    <div className="border-t border-stone-200/70 pt-2.5 space-y-1.5">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        Produtos do Pedido ({order.items.length}):
                      </span>
                      <div className="space-y-1.5">
                        {order.items.map((it, i) => {
                          const unitPrice = it.cupcake.promoPrice || it.cupcake.price;
                          const itemTotal = unitPrice * it.quantity;
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-stone-200/80 shadow-2xs hover:border-stone-300 transition-colors"
                            >
                              <img
                                src={it.cupcake.image}
                                alt={it.cupcake.name}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80';
                                }}
                                className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-stone-100 shadow-2xs"
                                loading="lazy"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-stone-900 text-xs truncate">
                                    {it.cupcake.name}
                                  </span>
                                  <span className="font-mono font-bold text-stone-900 text-xs flex-shrink-0">
                                    R$ {itemTotal.toFixed(2).replace('.', ',')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-stone-500">
                                  <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 font-bold rounded">
                                    {it.quantity}x
                                  </span>
                                  <span>R$ {unitPrice.toFixed(2).replace('.', ',')} un.</span>
                                  <span className="text-stone-400">• {it.cupcake.category}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Rating display / action */}
                    <div className="border-t border-stone-200/60 pt-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        {order.rating ? (
                          <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-[11px]">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= order.rating! ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span>Avaliado ({order.rating} estrelas)</span>
                          </div>
                        ) : isDelivered ? (
                          <button
                            onClick={() => handleOpenRating(order)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-[11px] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            <span>Avaliar Produtos</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic">
                            (Avaliação liberada após a entrega)
                          </span>
                        )}

                        <button
                          onClick={() => {
                            onClose();
                            onOpenOrderDetails(order);
                          }}
                          className="text-stone-600 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Acompanhar Pedido</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Display review feedback and product thumbnails when rated */}
                      {order.rating && (
                        <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/70 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide">
                              Cupcake(s) Avaliado(s):
                            </span>
                            <div className="flex items-center -space-x-1.5 overflow-hidden">
                              {order.items.map((it, idx) => (
                                <img
                                  key={idx}
                                  src={it.cupcake.image}
                                  alt={it.cupcake.name}
                                  title={it.cupcake.name}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80';
                                  }}
                                  className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-2xs"
                                />
                              ))}
                            </div>
                          </div>
                          {order.ratingFeedback && (
                            <p className="text-[11px] text-stone-700 italic bg-white/80 p-2 rounded-lg border border-amber-100">
                              "{order.ratingFeedback}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Rating form box with product images */}
                    {isRatingThis && (
                      <div className="p-3.5 bg-white rounded-2xl border-2 border-amber-300 space-y-3 text-xs shadow-xs animate-in fade-in">
                        <div>
                          <span className="font-bold text-amber-950 block text-xs">
                            Avaliação dos Cupcakes:
                          </span>
                          <p className="text-[11px] text-stone-500 mb-2">
                            O que você achou dos produtos recebidos?
                          </p>

                          {/* Product preview tags with image inside review form */}
                          <div className="flex flex-wrap gap-2 mb-1">
                            {order.items.map((it, idx) => (
                              <div 
                                key={idx} 
                                className="flex items-center gap-2 p-1.5 pr-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80"
                              >
                                <img
                                  src={it.cupcake.image}
                                  alt={it.cupcake.name}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80';
                                  }}
                                  className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-amber-200"
                                />
                                <div>
                                  <span className="font-bold text-stone-900 text-[11px] block leading-tight">
                                    {it.cupcake.name}
                                  </span>
                                  <span className="text-[10px] text-stone-500">
                                    {it.quantity}x • {it.cupcake.category}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-stone-800 block mb-1 text-[11px]">
                            Sua nota de 1 a 5 estrelas:
                          </span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setStars(st)}
                                className="p-1 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    st <= stars ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-xs font-bold text-amber-700 ml-2">
                              {stars} {stars === 1 ? 'estrela' : 'estrelas'}
                            </span>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Deixe um comentário sobre os cupcakes (sabor, textura, recheio)..."
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs"
                        />

                        <div className="flex justify-end gap-2 pt-1 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => setActiveRatingOrderId(null)}
                            className="px-3 py-1.5 text-stone-500 hover:text-stone-800 text-[11px] font-medium cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveFeedback(order.id)}
                            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[11px] shadow-2xs transition-colors cursor-pointer"
                          >
                            Salvar Avaliação
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
