import { AllergenType, CartItem, Cupcake, Order, OrderAddress, User } from './types';

/**
 * Validador de Regras de Negócio de Autenticação e Usuários
 */
export class AuthValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  public static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    return this.EMAIL_REGEX.test(email.trim());
  }

  public static isValidPassword(password: string): { isValid: boolean; message?: string } {
    if (!password || password.trim().length < 6) {
      return {
        isValid: false,
        message: 'A senha deve conter no mínimo 6 caracteres.'
      };
    }
    return { isValid: true };
  }

  public static formatPhone(val: string): string {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length > 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    return formatted;
  }

  public static isValidPhone(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11;
  }

  public static validateRegistration(data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
  }): { isValid: boolean; error?: string } {
    if (!data.name || data.name.trim().length < 3) {
      return { isValid: false, error: 'Por favor, informe seu nome completo (mínimo 3 caracteres).' };
    }
    if (!this.isValidEmail(data.email)) {
      return { isValid: false, error: 'Por favor, informe um endereço de e-mail válido.' };
    }
    if (data.password !== undefined) {
      const pwdCheck = this.isValidPassword(data.password);
      if (!pwdCheck.isValid) {
        return { isValid: false, error: pwdCheck.message };
      }
    }
    if (data.phone && !this.isValidPhone(data.phone)) {
      return { isValid: false, error: 'Por favor, informe um telefone válido com DDD.' };
    }
    return { isValid: true };
  }
}

/**
 * Validador de Regras de Negócio de Pedidos e Entregas
 */
export class OrderValidator {
  public static readonly MIN_ORDER_VALUE = 20.00;

  public static validateOrderItems(items: CartItem[]): { isValid: boolean; error?: string } {
    if (!items || items.length === 0) {
      return { isValid: false, error: 'O carrinho está vazio. Adicione cupcakes antes de finalizar o pedido.' };
    }
    for (const item of items) {
      if (item.quantity <= 0) {
        return { isValid: false, error: `Quantidade inválida para o cupcake "${item.cupcake.name}".` };
      }
      if (item.cupcake.stock < item.quantity) {
        return {
          isValid: false,
          error: `O cupcake "${item.cupcake.name}" possui apenas ${item.cupcake.stock} unidade(s) em estoque.`
        };
      }
    }
    return { isValid: true };
  }

  public static validateMinOrderValue(subtotal: number): { isValid: boolean; error?: string } {
    if (subtotal < this.MIN_ORDER_VALUE) {
      return {
        isValid: false,
        error: `O valor mínimo para pedidos é de R$ ${this.MIN_ORDER_VALUE.toFixed(2).replace('.', ',')}.`
      };
    }
    return { isValid: true };
  }

  public static validateAddress(address: OrderAddress): { isValid: boolean; error?: string } {
    if (address.isPickup) {
      return { isValid: true };
    }

    const cleanCep = address.cep ? address.cep.replace(/\D/g, '') : '';
    if (cleanCep.length !== 8) {
      return { isValid: false, error: 'Por favor, informe um CEP válido com 8 dígitos.' };
    }
    if (!address.street || address.street.trim().length === 0) {
      return { isValid: false, error: 'O logradouro/rua é obrigatório para entrega.' };
    }
    if (!address.number || address.number.trim().length === 0) {
      return { isValid: false, error: 'O número do endereço é obrigatório.' };
    }
    if (!address.neighborhood || address.neighborhood.trim().length === 0) {
      return { isValid: false, error: 'O bairro de entrega é obrigatório.' };
    }
    if (!address.city || address.city.trim().length === 0) {
      return { isValid: false, error: 'A cidade de entrega é obrigatória.' };
    }

    return { isValid: true };
  }

  public static validateCashPayment(
    total: number,
    cashAmountGiven: number
  ): { isValid: boolean; error?: string; changeDue?: number } {
    if (isNaN(cashAmountGiven) || cashAmountGiven < total) {
      return {
        isValid: false,
        error: `O valor em dinheiro informado (R$ ${cashAmountGiven.toFixed(2).replace('.', ',')}) é menor que o total do pedido (R$ ${total.toFixed(2).replace('.', ',')}).`
      };
    }
    const changeDue = Math.max(0, cashAmountGiven - total);
    return { isValid: true, changeDue };
  }
}

/**
 * Validador de Regras de Produtos / Cupcakes
 */
export class CupcakeValidator {
  public static validateCupcake(cupcake: Partial<Cupcake>): { isValid: boolean; error?: string } {
    if (!cupcake.name || cupcake.name.trim().length < 3) {
      return { isValid: false, error: 'O nome do cupcake deve ter pelo menos 3 caracteres.' };
    }
    if (cupcake.price === undefined || cupcake.price <= 0) {
      return { isValid: false, error: 'O preço do cupcake deve ser maior que zero.' };
    }
    if (cupcake.stock === undefined || cupcake.stock < 0) {
      return { isValid: false, error: 'A quantidade em estoque não pode ser negativa.' };
    }
    if (!cupcake.category) {
      return { isValid: false, error: 'A categoria do cupcake é obrigatória.' };
    }
    return { isValid: true };
  }
}

/**
 * Validador e Helper de Alérgenos
 */
export class AllergenValidator {
  public static readonly VALID_ALLERGENS: AllergenType[] = [
    'Glúten',
    'Lactose',
    'Ovos',
    'Nozes / Castanhas',
    'Soja'
  ];

  public static hasAllergen(cupcake: Cupcake, allergen: AllergenType): boolean {
    return cupcake.allergens.includes(allergen);
  }

  public static filterSafeForConsumer(cupcakes: Cupcake[], excludedAllergen: string | null): Cupcake[] {
    if (!excludedAllergen) return cupcakes;
    return cupcakes.filter((cup) => !cup.allergens.includes(excludedAllergen as AllergenType));
  }
}
