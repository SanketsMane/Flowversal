import { FastifyPluginAsync } from 'fastify';
import mongoose from 'mongoose';
import { env } from '../core/config/env';
import { register } from '../core/monitoring/metrics';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // Readiness probe - checks if service is ready to accept traffic
  fastify.get('/ready', async (request, reply) => {
    const checks = await Promise.allSettled([
      checkDatabaseConnection(),
      checkRedisConnection(),
      checkExternalServices(),
    ]);

    const results = checks.map((check, index) => {
      const names = ['database', 'redis', 'external'];
      if (check.status === 'fulfilled') {
        return { name: names[index], status: 'ok', ...check.value };
      }
      return { name: names[index], status: 'error', error: check.reason?.message || 'Unknown error' };
    });

    const isReady = results.every((result) => result.status === 'ok');

    reply.code(isReady ? 200 : 503).send({
      status: isReady ? 'ready' : 'not ready',
      checks: results,
      timestamp: new Date().toISOString(),
    });
  });

  // Liveness probe - checks if service is alive
  fastify.get('/live', async (request, reply) => {
    reply.send({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });

  // Detailed health check
  fastify.get('/health', async (request, reply) => {
    const health = await performComprehensiveHealthCheck();

    reply.code(health.overall === 'unhealthy' ? 503 : 200).send(health);
  });

  // Metrics endpoint for Prometheus
  if (env.ENABLE_METRICS) {
    fastify.get('/metrics', async (request, reply) => {
      reply.type('text/plain');
      reply.send(await register.metrics());
    });
  }
};

async function checkDatabaseConnection(): Promise<{ latency: number }> {
  const startTime = Date.now();
  try {
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }
    await mongoose.connection.db.admin().ping();
    return { latency: Date.now() - startTime };
  } catch (error: any) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

async function checkRedisConnection(): Promise<{ status: string }> {
  // TODO: Implement Redis health check when Redis is added
  // For now, return healthy as Redis is optional
  return { status: 'not configured' };
}

async function checkExternalServices(): Promise<{ services: Record<string, string> }> {
  const services: Record<string, string> = {};

  // Check Supabase
  try {
    // Simple check - in production, you might want to ping the actual API
    services.supabase = process.env.SUPABASE_URL ? 'configured' : 'not configured';
  } catch {
    services.supabase = 'error';
  }

  // Check Pinecone
  try {
    services.pinecone = process.env.PINECONE_API_KEY ? 'configured' : 'not configured';
  } catch {
    services.pinecone = 'error';
  }

  return { services };
}

async function performComprehensiveHealthCheck(): Promise<{
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: { status: string; latency?: number };
    memory: { status: string; usage: NodeJS.MemoryUsage };
    cpu: { status: string; usage: number };
    external: { status: string; services: Record<string, string> };
  };
}> {
  const checks = {
    database: { status: 'unknown' as string, latency: undefined as number | undefined },
    memory: { status: 'unknown' as string, usage: process.memoryUsage() },
    cpu: { status: 'unknown' as string, usage: process.cpuUsage().user },
    external: { status: 'unknown' as string, services: {} as Record<string, string> },
  };

  // Database check
  try {
    const dbCheck = await checkDatabaseConnection();
    checks.database = { status: 'ok', latency: dbCheck.latency };
  } catch (error: any) {
    checks.database = { status: 'error', latency: undefined };
  }

  // Memory check
  const memoryUsage = process.memoryUsage();
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  checks.memory.status = memoryUsagePercent > 90 ? 'warning' : 'ok';

  // CPU check (simplified)
  checks.cpu.status = 'ok';

  // External services check
  try {
    const externalCheck = await checkExternalServices();
    checks.external = { status: 'ok', services: externalCheck.services };
  } catch {
    checks.external = { status: 'error', services: {} };
  }

  // Determine overall health
  const criticalChecks = [checks.database.status];
  const hasErrors = criticalChecks.some((status) => status === 'error');
  const hasWarnings = Object.values(checks).some((check: any) => check.status === 'warning');

  let overall: 'healthy' | 'degraded' | 'unhealthy';
  if (hasErrors) {
    overall = 'unhealthy';
  } else if (hasWarnings) {
    overall = 'degraded';
  } else {
    overall = 'healthy';
  }

  return {
    overall,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: env.NODE_ENV,
    checks,
  };
}

export default healthRoutes;
