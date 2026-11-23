import type { FastifyPluginAsync } from "fastify";

import {
  getPublicUser,
  isUniqueConstraintError,
  loginUser,
  registerUser,
} from "../services/auth.service.ts";

import {
  clearSessionCookie,
  getAuthenticatedUserId,
  setSessionCookie,
} from "../lib/session.ts";

import type { LoginBody, RegisterBody } from "../types/auth.ts";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: RegisterBody }>(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: [
            "username",
            "primeiroNome",
            "sobrenome",
            "email",
            "cpf",
            "telefone",
            "senha",
          ],
          properties: {
            username: {
              type: "string",
              minLength: 3,
              maxLength: 30,
              pattern: "^[a-zA-Z0-9._-]+$",
            },
            primeiroNome: { type: "string", minLength: 1, maxLength: 60 },
            sobrenome: { type: "string", minLength: 1, maxLength: 80 },
            email: {
              type: "string",
              minLength: 3,
              maxLength: 254,
              pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            },
            cpf: { type: "string", minLength: 11, maxLength: 14 },
            telefone: { type: "string", minLength: 10, maxLength: 20 },
            senha: { type: "string", minLength: 8, maxLength: 128 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await registerUser(request.body);
        setSessionCookie(reply, user.id);

        return reply.code(201).send({ user });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          return reply.code(409).send({
            message: "Usuário, e-mail ou CPF já cadastrado.",
          });
        }

        if (error instanceof Error) {
          if (error.message === "INVALID_DOCUMENT_OR_PHONE") {
            return reply.code(400).send({
              message: "Informe um CPF e telefone válidos.",
            });
          }

          if (error.message === "INVALID_NAME") {
            return reply.code(400).send({
              message: "Informe seu nome e sobrenome.",
            });
          }

          if (error.message === "USER_ALREADY_EXISTS") {
            return reply.code(409).send({
              message: "Usuário, e-mail ou CPF já cadastrado.",
            });
          }
        }

        throw error;
      }
    },
  );

  app.post<{ Body: LoginBody }>(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["identifier", "senha"],
          properties: {
            identifier: { type: "string", minLength: 1, maxLength: 254 },
            senha: { type: "string", minLength: 1, maxLength: 128 },
          },
        },
      },
    },
    async (request, reply) => {
      const user = await loginUser(
        request.body.identifier,
        request.body.senha,
      );

      if (!user) {
        return reply.code(401).send({
          message: "E-mail/usuário ou senha inválidos.",
        });
      }

      setSessionCookie(reply, user.id);
      return reply.send({ user });
    },
  );

  app.get("/me", async (request, reply) => {
    const userId = await getAuthenticatedUserId(request, reply);
    if (!userId) return;

    const user = await getPublicUser(userId);

    if (!user) {
      clearSessionCookie(reply);
      return reply.code(401).send({
        message: "Sessão inválida ou expirada.",
      });
    }

    return reply.send({ user });
  });

  app.post("/logout", async (_request, reply) => {
    clearSessionCookie(reply);
    return reply.code(204).send();
  });
};