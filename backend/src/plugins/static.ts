import fastifyStatic from "@fastify/static";
import type { FastifyInstance } from "fastify";

export function registerStatic(
  app: FastifyInstance,
  uploadsRoot: string,
): void {
  app.register(fastifyStatic, {
    root: uploadsRoot,
    prefix: "/uploads/",
  });
}