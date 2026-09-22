import React, { useState } from 'react';
import { Cupcake, Order, OrderStatus, CupcakeCategory } from '../models/types';
import { 
  X, 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  Filter, 
  ChefHat, 
  Bike, 
  Clock, 
  Save,
  LogOut
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cupcakes: Cupcake[];
  onAddCupcake: (cupcake: Cupcake) => void;
  onUpdateCupcake: (cupcake: Cupcake) => void;
  onDeleteCupcake: (cupcakeId: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onLogoutAdmin?: () => void;
}

export const AdminBackOfficeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  cupcakes,
  onAddCupcake,
  onUpdateCupcake,
  onDeleteCupcake,
  orders,
  onUpdateOrderStatus,
  onLogoutAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders'>('orders');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Form state for adding/editing cupcake
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<CupcakeCategory>('Gourmet');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formGluten, setFormGluten] = useState(false);
  const [formLactose, setFormLactose] = useState(false);
  const [formNuts, setFormNuts] = useState(false);
  const [formEggs, setFormEggs] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setIsEditing(null);
    setFormName('');
    setFormCategory('Gourmet');
    setFormPrice('');
    setFormStock('');
    setFormImage('');
    setFormDescription('');
    setFormGluten(false);
    setFormLactose(false);
    setFormNuts(false);
    setFormEggs(false);
    setFormError(null);
  };

  const handleEditClick = (cup: Cupcake) => {
    setIsEditing(cup.id);
    setFormName(cup.name);
    setFormCategory(cup.category);
    setFormPrice(cup.price.toString());
    setFormStock(cup.stock.toString());
    setFormImage(cup.image);
    setFormDescription(cup.description);
    setFormGluten(cup.allergens.includes('Glúten'));
    setFormLactose(cup.allergens.includes('Lactose'));
    setFormNuts(cup.allergens.includes('Nozes / Castanhas'));
    setFormEggs(cup.allergens.includes('Ovos'));
    setActiveTab('catalog');
  };

  const handleSaveCupcake = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const priceNum = parseFloat(formPrice.replace(',', '.'));
    const stockNum = parseInt(formStock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('O preço deve ser um valor numérico positivo.');
      return;
    }

    if (!formName.trim()) {
      setFormError('O nome do cupcake é obrigatório.');
      return;
    }

    const allergensList: any[] = [];
    if (formGluten) allergensList.push('Glúten');
    if (formLactose) allergensList.push('Lactose');
    if (formEggs) allergensList.push('Ovos');
    if (formNuts) allergensList.push('Nozes / Castanhas');

    if (isEditing) {
      const existing = cupcakes.find(c => c.id === isEditing);
      if (existing) {
        onUpdateCupcake({
          ...existing,
          name: formName,
          category: formCategory as any,
          price: priceNum,
          stock: stockNum >= 0 ? stockNum : 0,
          image: formImage,
          description: formDescription || existing.description,
          allergens: allergensList
        });
      }
    } else {
      const newCup: Cupcake = {
        id: `cup-${Date.now()}`,
        name: formName,
        category: formCategory as any,
        price: priceNum,
        stock: stockNum >= 0 ? stockNum : 10,
        image: formImage,
        description: formDescription || 'Cupcake gourmet preparado artesanalmente com ingredientes selecionados.',
        ingredients: ['Farinha selecionada', 'Açúcar cristal', 'Manteiga', 'Ovos frescos'],
        allergens: allergensList,
        rating: 5.0
      };
      onAddCupcake(newCup);
    }

    resetForm();
  };

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col my-6 max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PAINEL DA LOJA
                </span>
                <span className="text-xs text-stone-400">Gestão Operacional</span>
              </div>
              <h3 className="text-base font-bold font-display mt-0.5">
                Painel Administrativo da Confeitaria
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onLogoutAdmin && (
              <button
                onClick={() => {
                  onLogoutAdmin();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-500/30 shadow-xs"
                title="Sair da sessão administrativa"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Encerrar Sessão</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Fechar painel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Gerenciamento de Pedidos e Entregas</span>
            <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'catalog'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Cardápio & Estoque da Confeitaria</span>
            <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono">
              {cupcakes.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-stone-700">
          
          {/* TAB 1: GERENCIAMENTO DE PEDIDOS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              
              {/* Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-stone-500" />
                  <span className="font-bold text-stone-700">Filtrar por Status:</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'Todos os Pedidos' },
                    { id: 'Aguardando Pagamento', label: 'Aguardando Pagamento' },
                    { id: 'Em Produção', label: 'Em Preparo (Cozinha)' },
                    { id: 'Em Entrega', label: 'Em Rota (Motoboy)' },
                    { id: 'Entregue', label: 'Entregues' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setOrderStatusFilter(f.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        orderStatusFilter === f.id
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                  <Clock className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                  <p className="font-semibold text-stone-700">Nenhum pedido encontrado neste filtro</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Faça um pedido na loja para vê-lo aparecer em tempo real aqui.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map(order => (
                    <div 
                      key={order.id} 
                      className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3 hover:border-amber-400 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                            #{order.id}
                          </span>
                          <span className="text-stone-500 text-[11px]">
                            {order.createdAt} • Modo: {order.address.isPickup ? 'Retirada na Loja' : 'Entrega por Motoboy'}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            order.status === 'Entregue' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : order.status === 'Em Entrega'
                              ? 'bg-sky-50 text-sky-800 border border-sky-200'
                              : order.status === 'Em Produção'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-stone-100 text-stone-700'
                          }`}>
                            {order.status}
                          </span>
                          <span className="font-mono font-extrabold text-stone-900 text-sm">
                            R$ {order.total.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>

                      {/* Items and Address details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-stone-600">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <strong className="text-stone-800 block">Itens do Pedido:</strong>
                            {order.rating && (
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                ★ {order.rating}/5 {order.ratingFeedback ? `("${order.ratingFeedback.slice(0, 25)}...")` : ''}
                              </span>
                            )}
                          </div>
                          <ul className="space-y-1.5">
                            {order.items.map(it => (
                              <li key={it.cupcake.id} className="flex items-center justify-between gap-2 p-1 rounded-lg bg-stone-50/80 border border-stone-100">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <img
                                    src={it.cupcake.image}
                                    alt={it.cupcake.name}
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80';
                                    }}
                                    className="w-7 h-7 rounded object-cover flex-shrink-0 border border-stone-200"
                                  />
                                  <span className="truncate text-stone-800 font-medium">
                                    {it.quantity}x {it.cupcake.name}
                                  </span>
                                </div>
                                <span className="font-mono text-stone-600 font-semibold flex-shrink-0">
                                  R$ {((it.cupcake.promoPrice || it.cupcake.price) * it.quantity).toFixed(2).replace('.', ',')}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                          <strong className="text-stone-800 block mb-0.5">Endereço de Entrega:</strong>
                          <p>{order.address.street}, {order.address.number}{order.address.complement ? ` (${order.address.complement})` : ''}</p>
                          <p className="text-stone-500">{order.address.neighborhood} • {order.address.city}{order.address.state ? `/${order.address.state}` : ''} • CEP {order.address.cep}</p>
                          <p className="text-stone-400 mt-1">Forma de Pagamento: {order.paymentMethod}</p>
                        </div>
                      </div>

                      {/* Status Transition Action Buttons */}
                      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] text-stone-400 font-medium">
                          Atualizar status do pedido:
                        </span>

                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Em Produção')}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-semibold border border-amber-200"
                          >
                            Enviar p/ Cozinha
                          </button>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Em Entrega')}
                            className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg font-semibold border border-sky-200"
                          >
                            Despachar com Motoboy
                          </button>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Entregue')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                          >
                            Confirmar Entrega
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GESTÃO DO CARDÁPIO & ESTOQUE */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              
              {/* Add / Edit Form */}
              <form onSubmit={handleSaveCupcake} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    {isEditing ? <Edit2 className="w-4 h-4 text-amber-600" /> : <Plus className="w-4 h-4 text-amber-600" />}
                    {isEditing ? 'Editar Cupcake do Cardápio' : 'Cadastrar Novo Cupcake Gourmet'}
                  </span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-stone-500 hover:text-stone-800 text-[11px]"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Nome do Cupcake *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Maracujá com Chocolate Branco"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Categoria *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                    >
                      <option value="Gourmet">Gourmet</option>
                      <option value="Vegano">Vegano</option>
                      <option value="Zero Açúcar">Zero Açúcar</option>
                      <option value="Sazonais">Sazonais</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Preço Unitário (R$) *</label>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Estoque Inicial (unidades)</label>
                    <input
                      type="number"
                      min="0"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">URL da Imagem (Web)</label>
                    <input
                      type="url"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Descrição do Sabor</label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Breve descrição dos ingredientes, recheio e textura..."
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>

                  {/* Allergen Checkboxes */}
                  <div className="sm:col-span-3 pt-1">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1.5">
                      Alérgenos Presentes na Receita:
                    </span>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formGluten}
                          onChange={(e) => setFormGluten(e.target.checked)}
                          className="rounded text-rose-600"
                        />
                        <span>Glúten</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formLactose}
                          onChange={(e) => setFormLactose(e.target.checked)}
                          className="rounded text-rose-600"
                        />
                        <span>Lactose</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formEggs}
                          onChange={(e) => setFormEggs(e.target.checked)}
                          className="rounded text-rose-600"
                        />
                        <span>Ovos</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formNuts}
                          onChange={(e) => setFormNuts(e.target.checked)}
                          className="rounded text-rose-600"
                        />
                        <span>Nozes / Castanhas</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Atualizar Cupcake' : 'Salvar no Cardápio'}</span>
                  </button>
                </div>
              </form>

              {/* Current Catalog Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                  Itens Atuais na Vitrine ({cupcakes.length})
                </span>

                <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Cupcake</th>
                        <th className="py-2.5 px-3">Categoria</th>
                        <th className="py-2.5 px-3">Preço</th>
                        <th className="py-2.5 px-3 text-center">Estoque</th>
                        <th className="py-2.5 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {cupcakes.map(cup => (
                        <tr key={cup.id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-2.5 px-3 flex items-center gap-2">
                            <img
                              src={cup.image}
                              alt={cup.name}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80';
                              }}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <span className="font-bold text-stone-900">{cup.name}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium text-[11px]">
                              {cup.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                            R$ {cup.price.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                              cup.stock <= 0 ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-700'
                            }`}>
                              {cup.stock} un.
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1">
                            <button
                              onClick={() => handleEditClick(cup)}
                              className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition-colors"
                              title="Editar este cupcake"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteCupcake(cup.id)}
                              className="p-1.5 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir da vitrine"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
