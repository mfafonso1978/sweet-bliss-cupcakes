import { User } from '../types';

export interface RegisteredUser extends User {
  password?: string;
}

export const INITIAL_REGISTERED_USERS: RegisteredUser[] = [
  {
    id: 'usr-demo-1',
    name: 'Maria Silva',
    email: 'cliente@sweetbliss.com',
    phone: '(11) 98765-4321',
    birthDate: '1995-05-15',
    password: 'senha123',
    addresses: [
      {
        cep: '01310-100',
        street: 'Avenida Paulista',
        number: '1000',
        complement: 'Apto 42',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP'
      }
    ]
  }
];
