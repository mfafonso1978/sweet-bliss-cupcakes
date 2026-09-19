import React, { useState, useEffect } from 'react';
import { Cupcake, CartItem, Order, User, OrderStatus } from './types';
import { initialCupcakes } from './data/initialCupcakes';
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

export default function App() {
  // Cupcakes Catalog state
  const [cupcakes, setCupcakes] = useState<Cupcake[]>(() => {
    try {
      const saved = localStorage.getItem('cupcake_catalog');
      if (saved) {
        const parsed: Cupcake[] = JSON.parse(saved);
        // Heal any outdated or broken image link (including the former 404 URL for Zero Açúcar Doce de Leite)
        const healed = parsed.map(c => {
          if (c.image.includes('photo-1535141192574-5d4897c13136') || (c.id === 'cup-07' && (!c.image || c.image.includes('1535141192574')))) {
            return {
              ...c,
              image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80'
            };
          }
          return c;
        });
        return healed;
      }
      return initialCupcakes;
    } catch {
      return initialCupcakes;
    }
  });

  // Shopping Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cupcake_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders state (starts empty or loads real user orders from localStorage)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('cupcake_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Current User (starts null or loads from localStorage)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cupcake_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCupcake, setSelectedCupcake] = useState<Cupcake | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeOrderForStatus, setActiveOrderForStatus] = useState<Order | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [pendingAddToCart, setPendingAddToCart] = useState<{ cupcake: Cupcake; quantity: number } | null>(null);

  // Admin Area Handlers
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
    setIsAdminAuthenticated(false);
    setIsAdminOpen(false);
  };

  // User Profile & Authentication Handlers
  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setIsProfileOpen(false);
    setIsOrdersOpen(false);
    setActiveOrderForStatus(null);
    setPendingAddToCart(null);
    setAuthNotice(null);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    try {
      const stored = localStorage.getItem('cupcake_registered_users');
      if (stored) {
        const users: User[] = JSON.parse(stored);
        const idx = users.findIndex(
          (u) => u.id === updatedUser.id || u.email.toLowerCase() === updatedUser.email.toLowerCase()
        );
        if (idx >= 0) {
          users[idx] = updatedUser;
          localStorage.setItem('cupcake_registered_users', JSON.stringify(users));
        }
      }
    } catch {}
  };

  // Sync with LocalStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('cupcake_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('cupcake_current_user');
      }
    } catch {}
  }, [currentUser]);
  useEffect(() => {
    try {
      localStorage.setItem('cupcake_catalog', JSON.stringify(cupcakes));
    } catch {}
  }, [cupcakes]);

  useEffect(() => {
    try {
      localStorage.setItem('cupcake_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('cupcake_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  // Cart Operations
  const handleAddToCart = (cupcake: Cupcake, quantity: number = 1) => {
    if (cupcake.stock <= 0) return;

    // RULE: Cannot add items to cart without being logged in
    if (!currentUser) {
      setPendingAddToCart({ cupcake, quantity });
      setAuthNotice('Para adicionar produtos ao carrinho e fazer seu pedido, entre na sua conta ou crie um cadastro gratuito!');
      setAuthInitialMode('login');
      setIsAuthOpen(true);
      return;
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.cupcake.id === cupcake.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = Math.min(cupcake.stock, updated[existingIdx].quantity + quantity);
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return updated;
      } else {
        return [...prev, { cupcake, quantity: Math.min(cupcake.stock, quantity) }];
      }
    });

    setAddedAnimationId(cupcake.id);
    setTimeout(() => setAddedAnimationId(null), 1200);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setAuthNotice(null);

    // If an item addition was pending prior to login/registration, add it now
    if (pendingAddToCart) {
      const { cupcake, quantity } = pendingAddToCart;
      setCart((prev) => {
        const existingIdx = prev.findIndex((i) => i.cupcake.id === cupcake.id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          const newQty = Math.min(cupcake.stock, updated[existingIdx].quantity + quantity);
          updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
          return updated;
        } else {
          return [...prev, { cupcake, quantity: Math.min(cupcake.stock, quantity) }];
        }
      });
      setAddedAnimationId(cupcake.id);
      setTimeout(() => setAddedAnimationId(null), 1200);
      setPendingAddToCart(null);
    }
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
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cupcake.id === cupcakeId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (cupcakeId: string) => {
    setCart((prev) => prev.filter((i) => i.cupcake.id !== cupcakeId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Quick Order Helper
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

  // Order Operations
  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    // Deduct stock in catalog
    setCupcakes((prev) =>
      prev.map((c) => {
        const cartIt = newOrder.items.find((it) => it.cupcake.id === c.id);
        if (cartIt) {
          return { ...c, stock: Math.max(0, c.stock - cartIt.quantity) };
        }
        return c;
      })
    );
    // Clear cart
    setCart([]);
    // Immediately open status tracking modal
    setActiveOrderForStatus(newOrder);
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    if (activeOrderForStatus && activeOrderForStatus.id === orderId) {
      setActiveOrderForStatus((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  const handleSaveRating = (orderId: string, rating: number, feedback: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, rating, ratingFeedback: feedback } : o))
    );
    if (activeOrderForStatus && activeOrderForStatus.id === orderId) {
      setActiveOrderForStatus((prev) =>
        prev ? { ...prev, rating, ratingFeedback: feedback } : null
      );
    }
  };

  // Admin Operations
  const handleAddCupcake = (cupcake: Cupcake) => {
    setCupcakes((prev) => [cupcake, ...prev]);
  };

  const handleUpdateCupcake = (updated: Cupcake) => {
    setCupcakes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCupcake = (cupcakeId: string) => {
    setCupcakes((prev) => prev.filter((c) => c.id !== cupcakeId));
  };

  // Filter orders that belong exclusively to the currently logged in user
  const userOrders = currentUser
    ? orders.filter(
        (o) =>
          o.userId === currentUser.id ||
          Boolean(
            o.customerEmail &&
              currentUser.email &&
              o.customerEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
          )
      )
    : [];

  // Active in-progress order for the currently logged-in user
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
                  <span>São Paulo - SP e Região</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>(11) 98765-4321 • Atendimento WhatsApp</span>
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
                onClick={() => {
                  localStorage.removeItem('cupcake_catalog');
                  localStorage.removeItem('cupcake_cart');
                  setCupcakes(initialCupcakes);
                  setCart([]);
                }}
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
