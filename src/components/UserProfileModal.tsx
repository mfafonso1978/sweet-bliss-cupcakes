import React, { useState, useEffect } from 'react';
import { User, OrderAddress, BRAZILIAN_STATES } from '../models/types';
import { AuthValidator } from '../models/validators';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  LogOut, 
  Edit3, 
  Package, 
  AlertCircle,
  Save,
  CheckCircle2,
  MapPin,
  Loader2,
  Plus
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateProfile: (updated: User) => void;
  onLogout: () => void;
  onOpenOrders: () => void;
  ordersCount: number;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
  onLogout,
  onOpenOrders,
  ordersCount
}) => {
  const currentAddress = user.addresses?.[0];

  // Estado dos dados pessoais
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [birthDate, setBirthDate] = useState(user.birthDate || '');

  // Estado do endereço de entrega
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [cep, setCep] = useState(currentAddress?.cep || '');
  const [street, setStreet] = useState(currentAddress?.street || '');
  const [number, setNumber] = useState(currentAddress?.number || '');
  const [complement, setComplement] = useState(currentAddress?.complement || '');
  const [neighborhood, setNeighborhood] = useState(currentAddress?.neighborhood || '');
  const [city, setCity] = useState(currentAddress?.city || '');
  const [state, setState] = useState(currentAddress?.state || 'MG');
  const [reference, setReference] = useState(currentAddress?.reference || '');

  // Feedback e busca de CEP
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<string | null>(null);

  // Mensagens e logout
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Dados atualizados com sucesso!');
  const [error, setError] = useState<string | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Sincroniza estados quando o usuário ou modal mudar
  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setBirthDate(user.birthDate || '');

    const addr = user.addresses?.[0];
    setCep(addr?.cep || '');
    setStreet(addr?.street || '');
    setNumber(addr?.number || '');
    setComplement(addr?.complement || '');
    setNeighborhood(addr?.neighborhood || '');
    setCity(addr?.city || '');
    setState(addr?.state || 'MG');
    setReference(addr?.reference || '');
  }, [user, isOpen]);

  if (!isOpen) return null;

  // Formatação de telefone via AuthValidator
  const handlePhoneChange = (val: string) => {
    setPhone(AuthValidator.formatPhone(val));
  };

  // Salvar Dados Pessoais
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('O nome completo não pode ficar em branco.');
      return;
    }

    if (!AuthValidator.isValidEmail(email)) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }

    const updated: User = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      birthDate: birthDate || undefined
    };

    onUpdateProfile(updated);
    setIsEditingPersonal(false);
    setSuccessMessage('Seus dados pessoais foram atualizados com sucesso!');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancelEditPersonal = () => {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setBirthDate(user.birthDate || '');
    setError(null);
    setIsEditingPersonal(false);
  };

  // Busca automática do CEP via ViaCEP
  const handleCepChange = async (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(formatted);

    if (digits.length === 8) {
      setIsSearchingCep(true);
      setCepFeedback(null);
      setError(null);

      try {
        const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        if (response.ok) {
          const data = await response.json();
          if (data.erro) {
            setCepFeedback('CEP não localizado. Preencha rua e bairro manualmente.');
          } else {
            if (data.logradouro) setStreet(data.logradouro);
            if (data.bairro) setNeighborhood(data.bairro);
            if (data.localidade) setCity(data.localidade);
            if (data.uf) setState(data.uf);
            setCepFeedback(`${data.localidade} - ${data.uf}`);
          }
        }
      } catch {
        setCepFeedback('Falha na consulta automática do CEP. Preencha manualmente.');
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  // Salvar Endereço de Entrega
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cepDigits = cep.replace(/\D/g, '');
    if (cepDigits.length !== 8) {
      setError('Por favor, informe um CEP válido com 8 dígitos.');
      return;
    }
    if (!street.trim()) {
      setError('Por favor, informe o nome da rua ou avenida.');
      return;
    }
    if (!number.trim()) {
      setError('Por favor, informe o número do endereço.');
      return;
    }
    if (!neighborhood.trim()) {
      setError('Por favor, informe o bairro.');
      return;
    }
    if (!city.trim()) {
      setError('Por favor, informe a cidade.');
      return;
    }
    if (!state.trim()) {
      setError('Por favor, selecione o estado (UF).');
      return;
    }

    const updatedAddress: OrderAddress = {
      cep: cep.trim(),
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim() || undefined,
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim(),
      reference: reference.trim() || undefined
    };

    const updated: User = {
      ...user,
      addresses: [updatedAddress]
    };

    onUpdateProfile(updated);
    setIsEditingAddress(false);
    setSuccessMessage('Endereço de entrega salvo com sucesso!');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancelEditAddress = () => {
    const addr = user.addresses?.[0];
    setCep(addr?.cep || '');
    setStreet(addr?.street || '');
    setNumber(addr?.number || '');
    setComplement(addr?.complement || '');
    setNeighborhood(addr?.neighborhood || '');
    setCity(addr?.city || '');
    setState(addr?.state || 'MG');
    setReference(addr?.reference || '');
    setIsEditingAddress(false);
    setError(null);
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl border border-stone-200 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
              {userInitial}
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Meus Dados Cadastrais
              </h3>
              <p className="text-[11px] text-stone-500">
                Informações da sua conta na Sweet Bliss
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

        {/* Content Body com Scroll suave */}
        <div className="p-5 space-y-5 text-xs text-stone-700 overflow-y-auto flex-1">
          
          {/* Banners de Notificação */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. SEÇÃO DE DADOS PESSOAIS */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
            <div className="p-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-xs">
                <UserIcon className="w-4 h-4 text-rose-600" />
                <span>Dados Pessoais</span>
              </div>
              {!isEditingPersonal && (
                <button
                  type="button"
                  onClick={() => setIsEditingPersonal(true)}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editar</span>
                </button>
              )}
            </div>

            {!isEditingPersonal ? (
              <div className="divide-y divide-stone-100 text-[11px]">
                <div className="p-3 flex items-center justify-between">
                  <span className="text-stone-500">Nome:</span>
                  <strong className="text-stone-900">{user.name}</strong>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-stone-500">E-mail:</span>
                  <strong className="text-stone-900 font-mono text-[11px]">{user.email}</strong>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-stone-500">Telefone / WhatsApp:</span>
                  <strong className="text-stone-900 font-mono text-[11px]">
                    {user.phone || <span className="text-stone-400 font-normal">Não informado</span>}
                  </strong>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-stone-500">Nascimento:</span>
                  <strong className="text-stone-900">
                    {user.birthDate || <span className="text-stone-400 font-normal">Não informado</span>}
                  </strong>
                </div>
              </div>
            ) : (
              /* Formulário de Edição de Dados Pessoais */
              <form onSubmit={handleSavePersonal} className="p-4 space-y-3 bg-stone-50/40">
                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      placeholder="seu.email@exemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    Telefone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      placeholder="(31) 90000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    Data de Nascimento
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelEditPersonal}
                    className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Dados</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 2. SEÇÃO DE ENDEREÇO DE ENTREGA */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="p-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-xs">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Endereço de Entrega</span>
              </div>
              {!isEditingAddress && (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{currentAddress ? 'Editar Endereço' : '+ Cadastrar Endereço'}</span>
                </button>
              )}
            </div>

            {!isEditingAddress ? (
              /* Visualização do Endereço Cadastrado */
              currentAddress ? (
                <div className="divide-y divide-stone-100 text-[11px]">
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-stone-500">CEP:</span>
                    <strong className="text-stone-900 font-mono">{currentAddress.cep}</strong>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="text-stone-500">Rua / Avenida:</span>
                    <strong className="text-stone-900">{currentAddress.street}</strong>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="text-stone-500">Número:</span>
                    <strong className="text-stone-900">{currentAddress.number}</strong>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="text-stone-500">Complemento:</span>
                    <strong className="text-stone-900">
                      {currentAddress.complement || <span className="text-stone-400 font-normal">Não informado</span>}
                    </strong>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="text-stone-500">Bairro:</span>
                    <strong className="text-stone-900">{currentAddress.neighborhood}</strong>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="text-stone-500">Cidade:</span>
                    <strong className="text-stone-900">{currentAddress.city}</strong>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="text-stone-500">UF:</span>
                    <strong className="text-stone-900 font-semibold">{currentAddress.state || 'MG'}</strong>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="text-stone-500">Ponto de Referência:</span>
                    <strong className="text-stone-900">
                      {currentAddress.reference || <span className="text-stone-400 font-normal">Não informado</span>}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="p-5 text-center space-y-2 bg-stone-50/30">
                  <p className="text-xs text-stone-500">Nenhum endereço de entrega cadastrado ainda.</p>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(true)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cadastrar Endereço</span>
                  </button>
                </div>
              )
            ) : (
              /* Formulário de Cadastro / Edição do Endereço */
              <form onSubmit={handleSaveAddress} className="p-4 space-y-3 bg-stone-50/40">
                {/* CEP */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] uppercase font-bold text-stone-500">
                      CEP <span className="text-rose-600">*</span>
                    </label>
                    {isSearchingCep && (
                      <span className="text-[10px] text-rose-600 flex items-center gap-1 font-medium animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" /> Buscando no ViaCEP...
                      </span>
                    )}
                    {!isSearchingCep && cepFeedback && (
                      <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {cepFeedback}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="35720-000"
                    maxLength={9}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                {/* Rua / Avenida */}
                <div>
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

                {/* Número e Complemento */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                      Número <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Ex: 500"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Apto 42, Bloco B..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Bairro */}
                <div>
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

                {/* Cidade e UF */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
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
                  <div>
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
                </div>

                {/* Ponto de Referência */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    Ponto de Referência
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Próximo à Praça Bom Jesus..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                {/* Ações do Formulário de Endereço */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelEditAddress}
                    className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Endereço</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Atalho para Pedidos */}
          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenOrders();
              }}
              className="w-full p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 flex items-center justify-between text-stone-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-rose-600" />
                <span className="font-semibold text-xs">Histórico de Pedidos</span>
              </div>
              <span className="text-[11px] text-stone-500 font-medium">
                {ordersCount} {ordersCount === 1 ? 'pedido' : 'pedidos'}
              </span>
            </button>
          </div>

          {/* Seção de Logout */}
          <div className="pt-2 border-t border-stone-100">
            {!confirmLogout ? (
              <button
                type="button"
                onClick={() => setConfirmLogout(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sair da Minha Conta</span>
              </button>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-center animate-in fade-in">
                <p className="text-xs font-semibold text-rose-900">
                  Tem certeza que deseja sair da conta?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmLogout(false)}
                    className="flex-1 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50"
                  >
                    Não, continuar
                  </button>
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="flex-1 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sim, Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
