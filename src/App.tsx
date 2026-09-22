import React, { useState } from 'react';
import { Cupcake, CartItem, Order, User, OrderStatus } from './models/types';
import { CartController } from './controllers/CartController';
import { OrderController } from './controllers/OrderController';
import { AuthController } from './controllers/AuthController';
import { CatalogController } from './controllers/CatalogController';
import { Header } from './components/Header';
import { AppPrototype } from './components/AppPrototype';
import { CupcakeDetailModal } from './components/CupcakeDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderStatusModal } from './components/OrderStatusModal';
import { AuthModal } from './components/AuthModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AdminBackOfficeModal } from './components/AdminBackOfficeModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { UserProfileModal } from './components/UserProfileModal';
import { 
  Heart, 
  MapPin, 
  Phone, 
  Clock, 
  Sparkles, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  RotateCcw,
  ShoppingBag,
  QrCode,
  Banknote,
  ShieldCheck
} from 'lucide-react';

/**
 * View Orquestradora Principal (Camada View do Padrão MVC)
 * Delega o processamento de regras de negócio, persistência e cálculos para os Controllers dedicados.
 */
export default function App() {
  // 1. Estados inicializados através da camada Controller
  const [cupcakes, setCupcakes] = useState<Cupcake[]>(() => CatalogController.getCatalog());
  const [cart, setCart] = useState<CartItem[]>(() => CartController.getCart());
  const [orders, setOrders] = useState<Order[]>(() => OrderController.getOrders());
  const [currentUser, setCurrentUser] = useState<User | null>(() => AuthController.getCurrentUser());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => AuthController.isAdminAuthenticated());

  // 2. Estados de Controle Visual e Modais (IHC - View)
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCupcake, setSelectedCupcake] = useState<Cupcake | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeOrderForStatus, setActiveOrderForStatus] = useState<Order | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [pendingAddToCart, setPendingAddToCart] = useState<{ cupcake: Cupcake; quantity: number } | null>(null);

  // --- Handlers de Administração (Delegados ao AuthController e CatalogController) ---
  const handleOpenAdminArea = () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setIsAdminAuthOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminAuthOpen(false);
    setIsAdminOpen(true);
  };

  const handleLogoutAdmin = () => {
    AuthController.logoutAdmin();
    setIsAdminAuthenticated(false);
    setIsAdminOpen(false);
  };

  // --- Handlers de Autenticação e Perfil de Usuário (Delegados ao AuthController) ---
  const handleLogout = () => {
    AuthController.logout();
    CartController.clearCart();
    setCurrentUser(null);
    setCart([]);
    setIsProfileOpen(false);
    setIsOrdersOpen(false);
    setActiveOrderForStatus(null);
    setPendingAddToCart(null);
    setAuthNotice(null);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    const result = AuthController.updateProfile(updatedUser);
    if (result.success && result.user) {
      setCurrentUser(result.user);
    }
  };

  const handleLoginSuccess = (user: User) => {
    AuthController.setCurrentUser(user);
    setCurrentUser(user);
    setAuthNotice(null);

    // Processa adição de item pendente pré-login
    if (pendingAddToCart) {
      const { cupcake, quantity } = pendingAddToCart;
      const res = CartController.addItem(cart, cupcake, quantity, true);
      if (res.success) {
        setCart(res.updatedCart);
        setAddedAnimationId(cupcake.id);
        setTimeout(() => setAddedAnimationId(null), 1200);
      }
      setPendingAddToCart(null);
    }
  };

  // --- Handlers de Carrinho de Compras (Delegados ao CartController) ---
  const handleAddToCart = (cupcake: Cupcake, quantity: number = 1) => {
    const result = CartController.addItem(cart, cupcake, quantity, Boolean(currentUser));
    if (!result.success) {
      if (result.requiresAuth) {
        setPendingAddToCart({ cupcake, quantity });
        setAuthNotice(result.message || 'Identificação necessária.');
        setAuthInitialMode('login');
        setIsAuthOpen(true);
      }
      return;
    }

    setCart(result.updatedCart);
    setAddedAnimationId(cupcake.id);
    setTimeout(() => setAddedAnimationId(null), 1200);
  };

  const handleOpenCart = () => {
    if (!currentUser) {
      setAuthNotice('Entre na sua conta ou cadastre-se para acessar e gerenciar seu carrinho de compras.');
      setAuthInitialMode('login');
      setIsAuthOpen(true);
      return;
    }
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cupcakeId: string, delta: number) => {
    const updated = CartController.updateQuantity(cart, cupcakeId, delta);
    setCart(updated);
  };

  const handleRemoveFromCart = (cupcakeId: string) => {
    const updated = CartController.removeItem(cart, cupcakeId);
    setCart(updated);
  };

  const handleClearCart = () => {
    CartController.clearCart();
    setCart([]);
  };

  const handleQuickOrder = () => {
    if (cart.length === 0) {
      const catalogEl = document.getElementById('catalogo') || document.querySelector('main');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // --- Handlers de Pedidos (Delegados ao OrderController e CatalogController) ---
  const handleOrderCreated = (newOrder: Order) => {
    // 1. Atualiza o catálogo com baixa de estoque
    const updatedCatalog = CatalogController.deductStock(newOrder.items);
    setCupcakes(updatedCatalog);

    // 2. Limpa o carrinho
    CartController.clearCart();
    setCart([]);

    // 3. Atualiza estado reativo de pedidos a partir da persistência
    setOrders(OrderController.getOrders());

    // 4. Abre imediatamente a modal de rastreamento
    setActiveOrderForStatus(newOrder);
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    const result = OrderController.updateOrderStatus(orderId, nextStatus);
    if (result.success) {
      setOrders(result.updatedOrders);
      if (activeOrderForStatus && activeOrderForStatus.id === orderId) {
        setActiveOrderForStatus(result.updatedOrder || null);
      }
    }
  };

  const handleSaveRating = (orderId: string, rating: number, feedback: string) => {
    const result = OrderController.saveRating(orderId, rating, feedback);
    if (result.success) {
      setOrders(result.updatedOrders);
      if (activeOrderForStatus && activeOrderForStatus.id === orderId) {
        setActiveOrderForStatus(result.updatedOrder || null);
      }
    }
  };

  // --- Handlers do Catálogo e Administração (Delegados ao CatalogController) ---
  const handleAddCupcake = (cupcake: Cupcake) => {
    const result = CatalogController.addCupcake(cupcake);
    if (result.success) {
      setCupcakes(result.cupcakes);
    }
  };

  const handleUpdateCupcake = (updated: Cupcake) => {
    const result = CatalogController.updateCupcake(updated);
    if (result.success) {
      setCupcakes(result.cupcakes);
    }
  };

  const handleDeleteCupcake = (cupcakeId: string) => {
    const updated = CatalogController.deleteCupcake(cupcakeId);
    setCupcakes(updated);
  };

  const handleResetCatalog = () => {
    const reset = CatalogController.resetCatalog();
    setCupcakes(reset);
    CartController.clearCart();
    setCart([]);
  };

  // Filtragem de pedidos do usuário atual delegada ao OrderController
  const userOrders = OrderController.getUserOrders(currentUser);

  // Pedido ativo em andamento para acompanhamento
  const activeOrder = userOrders.find((o) => o.status !== 'Entregue');
  const totalCartCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800 antialiased selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={handleOpenCart}
        onOpenActiveOrder={() => activeOrder && setActiveOrderForStatus(activeOrder)}
        hasActiveOrder={Boolean(activeOrder)}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthNotice(null);
          setPendingAddToCart(null);
          setAuthInitialMode('login');
          setIsAuthOpen(true);
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        onOpenOrders={() => setIsOrdersOpen(true)}
        ordersCount={userOrders.length}
        onOpenAdminAuth={handleOpenAdminArea}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      {/* Main Storefront Body */}
      <main className="flex-1">
        <AppPrototype
          cupcakes={cupcakes}
          onSelectCupcake={(cup) => setSelectedCupcake(cup)}
          onAddToCart={(cup) => handleAddToCart(cup, 1)}
          addedCupcakeId={addedAnimationId}
          onOpenCart={handleOpenCart}
          cartCount={totalCartCount}
        />
      </main>

      {/* Commercial Footer */}
      <footer className="bg-stone-900 text-stone-300 pt-12 pb-10 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-stone-800">
            {/* Column 1: Store Intro */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                  <span className="text-xl">🧁</span>
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-white tracking-tight">
                    Sweet Bliss Cupcakes
                  </h3>
                  <p className="text-[11px] text-rose-400 font-medium">Confeitaria Artesanal</p>
                </div>
              </div>

              <p className="text-xs text-stone-400 leading-relaxed">
                Cupcakes preparados à mão todos os dias com chocolate nobre e frutas selecionadas. Compre online e acompanhe todas as etapas do pedido até a sua porta.
              </p>

              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={handleQuickOrder}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  <span>Fazer Pedido Agora</span>
                </button>
              </div>
            </div>

            {/* Column 2: Hours & Delivery */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Atendimento & Entregas
              </h4>
              <ul className="space-y-2 text-xs text-stone-400">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>Terça a Domingo: 10h00 às 20h00</span>
                </li>
                <li className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>Delivery expresso em ~35 min com embalagem térmica</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>Matozinhos - MG e Região</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>(31) 98765-4321 • Atendimento WhatsApp</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Payment Methods Accepted */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Formas de Pagamento
              </h4>
              <p className="text-xs text-stone-400">
                Pague com segurança e rapidez utilizando as melhores formas de pagamento:
              </p>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-stone-800 rounded-xl border border-stone-700 text-center">
                  <QrCode className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                  <span className="font-bold text-xs text-white block">PIX</span>
                  <span className="text-[9px] text-stone-400">Instantâneo</span>
                </div>
                <div className="p-2.5 bg-stone-800 rounded-xl border border-stone-700 text-center">
                  <CreditCard className="w-4 h-4 mx-auto text-rose-400 mb-1" />
                  <span className="font-bold text-xs text-white block">Cartão</span>
                  <span className="text-[9px] text-stone-400">Até 2x</span>
                </div>
                <div className="p-2.5 bg-stone-800 rounded-xl border border-stone-700 text-center">
                  <Banknote className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                  <span className="font-bold text-xs text-white block">Dinheiro</span>
                  <span className="text-[9px] text-stone-400">Na entrega</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-footer */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
            <p>
              © {new Date().getFullYear()} Sweet Bliss Cupcakes. Feito à mão com ingredientes nobres.
            </p>

            <div className="flex items-center gap-3">
              {activeOrder && (
                <button
                  onClick={() => setActiveOrderForStatus(activeOrder)}
                  className="text-rose-400 hover:text-rose-300 font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Acompanhar Pedido (#{activeOrder.id})</span>
                </button>
              )}
              <button
                onClick={() => setIsOrdersOpen(true)}
                className="hover:text-stone-300 transition-colors"
              >
                Meus Pedidos{currentUser ? ` (${userOrders.length})` : ''}
              </button>
              <span>•</span>
              <button
                onClick={handleOpenAdminArea}
                className="hover:text-amber-300 transition-colors flex items-center gap-1"
                title="Acessar Área Administrativa com Login e Senha"
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Área Administrativa</span>
              </button>
              <span>•</span>
              <button
                onClick={handleResetCatalog}
                className="hover:text-rose-400 transition-colors flex items-center gap-1"
                title="Restaurar cardápio original"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Cardápio</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}

      {/* 1. Cupcake Detail Modal */}
      {selectedCupcake && (
        <CupcakeDetailModal
          cupcake={selectedCupcake}
          onClose={() => setSelectedCupcake(null)}
          onAddToCart={(cup, qty) => handleAddToCart(cup, qty)}
        />
      )}

      {/* 2. Shopping Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      {/* 3. Checkout Modal (PIX, Cartão de Crédito, Dinheiro) */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cart}
          currentUser={currentUser}
          onRequireLogin={() => setIsAuthOpen(true)}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {/* 4. Order Status Modal (Real-time tracking and customer rating) */}
      {activeOrderForStatus && (
        <OrderStatusModal
          order={activeOrderForStatus}
          onClose={() => setActiveOrderForStatus(null)}
          onUpdateStatus={handleUpdateOrderStatus}
          onSaveRating={handleSaveRating}
          onNewOrder={handleQuickOrder}
        />
      )}

      {/* 5. User Authentication / Profile Modal */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => {
            setIsAuthOpen(false);
            setAuthNotice(null);
            setPendingAddToCart(null);
          }}
          onLoginSuccess={handleLoginSuccess}
          initialMode={authInitialMode}
          notice={authNotice}
        />
      )}

      {/* 5.5. Admin Authentication Modal (Login e Senha) */}
      {isAdminAuthOpen && (
        <AdminAuthModal
          isOpen={isAdminAuthOpen}
          onClose={() => setIsAdminAuthOpen(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )}

      {/* 6. Admin Back-Office Modal */}
      {isAdminOpen && (
        <AdminBackOfficeModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          cupcakes={cupcakes}
          onAddCupcake={handleAddCupcake}
          onUpdateCupcake={handleUpdateCupcake}
          onDeleteCupcake={handleDeleteCupcake}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onLogoutAdmin={handleLogoutAdmin}
        />
      )}

      {/* 7. Orders History Modal */}
      {isOrdersOpen && (
        <OrderHistoryModal
          isOpen={isOrdersOpen}
          onClose={() => setIsOrdersOpen(false)}
          orders={userOrders}
          onOpenOrderDetails={(ord) => setActiveOrderForStatus(ord)}
          onSaveRating={handleSaveRating}
          currentUser={currentUser}
          onRequireLogin={() => setIsAuthOpen(true)}
        />
      )}

      {/* 8. User Profile Modal */}
      {isProfileOpen && currentUser && (
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={currentUser}
          onUpdateProfile={handleUpdateProfile}
          onLogout={handleLogout}
          onOpenOrders={() => setIsOrdersOpen(true)}
          ordersCount={userOrders.length}
        />
      )}
    </div>
  );
}
