import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { 
  X, 
  Clock, 
  ChefHat, 
  Bike, 
  CheckCircle2, 
  Star, 
  MapPin, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  QrCode,
  Banknote,
  Radio
} from 'lucide-react';

interface Props {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, nextStatus: OrderStatus) => void;
  onSaveRating?: (orderId: string, rating: number, feedback: string) => void;
  onNewOrder?: () => void;
}

export const OrderStatusModal: React.FC<Props> = ({
  order,
  onClose,
  onUpdateStatus,
  onSaveRating,
  onNewOrder
}) => {
  const [rating, setRating] = useState<number>(order?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(order?.ratingFeedback || '');
  const [savedRatingFeedback, setSavedRatingFeedback] = useState(false);
  const [isLiveTrackingActive, setIsLiveTrackingActive] = useState(true);

  // Sync rating and feedback when a new order is opened
  useEffect(() => {
    if (order) {
      setRating(order.rating || 5);
      setFeedback(order.ratingFeedback || '');
    }
  }, [order?.id, order?.rating, order?.ratingFeedback]);

  const paymentIcon = order?.paymentMethod === 'PIX' ? QrCode : order?.paymentMethod === 'Cartão de Crédito' ? CreditCard : Banknote;

  const statuses: { 
    id: OrderStatus; 
    label: string; 
    icon: any; 
    title: string;
    desc: string; 
    action: string;
  }[] = [
    { 
      id: 'Aguardando Pagamento', 
      label: '1. Pagamento', 
      icon: paymentIcon, 
      title: 'Pagamento Confirmado',
      desc: order?.paymentMethod === 'Dinheiro na Entrega' 
        ? 'Pedido registrado com sucesso! O pagamento será recebido em dinheiro pelo entregador.' 
        : `Pagamento via ${order?.paymentMethod || 'PIX'} processado e aprovado.`,
      action: 'Enviar para Cozinha'
    },
    { 
      id: 'Em Produção', 
      label: '2. Na Cozinha', 
      icon: ChefHat, 
      title: 'Preparando seus Cupcakes',
      desc: 'Nossa confeiteira está finalizando a decoração e embalando os doces na caixa térmica com lacre de segurança.',
      action: 'Despachar para Entrega'
    },
    { 
      id: 'Em Entrega', 
      label: '3. Em Rota', 
      icon: Bike, 
      title: 'Pedido a Caminho!',
      desc: 'Carlos (Entregador Parceiro) já retirou seu pacote e está em rota para o seu endereço.',
      action: 'Confirmar Recebimento'
    },
    { 
      id: 'Entregue', 
      label: '4. Entregue', 
      icon: CheckCircle2, 
      title: 'Pedido Entregue com Sucesso!',
      desc: 'Seu pacote foi entregue no destino. Bom apetite! 🧁',
      action: 'Concluído'
    }
  ];

  const currentIdx = order ? statuses.findIndex((s) => s.id === order.status) : -1;

  // Real-time tracking progression
  useEffect(() => {
    if (!order) return;
    let timer: any = null;
    if (isLiveTrackingActive && currentIdx >= 0 && currentIdx < statuses.length - 1) {
      timer = setTimeout(() => {
        const nextStatus = statuses[currentIdx + 1].id;
        onUpdateStatus?.(order.id, nextStatus);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isLiveTrackingActive, currentIdx, order?.id, onUpdateStatus]);

  if (!order) return null;

  // Advance to next status manually if desired
  const handleAdvanceStep = () => {
    if (currentIdx < statuses.length - 1) {
      const nextStatus = statuses[currentIdx + 1].id;
      onUpdateStatus?.(order.id, nextStatus);
    }
  };

  const handleSendRating = () => {
    if (onSaveRating) {
      onSaveRating(order.id, rating, feedback);
      setSavedRatingFeedback(true);
      setTimeout(() => setSavedRatingFeedback(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col my-4 max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-mono text-[11px] font-bold border border-rose-500/40 inline-flex items-center gap-1">
                <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
                Rastreamento em Tempo Real
              </span>
              <span className="text-xs text-stone-400 font-mono">#{order.id}</span>
            </div>
            <h3 className="text-base font-bold font-display mt-1">
              Acompanhamento da sua Entrega
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs text-stone-700">

          {/* Current Status Highlight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider block">
                Status Atual: {statuses[currentIdx]?.label}
              </span>
              <h4 className="text-base font-bold text-stone-900 mt-0.5">
                {statuses[currentIdx]?.title}
              </h4>
              <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                {statuses[currentIdx]?.desc}
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-600/20">
              {React.createElement(statuses[currentIdx]?.icon || Clock, { className: 'w-6 h-6' })}
            </div>
          </div>

          {/* Stepper Progress Visualizer */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
              Linha do Tempo do Pedido
            </span>

            <div className="relative pt-2">
              {/* Horizontal progress bar */}
              <div className="absolute top-6 left-6 right-6 h-1 bg-stone-200 -z-0">
                <div 
                  className="h-full bg-rose-600 transition-all duration-500 rounded-full"
                  style={{ width: `${(currentIdx / (statuses.length - 1)) * 100}%` }}
                />
              </div>

              {/* Status Nodes */}
              <div className="grid grid-cols-4 relative z-10 text-center gap-1">
                {statuses.map((s, idx) => {
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.id}
                      className="flex flex-col items-center"
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-rose-600 text-white ring-4 ring-rose-200 shadow-md scale-110'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-200 text-stone-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold mt-2 leading-tight ${
                        isCurrent ? 'text-rose-700' : isDone ? 'text-stone-900' : 'text-stone-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Progress Tracker Controls */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                Atualização em Tempo Real:
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {order.status === 'Entregue' ? 'Concluído' : `Etapa ${currentIdx + 1} de 4`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentIdx < statuses.length - 1 && (
                <button
                  onClick={handleAdvanceStep}
                  className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <span>{statuses[currentIdx]?.action}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => setIsLiveTrackingActive(!isLiveTrackingActive)}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                  isLiveTrackingActive
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLiveTrackingActive ? 'animate-spin' : ''}`} />
                <span>{isLiveTrackingActive ? 'Rastreamento Ativo' : 'Rastreamento Pausado'}</span>
              </button>
            </div>
          </div>

          {/* Products in this Order */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                Itens do Pedido ({order.items.length})
              </span>
              <span className="text-xs font-bold text-stone-900 font-mono">
                Total: R$ {order.total.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="space-y-2">
              {order.items.map((it, idx) => {
                const unitPrice = it.cupcake.promoPrice || it.cupcake.price;
                const itemTotal = unitPrice * it.quantity;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-200/80 shadow-2xs"
                  >
                    <img
                      src={it.cupcake.image}
                      alt={it.cupcake.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-stone-100 shadow-2xs"
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
                        <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold">
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

          {/* Delivery & Address Information */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                Dados de Entrega & Pagamento
              </span>
              {order.customerName && (
                <span className="text-xs text-stone-600">
                  Cliente: <strong className="text-stone-900">{order.customerName}</strong>
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block">Endereço de Entrega:</strong>
                  <span>{order.address.street}, {order.address.number}{order.address.complement ? ` (${order.address.complement})` : ''}</span>
                  <span className="block text-stone-400 text-[11px]">{order.address.neighborhood} • {order.address.city}{order.address.state ? `/${order.address.state}` : ''} • CEP {order.address.cep}</span>
                  {order.customerPhone && (
                    <span className="block text-stone-500 text-[11px] mt-0.5">Contato: {order.customerPhone}</span>
                  )}
                </div>
              </div>

              <div>
                <strong className="text-stone-900 block">Forma de Pagamento:</strong>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {order.paymentMethod} (R$ {order.total.toFixed(2).replace('.', ',')})
                </span>
                <span className="block text-stone-400 text-[11px]">
                  {order.address.isPickup ? 'Retirada na Confeitaria' : 'Entrega via Motoboy'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Rating Section (When Delivered) */}
          {order.status === 'Entregue' ? (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>Avalie sua Experiência</span>
                </div>
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-200/50 px-2 py-0.5 rounded-full">
                  Pedido Concluído
                </span>
              </div>

              {/* Product preview thumbnails being evaluated */}
              <div className="flex items-center gap-2.5 p-2 bg-white/80 rounded-xl border border-amber-200/60">
                <div className="flex items-center -space-x-2 overflow-hidden flex-shrink-0">
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
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-2xs"
                    />
                  ))}
                </div>
                <div className="text-[11px] text-stone-700 min-w-0">
                  <span className="text-amber-900 font-bold block text-[10px] uppercase tracking-wide">
                    Produtos Avaliados:
                  </span>
                  <p className="truncate text-stone-800 font-medium">
                    {order.items.map(it => it.cupcake.name).join(', ')}
                  </p>
                </div>
              </div>

              <p className="text-xs text-stone-600">
                Como estavam a textura, o sabor, o recheio e o capricho da confeitaria?
              </p>

              {/* Star controls */}
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Escreva sua opinião sincera sobre os cupcakes recebidos..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-amber-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />

              <button
                onClick={handleSendRating}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              >
                {savedRatingFeedback ? 'Avaliação Registrada! Muito obrigado ❤️' : 'Enviar Avaliação'}
              </button>

              {onNewOrder && (
                <div className="pt-2 border-t border-amber-200/60">
                  <button
                    onClick={() => {
                      onClose();
                      onNewOrder();
                    }}
                    className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Fazer Novo Pedido</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-stone-500 text-[11px] p-2 bg-stone-50 rounded-xl border border-stone-200">
              A avaliação com estrelas e comentário será liberada assim que o pedido for marcado como <strong>"Entregue"</strong>.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
