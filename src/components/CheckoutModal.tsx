import React, { useState, useEffect } from 'react';
import { CartItem, Order, PaymentMethod, User } from '../types';
import { 
  X, 
  MapPin, 
  CreditCard, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  ArrowLeft, 
  Tag, 
  Store, 
  Bike,
  User as UserIcon,
  Phone,
  Mail,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentUser: User | null;
  onRequireLogin: () => void;
  onOrderCreated: (order: Order) => void;
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  onOrderCreated
}) => {
  // Checkout Steps: 'address' -> 'payment' -> 'pix_screen' -> 'success'
  const [step, setStep] = useState<'address' | 'payment' | 'pix_screen' | 'success'>('address');

  // Customer identification fields (Filled by the user)
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');

  // Address fields (Filled by the user)
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [reference, setReference] = useState('');
  const [isPickup, setIsPickup] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepStatusMessage, setCepStatusMessage] = useState<string | null>(null);

  // Validation feedback
  const [validationError, setValidationError] = useState<string | null>(null);

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent?: number; freeDelivery?: boolean } | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  // Payment Method selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');

  // Credit Card fields (Filled by the user)
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState('1');

  // Cash / Dinheiro fields (Filled by the user)
  const [needsChange, setNeedsChange] = useState<'no' | 'yes'>('no');
  const [cashAmountGiven, setCashAmountGiven] = useState('');

  // PIX state
  const [pixSecondsLeft, setPixSecondsLeft] = useState(300);
  const [copiedPix, setCopiedPix] = useState(false);

  // Payment processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Auto-sync if currentUser logs in
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!customerEmail) setCustomerEmail(currentUser.email);
      if (!customerPhone && currentUser.phone) setCustomerPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Subtotal & Calculations
  const subtotal = items.reduce((acc, item) => {
    const price = item.cupcake.promoPrice || item.cupcake.price;
    return acc + price * item.quantity;
  }, 0);

  const baseDeliveryFee = isPickup ? 0 : 7.90;
  const deliveryFee = appliedCoupon?.freeDelivery ? 0 : baseDeliveryFee;

  let discount = 0;
  if (appliedCoupon?.discountPercent) {
    discount = (subtotal * appliedCoupon.discountPercent) / 100;
  }
  const total = Math.max(0, subtotal + deliveryFee - discount);

  // Calculate change for cash
  const numCashGiven = parseFloat(cashAmountGiven.replace(',', '.')) || total;
  const changeDue = Math.max(0, numCashGiven - total);

  // CEP lookup via ViaCEP
  const handleCepChange = async (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(formatted);

    if (digits.length === 8) {
      setIsSearchingCep(true);
      setCepStatusMessage(null);
      setValidationError(null);

      try {
        const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        if (response.ok) {
          const data = await response.json();
          if (data.erro) {
            setCepStatusMessage('CEP não localizado. Por favor, preencha rua e bairro manualmente.');
          } else {
            if (data.logradouro) setStreet(data.logradouro);
            if (data.bairro) setNeighborhood(data.bairro);
            if (data.localidade) setCity(data.localidade);
            if (data.uf) setState(data.uf);
            setCepStatusMessage(`Endereço localizado: ${data.localidade}/${data.uf}`);
          }
        } else {
          setCepStatusMessage('Preencha os campos de endereço manualmente.');
        }
      } catch {
        setCepStatusMessage('Preencha os campos de endereço manualmente.');
      } finally {
        setIsSearchingCep(false);
      }
    } else {
      setCepStatusMessage(null);
    }
  };

  // Phone mask formatting (00) 00000-0000
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length > 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    setCustomerPhone(formatted);
  };

  // Credit card number mask 0000 0000 0000 0000
  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Card expiry mask MM/AA
  const handleCardExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setCardExpiry(formatted);
  };

  // Coupon handling
  const handleApplyCoupon = () => {
    const clean = couponInput.trim().toUpperCase();
    if (clean === 'FRETEGRATIS') {
      setAppliedCoupon({ code: 'FRETEGRATIS', freeDelivery: true });
      setCouponMessage('Cupom FRETEGRATIS aplicado! Entrega gratuita garantida.');
      setCouponInput('');
    } else if (clean === 'CUPOM10' || clean === 'CUPCAKE10') {
      setAppliedCoupon({ code: clean, discountPercent: 10 });
      setCouponMessage('Cupom de 10% de desconto aplicado com sucesso!');
      setCouponInput('');
    } else {
      setCouponMessage('Cupom não encontrado. Experimente FRETEGRATIS ou CUPOM10.');
    }
  };

  // Step 1 Validation
  const handleProceedToPayment = () => {
    setValidationError(null);

    if (!customerName.trim()) {
      setValidationError('Por favor, informe seu nome completo.');
      return;
    }

    const phoneDigits = customerPhone.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 10) {
      setValidationError('Por favor, informe seu telefone/WhatsApp com DDD.');
      return;
    }

    if (!isPickup) {
      const cepDigits = cep.replace(/\D/g, '');
      if (cepDigits.length !== 8) {
        setValidationError('Por favor, informe um CEP válido com 8 dígitos.');
        return;
      }
      if (!street.trim()) {
        setValidationError('Por favor, preencha o nome da sua rua/avenida.');
        return;
      }
      if (!number.trim()) {
        setValidationError('Por favor, preencha o número do seu endereço.');
        return;
      }
      if (!neighborhood.trim()) {
        setValidationError('Por favor, preencha o bairro da entrega.');
        return;
      }
      if (!city.trim()) {
        setValidationError('Por favor, preencha a cidade da entrega.');
        return;
      }
      if (!state.trim()) {
        setValidationError('Por favor, selecione o estado.');
        return;
      }
    }

    setStep('payment');
  };

  // PIX countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isOpen && step === 'pix_screen' && pixSecondsLeft > 0) {
      interval = setInterval(() => {
        setPixSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, step, pixSecondsLeft]);

  const pixCopyCode = `00020126580014br.gov.bcb.pix0136pix@sweetbliss.com.br520400005303986540${total.toFixed(2)}5802BR5920SWEET BLISS CUPCAKES6009SAO PAULO62070503***6304E9B2`;

  const handleCopyPix = () => {
    navigator.clipboard?.writeText?.(pixCopyCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  // Payment processing execution
  const processPayment = (method: PaymentMethod) => {
    setValidationError(null);

    // Validate payment method specific user inputs
    if (method === 'Cartão de Crédito') {
      const cardDigits = cardNumber.replace(/\D/g, '');
      if (cardDigits.length < 13) {
        setValidationError('Por favor, digite os 16 números do seu cartão de crédito.');
        return;
      }
      if (!cardName.trim()) {
        setValidationError('Por favor, informe o nome do titular como está impresso no cartão.');
        return;
      }
      if (!cardExpiry.trim() || !cardExpiry.includes('/') || cardExpiry.length < 5) {
        setValidationError('Por favor, informe a data de validade no formato MM/AA.');
        return;
      }
      if (!cardCvv.trim() || cardCvv.length < 3) {
        setValidationError('Por favor, informe o código de segurança (CVV de 3 ou 4 dígitos).');
        return;
      }
    }

    if (method === 'Dinheiro na Entrega' && needsChange === 'yes') {
      if (!cashAmountGiven.trim() || numCashGiven < total) {
        setValidationError(`Para solicitar troco, informe um valor em dinheiro igual ou maior que R$ ${total.toFixed(2).replace('.', ',')}.`);
        return;
      }
    }

    setIsProcessing(true);

    if (method === 'PIX') {
      setProcessingMessage('Confirmando recebimento do PIX...');
    } else if (method === 'Cartão de Crédito') {
      setProcessingMessage('Processando transação com a operadora do seu cartão...');
    } else {
      setProcessingMessage('Registrando seu pedido com pagamento em dinheiro na entrega...');
    }

    setTimeout(() => {
      setIsProcessing(false);

      const newOrder: Order = {
        id: `PED-${Math.floor(100000 + Math.random() * 900000)}`,
        userId: currentUser?.id,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: [...items],
        subtotal,
        discount,
        deliveryFee,
        total,
        couponCode: appliedCoupon?.code,
        customerName: customerName.trim() || currentUser?.name,
        customerPhone: customerPhone.trim() || currentUser?.phone,
        customerEmail: customerEmail.trim() || currentUser?.email || undefined,
        address: {
          cep: isPickup ? '01310-100' : cep.trim(),
          street: isPickup ? 'Retirada na Confeitaria (Balcão)' : street.trim(),
          number: isPickup ? 'S/N' : number.trim(),
          complement: complement.trim() || undefined,
          neighborhood: isPickup ? 'Centro' : neighborhood.trim(),
          city: isPickup ? 'São Paulo' : city.trim(),
          state: isPickup ? 'SP' : state.trim(),
          reference: reference.trim() || undefined,
          isPickup
        },
        paymentMethod: method,
        paymentStatus: 'Aprovado',
        status: 'Em Produção',
        estimatedMinutes: isPickup ? 20 : 35
      };

      setCreatedOrder(newOrder);
      setStep('success');
      onOrderCreated(newOrder);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col my-4 max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Step Bar */}
        <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {step !== 'address' && step !== 'success' && (
                <button
                  onClick={() => {
                    setValidationError(null);
                    setStep(step === 'pix_screen' ? 'payment' : 'address');
                  }}
                  className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
                  title="Voltar etapa"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {step === 'address' && '1. Seus Dados & Entrega'}
                  {step === 'payment' && '2. Escolha a Forma de Pagamento'}
                  {step === 'pix_screen' && '2. Pagamento via PIX'}
                  {step === 'success' && '3. Pedido Confirmado!'}
                </h3>
                <p className="text-xs text-stone-500">
                  {step === 'address' && 'Preencha seus dados de contato e o endereço de entrega'}
                  {step === 'payment' && 'Escolha como prefere pagar seus cupcakes'}
                  {step === 'pix_screen' && 'Escaneie o QR Code ou copie o código PIX'}
                  {step === 'success' && 'Pedido recebido com sucesso!'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper indicators */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
            <div className={`py-1.5 rounded-lg transition-colors ${
              step === 'address' ? 'bg-rose-600 text-white shadow-xs' : 'bg-stone-200 text-stone-600'
            }`}>
              1. Dados & Entrega
            </div>
            <div className={`py-1.5 rounded-lg transition-colors ${
              step === 'payment' || step === 'pix_screen' ? 'bg-rose-600 text-white shadow-xs' : 'bg-stone-200 text-stone-600'
            }`}>
              2. Pagamento
            </div>
            <div className={`py-1.5 rounded-lg transition-colors ${
              step === 'success' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-stone-200 text-stone-600'
            }`}>
              3. Concluído
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs text-stone-700">

          {/* Validation Banner */}
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* ETAPA 1: DADOS DO CLIENTE & ENDEREÇO */}
          {step === 'address' && (
            <div className="space-y-5">
              {/* Order Items summary list */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                  Itens Selecionados ({items.length})
                </span>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/50">
                  {items.map((item) => {
                    const price = item.cupcake.promoPrice || item.cupcake.price;
                    return (
                      <div key={item.cupcake.id} className="p-3 flex items-center justify-between gap-3 bg-white">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.cupcake.image}
                            alt={item.cupcake.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80';
                            }}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                          <div>
                            <span className="font-bold text-stone-900 block">{item.cupcake.name}</span>
                            <span className="text-stone-500 text-[11px]">
                              {item.quantity}x de R$ {price.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-stone-900">
                          R$ {(price * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info Form */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
                  <UserIcon className="w-4 h-4 text-rose-600" />
                  <span>Identificação do Cliente</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                      Seu Nome Completo <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        setValidationError(null);
                      }}
                      placeholder="Ex: Seu Nome e Sobrenome"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                      Telefone / WhatsApp <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => {
                        handlePhoneChange(e.target.value);
                        setValidationError(null);
                      }}
                      placeholder="(11) 90000-0000"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                      E-mail (Para confirmação do pedido)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery method toggle */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                  Forma de Entrega
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPickup(false);
                      setValidationError(null);
                    }}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                      !isPickup 
                        ? 'border-rose-500 bg-rose-50/50 text-rose-900 font-bold shadow-xs' 
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Bike className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    <div>
                      <span className="block text-xs">Delivery por Motoboy</span>
                      <span className="text-[10px] text-stone-500 font-normal">Entrega em ~35 min (R$ 7,90)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPickup(true);
                      setValidationError(null);
                    }}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                      isPickup 
                        ? 'border-rose-500 bg-rose-50/50 text-rose-900 font-bold shadow-xs' 
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Store className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    <div>
                      <span className="block text-xs">Retirar na Confeitaria</span>
                      <span className="text-[10px] text-stone-500 font-normal">Pronto em 20 min (Grátis)</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Address Form (if delivery) */}
              {!isPickup && (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
                      <MapPin className="w-4 h-4 text-rose-600" />
                      <span>Endereço de Entrega</span>
                    </div>
                    {isSearchingCep && (
                      <span className="text-[11px] text-rose-600 flex items-center gap-1 font-medium animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Buscando endereço pelo CEP...
                      </span>
                    )}
                    {!isSearchingCep && cepStatusMessage && (
                      <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {cepStatusMessage}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                    {/* 1. CEP */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                        CEP <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        placeholder="Digite o CEP..."
                        maxLength={9}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>

                    {/* 2. Rua / Avenida */}
                    <div className="sm:col-span-4">
                      <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                        Rua / Avenida <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Nome da rua ou avenida..."
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>

                    {/* 3. Número */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                        Número <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="Ex: 123"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>

                    {/* 4. Complemento */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        placeholder="Apto, Bloco, Casa..."
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>

                    {/* 5. Bairro */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                        Bairro <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="Seu bairro..."
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>

                    {/* 6. Cidade */}
                    <div className="sm:col-span-3">
                      <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                        Cidade <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Sua cidade..."
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>

                    {/* 7. Estado / UF */}
                    <div className="sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                        UF <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-2 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 uppercase focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      >
                        {BRAZILIAN_STATES.map((uf) => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>

                    {/* 8. Ponto de Referência */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                        Ponto de Referência
                      </label>
                      <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="Próximo a..."
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Coupon input */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-rose-600" />
                    Cupom de Desconto
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Use <strong className="text-rose-600 font-mono">FRETEGRATIS</strong> ou <strong className="text-rose-600 font-mono">CUPOM10</strong>
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Digite o cupom..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-white font-mono text-xs uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-[11px] ${appliedCoupon ? 'text-emerald-700 font-semibold' : 'text-amber-700'}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Order Totals Summary */}
              <div className="p-4 bg-stone-100/70 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Taxa de Entrega:</span>
                  <span className="font-mono">
                    {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">Grátis</span> : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Desconto ({appliedCoupon?.code}):</span>
                    <span className="font-mono">- R$ {discount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-extrabold text-stone-900">
                  <span>Total da Compra:</span>
                  <span className="font-mono text-base text-rose-700">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-md shadow-rose-600/20 text-xs flex items-center justify-center gap-2 transition-all hover:scale-101"
              >
                <span>Avançar para Pagamento (PIX, Cartão ou Dinheiro)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ETAPA 2: ESCOLHA DA FORMA DE PAGAMENTO */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div className="text-center pb-1">
                <span className="text-sm font-extrabold text-stone-900 block">
                  Valor a Pagar: <span className="text-rose-600 font-mono">R$ {total.toFixed(2).replace('.', ',')}</span>
                </span>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  Pedido para <strong className="text-stone-800">{customerName}</strong> • {isPickup ? 'Retirada na Loja' : `Entrega em ${city}/${state}`}
                </p>
              </div>

              {/* 3 Payment Tabs */}
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('PIX');
                    setValidationError(null);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'PIX'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="text-xs">PIX</span>
                  <span className="text-[10px] text-emerald-700 font-medium">Instantâneo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('Cartão de Crédito');
                    setValidationError(null);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'Cartão de Crédito'
                      ? 'border-rose-500 bg-rose-50/70 text-rose-950 font-bold shadow-xs ring-2 ring-rose-500/20'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-xs">Cartão</span>
                  <span className="text-[10px] text-rose-700 font-medium">Até 2x sem juros</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('Dinheiro na Entrega');
                    setValidationError(null);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'Dinheiro na Entrega'
                      ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold shadow-xs ring-2 ring-amber-500/20'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <span className="text-xs">Dinheiro</span>
                  <span className="text-[10px] text-amber-700 font-medium">Na entrega</span>
                </button>
              </div>

              {/* METHOD 1: PIX PREVIEW & ACTION */}
              {paymentMethod === 'PIX' && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs">Pagamento Instantâneo via PIX</h4>
                      <p className="text-stone-600 text-[11px] leading-relaxed mt-0.5">
                        Ao prosseguir, você visualizará o QR Code e a Chave Copia e Cola para pagar no app do seu banco com confirmação imediata.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs text-stone-700 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Beneficiário:</span>
                      <strong className="text-stone-900">Sweet Bliss Cupcakes Gourmet</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Chave PIX:</span>
                      <strong className="font-mono text-emerald-700">pix@sweetbliss.com.br</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Total a Pagar:</span>
                      <strong className="font-mono text-rose-600 text-sm">R$ {total.toFixed(2).replace('.', ',')}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep('pix_screen')}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Gerar QR Code PIX</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* METHOD 2: CREDIT CARD PAYMENT */}
              {paymentMethod === 'Cartão de Crédito' && (
                <div className="space-y-4">
                  {/* Virtual Credit Card visual card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-stone-900 via-stone-800 to-rose-950 text-white shadow-xl space-y-3 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <div className="w-8 h-6 rounded bg-amber-400/80 border border-amber-300"></div>
                      <span className="font-mono text-xs font-extrabold tracking-widest text-rose-300">CARTÃO</span>
                    </div>
                    <div className="font-mono text-base tracking-widest pt-2">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-end text-[10px] text-stone-300 font-mono">
                      <div>
                        <span className="block text-[8px] uppercase text-stone-400">Titular</span>
                        <span className="font-bold">{cardName || 'NOME NO CARTÃO'}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase text-stone-400">Validade</span>
                        <span className="font-bold">{cardExpiry || 'MM/AA'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Inputs */}
                  <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                        Número do Cartão <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          handleCardNumberChange(e.target.value);
                          setValidationError(null);
                        }}
                        placeholder="Digite os 16 números do seu cartão"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                        Nome Impresso no Cartão <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => {
                          setCardName(e.target.value);
                          setValidationError(null);
                        }}
                        placeholder="Nome como consta no cartão"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs uppercase"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                          Validade <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => {
                            handleCardExpiryChange(e.target.value);
                            setValidationError(null);
                          }}
                          placeholder="MM/AA"
                          maxLength={5}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-mono text-xs text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                          CVV <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => {
                            setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                            setValidationError(null);
                          }}
                          placeholder="CVV"
                          maxLength={4}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-mono text-xs text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                        Parcelamento
                      </label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
                      >
                        <option value="1">1x de R$ {total.toFixed(2).replace('.', ',')} (à vista sem juros)</option>
                        <option value="2">2x de R$ {(total / 2).toFixed(2).replace('.', ',')} (sem juros)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => processPayment('Cartão de Crédito')}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold rounded-2xl shadow-md text-xs flex items-center justify-center gap-2 transition-all hover:scale-101"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{processingMessage}</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Pagar R$ {total.toFixed(2).replace('.', ',')} com Cartão</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* METHOD 3: CASH / DINHEIRO PAYMENT */}
              {paymentMethod === 'Dinheiro na Entrega' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <Banknote className="w-4 h-4 text-amber-700" />
                      <span>Pagamento em Dinheiro ao Receber</span>
                    </div>
                    <p className="text-amber-800 text-xs leading-relaxed">
                      Você pagará diretamente ao entregador no momento da entrega dos seus cupcakes.
                    </p>

                    <div className="space-y-2 pt-1">
                      <label className="text-[11px] font-bold text-stone-800 block">
                        Você precisará de troco?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNeedsChange('no');
                            setValidationError(null);
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            needsChange === 'no'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          Não, tenho valor exato
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNeedsChange('yes');
                            setValidationError(null);
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            needsChange === 'yes'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          Sim, preciso de troco
                        </button>
                      </div>
                    </div>

                    {needsChange === 'yes' && (
                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                        <label className="text-[10px] uppercase font-bold text-stone-500 block">
                          Vai pagar com quanto em dinheiro?
                        </label>
                        <input
                          type="text"
                          value={cashAmountGiven}
                          onChange={(e) => {
                            setCashAmountGiven(e.target.value);
                            setValidationError(null);
                          }}
                          placeholder={`Ex: ${(Math.ceil(total / 10) * 10 || 50).toFixed(2)}`}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono"
                        />
                        {numCashGiven > total && (
                          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-bold">
                            Seu troco será de R$ {changeDue.toFixed(2).replace('.', ',')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => processPayment('Dinheiro na Entrega')}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white font-bold rounded-2xl shadow-md text-xs flex items-center justify-center gap-2 transition-all hover:scale-101"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{processingMessage}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Confirmar Pedido (Pagar R$ {total.toFixed(2).replace('.', ',')} na Entrega)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ETAPA 2.1: TELA DETALHADA DO PIX (QR CODE & CÓDIGO COPIA-E-COLA) */}
          {step === 'pix_screen' && (
            <div className="space-y-4 text-center">
              {/* Timer badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  QR Code válido por: {Math.floor(pixSecondsLeft / 60)}:{(pixSecondsLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-2xl border-2 border-stone-800 shadow-lg inline-block mx-auto">
                <div className="w-48 h-48 bg-stone-900 rounded-xl p-3 flex flex-col items-center justify-center text-white relative">
                  <QrCode className="w-36 h-36 text-white" />
                  <span className="text-[10px] font-mono tracking-widest text-emerald-400 mt-1 font-bold">
                    PIX INSTANTÂNEO
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xl font-extrabold text-stone-900 block font-mono">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-stone-500 text-xs">
                  Sweet Bliss Cupcakes Gourmet • São Paulo - SP
                </span>
              </div>

              {/* Copy-paste input */}
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex items-center justify-between gap-2 text-left">
                <span className="font-mono text-[10px] text-stone-500 truncate flex-1">
                  {pixCopyCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                >
                  {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPix ? 'Copiado!' : 'Copiar Chave'}</span>
                </button>
              </div>

              {/* Confirm PIX CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => processPayment('PIX')}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-2xl shadow-md shadow-emerald-600/20 text-xs flex items-center justify-center gap-2 transition-all hover:scale-101"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{processingMessage}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Já Realizei o Pagamento PIX</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 3: SUCESSO & RECIBO INSTANTÂNEO */}
          {step === 'success' && createdOrder && (
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider block">
                  Pagamento Confirmado!
                </span>
                <h3 className="text-lg font-bold font-display text-stone-900 mt-0.5">
                  Pedido #{createdOrder.id}
                </h3>
                <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
                  Olá <strong className="text-stone-800">{createdOrder.customerName}</strong>! Seu pedido foi registrado e nossa confeiteira já iniciou a preparação.
                </p>
              </div>

              {/* Receipt card */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-left space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Cliente:</span>
                  <strong className="text-stone-900">{createdOrder.customerName}</strong>
                </div>
                {createdOrder.customerPhone && (
                  <div className="flex justify-between text-stone-600">
                    <span>Telefone / WhatsApp:</span>
                    <strong className="text-stone-900 font-mono">{createdOrder.customerPhone}</strong>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Forma de Pagamento:</span>
                  <strong className="text-stone-900">{createdOrder.paymentMethod}</strong>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Entrega:</span>
                  <strong className="text-stone-900">
                    {createdOrder.address.isPickup ? 'Retirada na Loja (20 min)' : 'Delivery por Motoboy (~35 min)'}
                  </strong>
                </div>
                {!createdOrder.address.isPickup && (
                  <div className="flex justify-between items-start text-stone-600">
                    <span>Endereço:</span>
                    <div className="text-right text-stone-800 font-medium max-w-[240px]">
                      <p>{createdOrder.address.street}, {createdOrder.address.number}{createdOrder.address.complement ? ` (${createdOrder.address.complement})` : ''}</p>
                      <p className="text-[11px] text-stone-500">{createdOrder.address.neighborhood} • {createdOrder.address.city}/{createdOrder.address.state || 'SP'}</p>
                      <p className="text-[10px] text-stone-400 font-mono">CEP: {createdOrder.address.cep}</p>
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-200 flex justify-between font-extrabold text-stone-900 text-sm">
                  <span>Total Pago:</span>
                  <span className="text-rose-700 font-mono">R$ {createdOrder.total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-md shadow-rose-600/20 text-xs flex items-center justify-center gap-2 transition-all hover:scale-101"
                >
                  <Bike className="w-4 h-4" />
                  <span>Acompanhar Entrega em Tempo Real</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
