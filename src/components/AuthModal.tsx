import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { INITIAL_REGISTERED_USERS, RegisteredUser } from '../data/initialUsers';
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
  Phone,
  UserX,
  Sparkles,
  Info
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
  notice?: string | null;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  notice = null
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [notRegisteredEmail, setNotRegisteredEmail] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode with initialMode prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setNotRegisteredEmail(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

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

  // Get registered users list from localStorage or initialize with demo seed
  const getRegisteredUsers = (): RegisteredUser[] => {
    try {
      const stored = localStorage.getItem('cupcake_registered_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Seed default demo user if empty
      localStorage.setItem('cupcake_registered_users', JSON.stringify(INITIAL_REGISTERED_USERS));
      return INITIAL_REGISTERED_USERS;
    } catch {
      return INITIAL_REGISTERED_USERS;
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotRegisteredEmail(null);

    if (isBlocked) {
      setError('Conta temporariamente bloqueada por segurança após múltiplas tentativas incorretas.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha o e-mail e a senha cadastrados.');
      return;
    }

    const savedUsers = getRegisteredUsers();
    const existingUser = savedUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    // RULE: If user is not registered, do NOT allow login directly!
    if (!existingUser) {
      setNotRegisteredEmail(email.trim());
      setError('Cadastro não encontrado para este e-mail. É obrigatório ter uma conta registrada para entrar.');
      return;
    }

    // Validate password
    if (existingUser.password && existingUser.password !== password) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setIsBlocked(true);
        setError('Conta bloqueada temporariamente após 5 tentativas incorretas.');
      } else {
        setError(`Senha incorreta. Verifique seus dados e tente novamente (tentativa ${newAttempts} de 5).`);
      }
      return;
    }

    // Password rule check for legacy accounts without password
    if (!isPasswordValid(password)) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    // Login success
    setSuccessMsg(`Bem-vindo(a) de volta, ${existingUser.name}!`);
    setTimeout(() => {
      onLoginSuccess(existingUser);
      onClose();
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotRegisteredEmail(null);

    if (!name.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (!isPasswordValid(password)) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    const users = getRegisteredUsers();
    const emailExists = users.some(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (emailExists) {
      setError('Já existe uma conta cadastrada com este e-mail. Utilize a aba "Já sou Cliente" para entrar.');
      return;
    }

    const newUser: RegisteredUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      birthDate: birthDate || undefined,
      password: password,
      addresses: []
    };

    try {
      const updated = [...users, newUser];
      localStorage.setItem('cupcake_registered_users', JSON.stringify(updated));
    } catch {}

    setSuccessMsg('Cadastro realizado com sucesso! Entrando na sua conta...');
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 700);
  };

  const handleSwitchToRegister = () => {
    setMode('register');
    setError(null);
    setNotRegisteredEmail(null);
    setSuccessMsg(null);
  };

  const handleSwitchToLogin = () => {
    setMode('login');
    setError(null);
    setNotRegisteredEmail(null);
    setSuccessMsg(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center text-lg shadow-sm">
              🧁
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                {mode === 'login' ? 'Acessar Minha Conta' : 'Criar Cadastro de Cliente'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {mode === 'login' ? 'Entre com seu e-mail e senha cadastrados' : 'Preencha seus dados para criar sua conta'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Banner (e.g. required to add to cart) */}
        {notice && (
          <div className="px-5 py-3 bg-amber-50/90 border-b border-amber-200/80 text-amber-900 flex items-start gap-2.5 text-xs">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="leading-tight">
              <span className="font-bold block text-amber-950">Identificação Necessária</span>
              <span className="text-[11px] text-amber-800">{notice}</span>
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex border-b border-stone-100 bg-stone-50/60 p-1.5 gap-1 text-xs">
          <button
            type="button"
            onClick={handleSwitchToLogin}
            className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              mode === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Já sou Cliente (Entrar)
          </button>
          <button
            type="button"
            onClick={handleSwitchToRegister}
            className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              mode === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Criar Nova Conta
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs text-stone-700">
          
          {/* Informative Block for Unregistered User */}
          {notRegisteredEmail && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-stone-800 space-y-2.5 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserX className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-rose-950">Cadastro Não Encontrado</h4>
                  <p className="text-[11px] text-rose-800 leading-relaxed mt-0.5">
                    Não encontramos nenhuma conta com o e-mail <strong className="font-bold text-rose-950 underline">{notRegisteredEmail}</strong>.
                    Não é permitido entrar sem cadastro prévio.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSwitchToRegister}
                className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Cadastrar-se com este e-mail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Standard Error Display (when not the unregistered user alert) */}
          {error && !notRegisteredEmail && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                  E-mail do Cliente *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (notRegisteredEmail) setNotRegisteredEmail(null);
                    }}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-stone-500 block">
                    Senha de Acesso *
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-stone-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span>Lembrar meu acesso</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5 mt-2 cursor-pointer active:scale-98"
              >
                <span>Entrar na Minha Conta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Discreet test hint */}
              <div className="pt-2 text-center text-[10px] text-stone-400 border-t border-stone-100 flex items-center justify-center gap-1">
                <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                <span>Conta para testes: <strong className="text-stone-600 font-mono">cliente@sweetbliss.com</strong> (senha: <strong className="text-stone-600 font-mono">senha123</strong>)</span>
              </div>
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
                    placeholder="Ex: Maria dos Santos"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    required
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
                    required
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
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5 mt-2 cursor-pointer active:scale-98"
              >
                <span>Concluir Meu Cadastro</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[10px] text-stone-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
            <span>Seus dados estão protegidos pela Lei Geral de Proteção de Dados (LGPD)</span>
          </div>

        </div>
      </div>
    </div>
  );
};
