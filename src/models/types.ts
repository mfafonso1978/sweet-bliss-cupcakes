export type CupcakeCategory = 'Todas' | 'Gourmet' | 'Vegano' | 'Zero Açúcar' | 'Sazonais';

export type AllergenType = 'Glúten' | 'Lactose' | 'Ovos' | 'Nozes / Castanhas' | 'Soja';

export interface Cupcake {
  id: string;
  name: string;
  category: 'Gourmet' | 'Vegano' | 'Zero Açúcar' | 'Sazonais';
  price: number;
  promoPrice?: number;
  image: string;
  description: string;
  ingredients: string[];
  allergens: AllergenType[];
  stock: number;
  rating: number;
  calories?: number;
}

export interface CartItem {
  cupcake: Cupcake;
  quantity: number;
}

export type OrderStatus = 'Aguardando Pagamento' | 'Em Produção' | 'Em Entrega' | 'Entregue';

export type PaymentMethod = 'PIX' | 'Cartão de Crédito' | 'Dinheiro na Entrega';

export type PaymentStatus = 'Pendente' | 'Aprovado' | 'Falhou';

export interface OrderAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state?: string;
  reference?: string;
  isPickup?: boolean;
}

export interface Order {
  id: string;
  userId?: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode?: string;
  address: OrderAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  estimatedMinutes: number;
  rating?: number;
  ratingFeedback?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  addresses: OrderAddress[];
}

export interface RegisteredUser extends User {
  password?: string;
  role?: 'customer' | 'admin';
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  freeDelivery?: boolean;
  minSubtotal?: number;
  description?: string;
}
