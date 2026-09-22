import { Order, OrderStatus, CartItem, OrderAddress, PaymentMethod, User } from '../models/types';
import { OrderValidator } from '../models/validators';

const ORDERS_STORAGE_KEY = 'cupcake_orders';

export interface CreateOrderInput {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  address: OrderAddress;
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  currentUser?: User | null;
}

/**
 * Controller responsável pelo Ciclo de Vida, Rastreamento, Avaliação e Persistência de Pedidos (MVC)
 */
export class OrderController {
  /**
   * Obtém a lista completa de pedidos armazenados no sistema
   */
  public static getOrders(): Order[] {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Erro ao ler pedidos do localStorage:', e);
    }
    return [];
  }

  /**
   * Persiste a lista de pedidos no localStorage
   */
  public static saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Erro ao salvar pedidos no localStorage:', e);
    }
  }

  /**
   * Filtra os pedidos pertencentes exclusivamente ao usuário autenticado
   */
  public static getUserOrders(currentUser: User | null): Order[] {
    if (!currentUser) return [];
    const all = this.getOrders();
    const cleanEmail = currentUser.email ? currentUser.email.trim().toLowerCase() : '';

    return all.filter((o) => {
      if (o.userId && o.userId === currentUser.id) return true;
      if (o.customerEmail && cleanEmail && o.customerEmail.trim().toLowerCase() === cleanEmail) {
        return true;
      }
      return false;
    });
  }

  /**
   * Gera um código de rastreamento padronizado no formato 'PED-XXXXXX'
   */
  public static generateTrackingCode(): string {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `PED-${randomDigits}`;
  }

  /**
   * Cria um novo pedido após validação completa de regras de negócio
   */
  public static createOrder(input: CreateOrderInput): {
    success: boolean;
    order?: Order;
    error?: string;
  } {
    // 1. Validação de itens e estoque
    const itemsCheck = OrderValidator.validateOrderItems(input.items);
    if (!itemsCheck.isValid) {
      return { success: false, error: itemsCheck.error };
    }

    // 2. Validação de pedido mínimo
    const minOrderCheck = OrderValidator.validateMinOrderValue(input.subtotal);
    if (!minOrderCheck.isValid) {
      return { success: false, error: minOrderCheck.error };
    }

    // 3. Validação do endereço de entrega
    const addressCheck = OrderValidator.validateAddress(input.address);
    if (!addressCheck.isValid) {
      return { success: false, error: addressCheck.error };
    }

    // 4. Criação da entidade de domínio Order
    const isPickup = Boolean(input.address.isPickup);
    const newOrder: Order = {
      id: this.generateTrackingCode(),
      userId: input.currentUser?.id,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [...input.items],
      subtotal: input.subtotal,
      discount: input.discount,
      deliveryFee: input.deliveryFee,
      total: input.total,
      couponCode: input.couponCode,
      customerName: input.customerName?.trim() || input.currentUser?.name,
      customerPhone: input.customerPhone?.trim() || input.currentUser?.phone,
      customerEmail: input.customerEmail?.trim() || input.currentUser?.email,
      address: { ...input.address },
      paymentMethod: input.paymentMethod,
      paymentStatus: 'Aprovado',
      status: 'Em Produção',
      estimatedMinutes: isPickup ? 20 : 35
    };

    // 5. Persistência
    const existingOrders = this.getOrders();
    const updatedOrders = [newOrder, ...existingOrders];
    this.saveOrders(updatedOrders);

    return {
      success: true,
      order: newOrder
    };
  }

  /**
   * Atualiza o status de progresso de um pedido existente (Admin / Fluxo do Sistema)
   */
  public static updateOrderStatus(
    orderId: string,
    nextStatus: OrderStatus
  ): { success: boolean; updatedOrders: Order[]; updatedOrder?: Order } {
    const orders = this.getOrders();
    let updatedOrder: Order | undefined;

    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        updatedOrder = { ...o, status: nextStatus };
        return updatedOrder;
      }
      return o;
    });

    if (updatedOrder) {
      this.saveOrders(updatedOrders);
      return { success: true, updatedOrders, updatedOrder };
    }

    return { success: false, updatedOrders: orders };
  }

  /**
   * Registra a avaliação e feedback do cliente para um pedido concluído
   */
  public static saveRating(
    orderId: string,
    rating: number,
    feedback: string
  ): { success: boolean; updatedOrders: Order[]; updatedOrder?: Order } {
    const orders = this.getOrders();
    let updatedOrder: Order | undefined;

    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        updatedOrder = { ...o, rating, ratingFeedback: feedback };
        return updatedOrder;
      }
      return o;
    });

    if (updatedOrder) {
      this.saveOrders(updatedOrders);
      return { success: true, updatedOrders, updatedOrder };
    }

    return { success: false, updatedOrders: orders };
  }
}
