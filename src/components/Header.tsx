import React from 'react';
import { 
  ShoppingCart, 
  Clock, 
  Sparkles, 
  MapPin, 
  Bike,
  User as UserIcon,
  Package,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenActiveOrder?: () => void;
  hasActiveOrder?: boolean;
  currentUser?: User | null;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  onOpenOrders?: () => void;
  ordersCount?: number;
  onOpenAdminAuth?: () => void;
  isAdminAuthenticated?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenActiveOrder,
  hasActiveOrder,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onLogout,
  onOpenOrders,
  ordersCount = 0,
  onOpenAdminAuth,
  isAdminAuthenticated = false
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-stone-900 text-stone-200 px-4 py-2 text-xs border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30 text-[11px]">
              <Sparkles className="w-3 h-3 text-rose-300" />
              Fornada Fresquinha
            </span>
            <span className="hidden sm:inline text-stone-400">•</span>
            <span className="font-medium text-stone-300">
              Use o cupom <strong className="text-white font-mono bg-stone-800 px-1.5 py-0.5 rounded text-rose-300">FRETEGRATIS</strong> para entrega sem custo hoje!
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-stone-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              Terça a Domingo: 10h às 20h
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              São Paulo e Região
            </span>
            {onOpenAdminAuth && (
              <>
                <span>•</span>
                <button
                  onClick={onOpenAdminAuth}
                  className="inline-flex items-center gap-1 text-stone-300 hover:text-amber-300 font-medium transition-colors"
                  title="Acessar Área Administrativa"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Área Administrativa</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <span className="text-2xl">🧁</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold font-display tracking-tight text-stone-900 group-hover:text-rose-600 transition-colors">
                Sweet Bliss
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full border border-rose-200">
                Cupcakes Artesanais
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Feitos à mão com ingredientes selecionados todos os dias
            </p>
          </div>
        </a>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Account / Profile Controls */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              {/* Profile / Meus Dados button */}
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 rounded-xl border border-transparent transition-colors shadow-2xs"
                title={`Ver meus dados cadastrais (${currentUser.name})`}
              >
                <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[110px] truncate hidden sm:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>

              {/* Quick Logout Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-stone-200 hover:border-rose-200"
                  title="Sair da conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 rounded-xl transition-colors"
                title="Acessar ou Criar Conta"
              >
                <UserIcon className="w-3.5 h-3.5 text-stone-600" />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )
          )}

          {/* Orders History Button (Shown for logged-in user with order counter) */}
          {currentUser && onOpenOrders && (
            <button
              onClick={onOpenOrders}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors"
              title={ordersCount > 0 ? `Você tem ${ordersCount} ${ordersCount === 1 ? 'pedido realizado' : 'pedidos realizados'}` : 'Nenhum pedido realizado ainda'}
            >
              <Package className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Pedidos</span>
              {ordersCount > 0 && (
                <span className="min-w-[18px] h-4 px-1.5 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {ordersCount}
                </span>
              )}
            </button>
          )}

          {/* Active order tracker button (Only for logged-in user with an active order) */}
          {currentUser && hasActiveOrder && (
            <button
              onClick={onOpenActiveOrder}
              className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-300 transition-colors"
              title="Acompanhar status do pedido ativo"
            >
              <Bike className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Rastrear Pedido</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </button>
          )}

          {/* Área Administrativa Button */}
          {onOpenAdminAuth && (
            <button
              onClick={onOpenAdminAuth}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all border shadow-2xs ${
                isAdminAuthenticated
                  ? 'bg-amber-100 hover:bg-amber-200/90 text-amber-950 border-amber-300'
                  : 'bg-stone-100 hover:bg-amber-50 hover:text-amber-950 hover:border-amber-300 text-stone-700 border-stone-200/80'
              }`}
              title="Área Administrativa da Loja (Login e Senha)"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isAdminAuthenticated ? 'text-amber-700' : 'text-stone-600'}`} />
              <span className="hidden sm:inline">Área Administrativa</span>
              <span className="sm:hidden">Admin</span>
              {isAdminAuthenticated && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Sessão administrativa ativa" />
              )}
            </button>
          )}

          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm hover:shadow transition-all"
            title="Abrir Carrinho de Compras"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Carrinho</span>
            {cartCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-white text-rose-700 rounded-full text-[11px] font-extrabold shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
