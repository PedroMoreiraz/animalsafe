import multipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";

export function registerMultipart(app: FastifyInstance): void {
  app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1,
      fields: 10,
    },
  });
}