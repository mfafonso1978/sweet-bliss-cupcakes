import React, { useState } from 'react';
import { User } from '../types';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Phone
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Validate password rule: min 6 chars
  const isPasswordValid = (pwd: string) => {
    return pwd.length >= 6;
  };

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isBlocked) {
      setError('Conta temporariamente bloqueada por segurança após múltiplas tentativas incorretas.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Por favor, informe seu e-mail e senha cadastrados.');
      return;
    }

    // Try to find previously registered user in localStorage
    let savedUsers: User[] = [];
    try {
      const stored = localStorage.getItem('cupcake_registered_users');
      if (stored) savedUsers = JSON.parse(stored);
    } catch {}

    const existingUser = savedUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existingUser) {
      setSuccessMsg(`Bem-vindo(a) de volta, ${existingUser.name}!`);
      setTimeout(() => {
        onLoginSuccess(existingUser);
        onClose();
      }, 700);
      return;
    }

    // If first time logging in without previous registration
    if (password.length < 6) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setIsBlocked(true);
        setError('Conta bloqueada temporariamente após 5 tentativas.');
      } else {
        setError(`A senha deve conter no mínimo 6 caracteres.`);
      }
      return;
    }

    // Create user from what the user filled
    const cleanName = email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    const loggedUser: User = {
      id: `usr-${Date.now()}`,
      name: formattedName,
      email: email.trim(),
      phone: phone.trim() || undefined,
      addresses: []
    };

    onLoginSuccess(loggedUser);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor, digite seu nome completo.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, digite um e-mail válido.');
      return;
    }

    if (!isPasswordValid(password)) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      birthDate: birthDate || undefined,
      addresses: []
    };

    // Save in registered users list
    try {
      const stored = localStorage.getItem('cupcake_registered_users');
      const users: User[] = stored ? JSON.parse(stored) : [];
      const updated = users.filter((u) => u.email.toLowerCase() !== newUser.email.toLowerCase());
      updated.push(newUser);
      localStorage.setItem('cupcake_registered_users', JSON.stringify(updated));
    } catch {}

    setSuccessMsg('Conta criada com sucesso! Entrando...');
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg shadow-xs">
              🧁
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                {mode === 'login' ? 'Acessar Minha Conta' : 'Criar Conta de Cliente'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {mode === 'login' ? 'Digite seus dados para entrar' : 'Preencha seus dados para se cadastrar'}
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

        {/* Tab switcher */}
        <div className="flex border-b border-stone-100 bg-stone-50/60 p-1.5 gap-1 text-xs">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              mode === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Já sou Cliente (Entrar)
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              mode === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Criar Nova Conta
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs text-stone-700">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                  E-mail do Cliente *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                  Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Lembrar meu acesso</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5 mt-2"
              >
                <span>Entrar na Minha Conta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
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
                    placeholder="Digite seu nome completo"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
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
                    placeholder="(11) 90000-0000"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
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
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                  Data de Nascimento (Opcional)
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

              <div>
                <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                  Criar Senha * (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5 mt-2"
              >
                <span>Concluir Meu Cadastro</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[10px] text-stone-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
            <span>Seus dados são confidenciais e protegidos</span>
          </div>

        </div>
      </div>
    </div>
  );
};
