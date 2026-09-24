import { readFile } from 'node:fs/promises';

function positiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function createPostgresDatabase({
  env = process.env,
  postgresFactory
} = {}) {
  if (!env.DATABASE_URL) {
    throw new Error('Missing required database configuration: DATABASE_URL');
  }

  const factory = postgresFactory || (await import('postgres')).default;
  const sql = factory(env.DATABASE_URL, {
    max: positiveInt(env.DATABASE_POOL_MAX, 10),
    idle_timeout: positiveInt(env.DATABASE_IDLE_TIMEOUT_SECONDS, 20),
    connect_timeout: positiveInt(env.DATABASE_CONNECT_TIMEOUT_SECONDS, 10),
    max_lifetime: positiveInt(env.DATABASE_MAX_LIFETIME_SECONDS, 60 * 30)
  });

  async function query(text, params = []) {
    const rows = await sql.unsafe(text, params);
    return { rows: Array.from(rows || []) };
  }

  async function migrate() {
    for (const file of ['001_conversations.sql', '002_auth.sql']) {
      const migrationUrl = new URL(`./migrations/${file}`, import.meta.url);
      const migration = await readFile(migrationUrl, 'utf8');
      await sql.unsafe(migration).simple();
    }
  }

  async function close() {
    await sql.end({ timeout: 5 });
  }

  return { query, migrate, close };
}
