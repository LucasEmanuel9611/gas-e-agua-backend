import { fastify, port } from "./app";

const start = async () => {
  try {
    await fastify.listen({ port });
    console.log(`Servidor rodando em http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
