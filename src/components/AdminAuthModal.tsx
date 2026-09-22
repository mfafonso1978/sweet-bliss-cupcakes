import React, { useState } from 'react';
import { AuthController } from '../controllers/AuthController';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  KeyRound
} from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Por favor, informe o login ou e-mail de administrador.');
      return;
    }

    if (!password.trim()) {
      setError('Por favor, digite sua senha de acesso.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Autenticação delegada ao AuthController (MVC)
      const authResult = AuthController.loginAdmin(username, password);
      setIsLoading(false);

      if (authResult.success) {
        onLoginSuccess();
      } else {
        setError(authResult.error || 'Login ou senha incorretos.');
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ACESSO RESTRITO
                </span>
              </div>
              <h3 className="text-base font-bold font-display mt-0.5">
                Área Administrativa
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-stone-600">
            Digite suas credenciais de gestor para acessar o painel de pedidos, estoque e cardápio da confeitaria.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Login / User */}
            <div>
              <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                Login / E-mail de Administrador *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin ou admin@sweetbliss.com.br"
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                Senha de Acesso *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha de administrador"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verificando credenciais...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Entrar no Painel Administrativo</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Hint Box */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 space-y-1.5">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-amber-800">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Credenciais Padrão para Acesso
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[10px] text-amber-700 hover:text-amber-900 underline font-semibold"
              >
                Preencher dados
              </button>
            </div>
            <div className="font-mono text-[11px] bg-white/70 p-2 rounded-lg border border-amber-200 flex items-center justify-between">
              <span><strong>Usuário:</strong> admin</span>
              <span><strong>Senha:</strong> admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
