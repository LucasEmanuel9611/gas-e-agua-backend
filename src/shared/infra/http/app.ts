import Fastify from "fastify";
const fastify = Fastify({ logger: true });

const port = 3333;

export { fastify, port };
