import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/core/database/schema/auth.schema.ts',
  out: './src/core/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
