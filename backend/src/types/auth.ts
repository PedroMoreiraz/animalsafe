export type RegisterBody = {
  username: string;
  primeiroNome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
};

export type LoginBody = {
  identifier: string;
  senha: string;
};

export type SessionPayload = {
  userId: number;
  expiresAt: number;
};