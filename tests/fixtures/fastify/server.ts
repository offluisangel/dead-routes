import Fastify from 'fastify';

const fastify = Fastify();

// Routes that ARE used
fastify.get('/api/users', async (request, reply) => {
  return { users: [] };
});

fastify.post('/api/users', async (request, reply) => {
  return { id: 1 };
});

// DEAD ROUTES
fastify.get('/api/v1/export', async (request, reply) => {
  return { data: [] };
});

fastify.delete('/api/v1/users/:id', async (request, reply) => {
  return { deleted: true };
});

export default fastify;
