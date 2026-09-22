import { CartItem, Cupcake, Coupon } from '../models/types';
import { OrderValidator } from '../models/validators';
import { INITIAL_COUPONS } from '../models/seedData';

const CART_STORAGE_KEY = 'cupcake_cart';
const COUPONS_STORAGE_KEY = 'cupcake_coupons';

/**
 * Controller responsável pelo gerenciamento de Estado, Regras de Negócio e Persistência do Carrinho de Compras
 */
export class CartController {
  /**
   * Obtém os itens do carrinho a partir da persistência local
   */
  public static getCart(): CartItem[] {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Erro ao ler carrinho do localStorage:', e);
    }
    return [];
  }

  /**
   * Persiste os itens do carrinho no localStorage
   */
  public static saveCart(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Erro ao salvar carrinho no localStorage:', e);
    }
  }

  /**
   * Adiciona um cupcake ao carrinho respeitando estoque e obrigatoriedade de autenticação
   */
  public static addItem(
    cart: CartItem[],
    cupcake: Cupcake,
    quantity: number = 1,
    isUserLoggedIn: boolean = false
  ): {
    updatedCart: CartItem[];
    success: boolean;
    requiresAuth?: boolean;
    message?: string;
  } {
    if (!isUserLoggedIn) {
      return {
        updatedCart: cart,
        success: false,
        requiresAuth: true,
        message: 'Para adicionar produtos ao carrinho e fazer seu pedido, entre na sua conta ou crie um cadastro gratuito!'
      };
    }

    if (cupcake.stock <= 0) {
      return {
        updatedCart: cart,
        success: false,
        message: 'Este cupcake está momentaneamente esgotado.'
      };
    }

    const existingIdx = cart.findIndex((i) => i.cupcake.id === cupcake.id);
    let updatedCart: CartItem[];

    if (existingIdx >= 0) {
      updatedCart = [...cart];
      const currentQty = updatedCart[existingIdx].quantity;
      const newQty = Math.min(cupcake.stock, currentQty + quantity);
      updatedCart[existingIdx] = { ...updatedCart[existingIdx], quantity: newQty };
    } else {
      updatedCart = [...cart, { cupcake, quantity: Math.min(cupcake.stock, quantity) }];
    }

    this.saveCart(updatedCart);
    return {
      updatedCart,
      success: true
    };
  }

  /**
   * Atualiza a quantidade de um item no carrinho com validação de limites
   */
  public static updateQuantity(cart: CartItem[], cupcakeId: string, delta: number): CartItem[] {
    const updated = cart
      .map((item) => {
        if (item.cupcake.id === cupcakeId) {
          const nextQty = item.quantity + delta;
          if (nextQty <= 0) return null;
          const cappedQty = Math.min(item.cupcake.stock, nextQty);
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    this.saveCart(updated);
    return updated;
  }

  /**
   * Remove um item específico do carrinho
   */
  public static removeItem(cart: CartItem[], cupcakeId: string): CartItem[] {
    const filtered = cart.filter((i) => i.cupcake.id !== cupcakeId);
    this.saveCart(filtered);
    return filtered;
  }

  /**
   * Limpa todos os itens do carrinho e remove da persistência
   */
  public static clearCart(): CartItem[] {
    this.saveCart([]);
    return [];
  }

  /**
   * Realiza todos os cálculos financeiros de subtotais, frete, descontos e total líquido
   */
  public static calculateTotals(
    items: CartItem[],
    coupon?: Coupon | null,
    isPickup: boolean = false
  ): {
    subtotal: number;
    baseDeliveryFee: number;
    deliveryFee: number;
    discount: number;
    total: number;
    isBelowMinOrder: boolean;
    totalItemsCount: number;
    minOrderValue: number;
  } {
    const subtotal = items.reduce((acc, item) => {
      const price = item.cupcake.promoPrice || item.cupcake.price;
      return acc + price * item.quantity;
    }, 0);

    const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const baseDeliveryFee = isPickup ? 0 : 7.90;
    const deliveryFee = coupon?.freeDelivery ? 0 : baseDeliveryFee;

    let discount = 0;
    if (coupon?.discountPercent) {
      discount = (subtotal * coupon.discountPercent) / 100;
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);
    const minOrderValue = OrderValidator.MIN_ORDER_VALUE;
    const isBelowMinOrder = items.length > 0 && subtotal < minOrderValue;

    return {
      subtotal,
      baseDeliveryFee,
      deliveryFee,
      discount,
      total,
      isBelowMinOrder,
      totalItemsCount,
      minOrderValue
    };
  }

  /**
   * Valida e aplica um cupom promocional
   */
  public static validateCoupon(
    code: string,
    subtotal: number
  ): { isValid: boolean; coupon?: Coupon; message?: string } {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { isValid: false, message: 'Digite um código de cupom.' };
    }

    const available = this.getCoupons();
    const found = available.find((c) => c.code.toUpperCase() === cleanCode);

    if (!found) {
      return { isValid: false, message: 'Cupom inválido ou expirado.' };
    }

    if (found.minSubtotal && subtotal < found.minSubtotal) {
      return {
        isValid: false,
        message: `Este cupom é válido apenas para compras acima de R$ ${found.minSubtotal.toFixed(2).replace('.', ',')}.`
      };
    }

    return {
      isValid: true,
      coupon: found,
      message: `Cupom ${found.code} aplicado com sucesso!`
    };
  }

  /**
   * Obtém a lista de cupons disponíveis no sistema
   */
  public static getCoupons(): Coupon[] {
    try {
      const saved = localStorage.getItem(COUPONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_COUPONS;
  }
}
