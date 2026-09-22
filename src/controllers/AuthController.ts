import { User, RegisteredUser } from '../models/types';
import { AuthValidator } from '../models/validators';
import { INITIAL_REGISTERED_USERS } from '../models/seedData';

const CURRENT_USER_KEY = 'cupcake_current_user';
const REGISTERED_USERS_KEY = 'cupcake_registered_users';
const ADMIN_SESSION_KEY = 'sweetbliss_admin_session';
const ADMIN_PASSWORD_KEY = 'sweetbliss_admin_password';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string;
}

/**
 * Controller responsável pela Autenticação, Controle de Sessão, Perfis e Permissões Administrativas (MVC)
 */
export class AuthController {
  private static failedAttempts: Record<string, number> = {};
  private static blockedEmails: Record<string, number> = {}; // email -> timestamp de desbloqueio

  /**
   * Obtém o usuário atualmente autenticado
   */
  public static getCurrentUser(): User | null {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler usuário atual:', e);
    }
    return null;
  }

  /**
   * Atualiza ou remove a sessão do usuário atual
   */
  public static setCurrentUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Erro ao salvar usuário atual:', e);
    }
  }

  /**
   * Obtém a lista de usuários registrados no sistema
   */
  public static getRegisteredUsers(): RegisteredUser[] {
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Inicializa com os usuários sementes se vazio
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(INITIAL_REGISTERED_USERS));
      return INITIAL_REGISTERED_USERS;
    } catch {
      return INITIAL_REGISTERED_USERS;
    }
  }

  /**
   * Persiste a lista de usuários registrados
   */
  public static saveRegisteredUsers(users: RegisteredUser[]): void {
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Erro ao salvar usuários registrados:', e);
    }
  }

  /**
   * Realiza a autenticação do cliente com proteção contra força bruta
   */
  public static login(
    email: string,
    password: string
  ): {
    success: boolean;
    user?: User;
    error?: string;
    notRegistered?: boolean;
    attempts?: number;
    isBlocked?: boolean;
  } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Por favor, preencha o e-mail e a senha cadastrados.' };
    }

    // Checagem de bloqueio por tentativas
    const unlockTime = this.blockedEmails[cleanEmail];
    if (unlockTime && Date.now() < unlockTime) {
      const waitMinutes = Math.ceil((unlockTime - Date.now()) / 60000);
      return {
        success: false,
        isBlocked: true,
        error: `Conta temporariamente bloqueada por segurança após 5 tentativas incorretas. Tente novamente em ${waitMinutes} minuto(s).`
      };
    }

    const savedUsers = this.getRegisteredUsers();
    const existing = savedUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
      return {
        success: false,
        notRegistered: true,
        error: 'Cadastro não encontrado para este e-mail. É obrigatório ter uma conta registrada para entrar.'
      };
    }

    // Verificação de senha
    if (existing.password && existing.password !== cleanPassword) {
      const attempts = (this.failedAttempts[cleanEmail] || 0) + 1;
      this.failedAttempts[cleanEmail] = attempts;

      if (attempts >= 5) {
        this.blockedEmails[cleanEmail] = Date.now() + 5 * 60 * 1000; // 5 minutos de bloqueio
        return {
          success: false,
          isBlocked: true,
          attempts,
          error: 'Conta bloqueada temporariamente por 5 minutos após 5 tentativas incorretas.'
        };
      }

      return {
        success: false,
        attempts,
        error: `Senha incorreta. Verifique seus dados e tente novamente (tentativa ${attempts} de 5).`
      };
    }

    // Sucesso - Limpa tentativas e inicia sessão
    delete this.failedAttempts[cleanEmail];
    delete this.blockedEmails[cleanEmail];

    const safeUser: User = {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      phone: existing.phone,
      birthDate: existing.birthDate,
      addresses: existing.addresses || []
    };

    this.setCurrentUser(safeUser);
    return { success: true, user: safeUser };
  }

  /**
   * Registra um novo cliente no sistema
   */
  public static register(data: RegisterUserInput): {
    success: boolean;
    user?: User;
    error?: string;
  } {
    const valResult = AuthValidator.validateRegistration({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone
    });

    if (!valResult.isValid) {
      return { success: false, error: valResult.error };
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const users = this.getRegisteredUsers();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'Já existe uma conta cadastrada com este e-mail. Utilize a aba "Já sou Cliente" para entrar.'
      };
    }

    const newUser: RegisteredUser = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone?.trim() || '',
      birthDate: data.birthDate || '',
      password: data.password.trim(),
      role: 'customer',
      addresses: []
    };

    users.push(newUser);
    this.saveRegisteredUsers(users);

    const safeUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      birthDate: newUser.birthDate,
      addresses: newUser.addresses
    };

    this.setCurrentUser(safeUser);
    return { success: true, user: safeUser };
  }

  /**
   * Atualiza dados de perfil do usuário autenticado
   */
  public static updateProfile(updatedUser: User): { success: boolean; user?: User; error?: string } {
    if (!AuthValidator.isValidEmail(updatedUser.email)) {
      return { success: false, error: 'Endereço de e-mail inválido.' };
    }

    const users = this.getRegisteredUsers();
    const idx = users.findIndex(
      (u) => u.id === updatedUser.id || u.email.toLowerCase() === updatedUser.email.toLowerCase()
    );

    if (idx >= 0) {
      users[idx] = {
        ...users[idx],
        ...updatedUser
      };
      this.saveRegisteredUsers(users);
      this.setCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    }

    return { success: false, error: 'Usuário não encontrado na base de dados.' };
  }

  /**
   * Encerra a sessão ativa do cliente
   */
  public static logout(): void {
    this.setCurrentUser(null);
  }

  /**
   * Autenticação da Área Administrativa
   */
  public static loginAdmin(username: string, password: string): { success: boolean; error?: string } {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'Informe usuário e senha de administrador.' };
    }

    const validUsers = ['admin', 'admin@sweetbliss.com.br', 'gerente'];
    const defaultPass = 'admin123';
    const storedPass = localStorage.getItem(ADMIN_PASSWORD_KEY) || defaultPass;

    if (validUsers.includes(cleanUser) && (cleanPass === storedPass || cleanPass === defaultPass)) {
      try {
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch {}
      return { success: true };
    }

    return { success: false, error: 'Login ou senha incorretos. Verifique suas credenciais de administrador.' };
  }

  /**
   * Verifica se a sessão do administrador está ativa
   */
  public static isAdminAuthenticated(): boolean {
    try {
      return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Encerra a sessão de administrador
   */
  public static logoutAdmin(): void {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {}
  }
}
