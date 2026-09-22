import { Cupcake, CupcakeCategory, CartItem, AllergenType } from '../models/types';
import { initialCupcakes } from '../models/seedData';
import { CupcakeValidator } from '../models/validators';

const CATALOG_STORAGE_KEY = 'cupcake_catalog';

/**
 * Controller responsável pelo Catálogo de Produtos, Filtros de Busca, Controle de Estoque e CRUD Administrativo (MVC)
 */
export class CatalogController {
  /**
   * Obtém a lista de cupcakes do catálogo, garantindo autocorreção de URLs e persistência
   */
  public static getCatalog(): Cupcake[] {
    try {
      const saved = localStorage.getItem(CATALOG_STORAGE_KEY);
      if (saved) {
        const parsed: Cupcake[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Autocura de imagens antigas ou corrompidas
          return parsed.map((c) => {
            if (
              c.image.includes('photo-1535141192574-5d4897c13136') ||
              (c.id === 'cup-07' && (!c.image || c.image.includes('1535141192574')))
            ) {
              return {
                ...c,
                image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80'
              };
            }
            return c;
          });
        }
      }
    } catch (e) {
      console.error('Erro ao ler catálogo do localStorage:', e);
    }
    return initialCupcakes;
  }

  /**
   * Salva o catálogo de cupcakes no localStorage
   */
  public static saveCatalog(cupcakes: Cupcake[]): void {
    try {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(cupcakes));
    } catch (e) {
      console.error('Erro ao salvar catálogo no localStorage:', e);
    }
  }

  /**
   * Filtra os produtos por categoria, termo de busca e exclusão de alérgenos
   */
  public static filterCatalog(
    cupcakes: Cupcake[],
    category: CupcakeCategory = 'Todas',
    searchTerm: string = '',
    allergenExclusion: string | null = null
  ): Cupcake[] {
    const cleanSearch = searchTerm.trim().toLowerCase();

    return cupcakes.filter((c) => {
      // 1. Filtro por Categoria
      const matchesCat = category === 'Todas' || c.category === category;

      // 2. Filtro por Termo de Busca (Nome, Descrição, Ingredientes ou Alérgenos)
      const matchesSearch =
        !cleanSearch ||
        c.name.toLowerCase().includes(cleanSearch) ||
        c.description.toLowerCase().includes(cleanSearch) ||
        c.ingredients.some((i) => i.toLowerCase().includes(cleanSearch)) ||
        c.allergens.some((a) => a.toLowerCase().includes(cleanSearch));

      // 3. Filtro por Exclusão de Alérgenos (IHC e Segurança Alimentar)
      const matchesAllergen = allergenExclusion
        ? !c.allergens.includes(allergenExclusion as AllergenType)
        : true;

      return matchesCat && matchesSearch && matchesAllergen;
    });
  }

  /**
   * Dá baixa automática no estoque dos cupcakes após confirmação de um pedido
   */
  public static deductStock(items: CartItem[]): Cupcake[] {
    const current = this.getCatalog();
    const updated = current.map((cupcake) => {
      const cartItem = items.find((it) => it.cupcake.id === cupcake.id);
      if (cartItem) {
        return {
          ...cupcake,
          stock: Math.max(0, cupcake.stock - cartItem.quantity)
        };
      }
      return cupcake;
    });

    this.saveCatalog(updated);
    return updated;
  }

  /**
   * Adiciona um novo cupcake ao catálogo (Admin)
   */
  public static addCupcake(cupcake: Cupcake): {
    success: boolean;
    cupcakes: Cupcake[];
    error?: string;
  } {
    const valResult = CupcakeValidator.validateCupcake(cupcake);
    if (!valResult.isValid) {
      return { success: false, cupcakes: this.getCatalog(), error: valResult.error };
    }

    const current = this.getCatalog();
    const updated = [cupcake, ...current];
    this.saveCatalog(updated);
    return { success: true, cupcakes: updated };
  }

  /**
   * Atualiza as informações de um cupcake existente (Admin)
   */
  public static updateCupcake(updated: Cupcake): {
    success: boolean;
    cupcakes: Cupcake[];
    error?: string;
  } {
    const valResult = CupcakeValidator.validateCupcake(updated);
    if (!valResult.isValid) {
      return { success: false, cupcakes: this.getCatalog(), error: valResult.error };
    }

    const current = this.getCatalog();
    const updatedList = current.map((c) => (c.id === updated.id ? updated : c));
    this.saveCatalog(updatedList);
    return { success: true, cupcakes: updatedList };
  }

  /**
   * Remove um cupcake do catálogo (Admin)
   */
  public static deleteCupcake(cupcakeId: string): Cupcake[] {
    const current = this.getCatalog();
    const updated = current.filter((c) => c.id !== cupcakeId);
    this.saveCatalog(updated);
    return updated;
  }

  /**
   * Restaura o catálogo padrão original a partir dos dados sementes
   */
  public static resetCatalog(): Cupcake[] {
    this.saveCatalog(initialCupcakes);
    return initialCupcakes;
  }
}
