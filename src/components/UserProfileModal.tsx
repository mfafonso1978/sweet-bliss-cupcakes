import React, { useState } from 'react';
import { User } from '../types';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  LogOut, 
  Edit3, 
  Check, 
  Package, 
  AlertCircle,
  Save,
  CheckCircle2
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
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [birthDate, setBirthDate] = useState(user.birthDate || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (!isOpen) return null;

  // Format phone (00) 00000-0000
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length > 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    setPhone(formatted);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('O nome completo não pode ficar em branco.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
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
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCancelEdit = () => {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setBirthDate(user.birthDate || '');
    setError(null);
    setIsEditing(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
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

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs text-stone-700">
          
          {/* Notification Banners */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Seus dados foram atualizados com sucesso!</span>
            </div>
          )}

          {/* User Info Section (View or Edit mode) */}
          {!isEditing ? (
            <div className="space-y-4">
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-stone-500">
                    <UserIcon className="w-4 h-4 text-rose-600" />
                    <span>Nome:</span>
                  </div>
                  <strong className="text-stone-900">{user.name}</strong>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-stone-500">
                    <Mail className="w-4 h-4 text-rose-600" />
                    <span>E-mail:</span>
                  </div>
                  <strong className="text-stone-900 font-mono text-[11px]">{user.email}</strong>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-stone-500">
                    <Phone className="w-4 h-4 text-rose-600" />
                    <span>Telefone / WhatsApp:</span>
                  </div>
                  <strong className="text-stone-900 font-mono text-[11px]">
                    {user.phone || <span className="text-stone-400 font-normal">Não informado</span>}
                  </strong>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-stone-500">
                    <Calendar className="w-4 h-4 text-rose-600" />
                    <span>Nascimento:</span>
                  </div>
                  <strong className="text-stone-900">
                    {user.birthDate || <span className="text-stone-400 font-normal">Não informado</span>}
                  </strong>
                </div>
              </div>

              {/* Edit button */}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                <span>Editar Meus Dados</span>
              </button>
            </div>
          ) : (
            /* Edit Form */
            <form onSubmit={handleSave} className="space-y-3">
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
                    placeholder="(11) 90000-0000"
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

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick link to Orders */}
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

          {/* Logout Section */}
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
