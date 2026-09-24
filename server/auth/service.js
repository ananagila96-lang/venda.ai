import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const RESET_TTL_MS = 1000 * 60 * 30;

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeDocument(value) {
  return String(value || '').replace(/\D/g, '');
}

function hashToken(token) {
  return createHash('sha256').update(String(token)).digest('hex');
}

function publicUser(row) {
  return {
    id: row.user_id || row.id,
    tenantId: row.tenant_id,
    name: row.user_name || row.name,
    email: row.user_email || row.email,
    tenantName: row.tenant_name,
    tenantStatus: row.tenant_status
  };
}

export async function hashPassword(password) {
  const value = String(password || '');
  if (value.length < 8) {
    const error = new Error('A senha precisa ter pelo menos 8 caracteres.');
    error.code = 'WEAK_PASSWORD';
    error.status = 400;
    throw error;
  }

  const salt = randomBytes(16);
  const derived = await scrypt(value, salt, 64);
  return `scrypt$${salt.toString('hex')}$${Buffer.from(derived).toString('hex')}`;
}

export async function verifyPassword(password, storedHash) {
  const [algorithm, saltHex, digestHex] = String(storedHash || '').split('$');
  if (algorithm !== 'scrypt' || !saltHex || !digestHex) return false;

  const expected = Buffer.from(digestHex, 'hex');
  const actual = Buffer.from(await scrypt(String(password || ''), Buffer.from(saltHex, 'hex'), expected.length));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createAuthService({ query, now = () => new Date(), tokenFactory = () => randomBytes(32).toString('hex') } = {}) {
  if (typeof query !== 'function') throw new Error('Auth service requires query');

  async function signup(input = {}) {
    const name = String(input.name || '').trim();
    const company = String(input.company || '').trim();
    const document = normalizeDocument(input.document);
    const phone = String(input.phone || '').trim();
    const email = normalizeEmail(input.email);
    const city = String(input.city || '').trim();
    const state = String(input.state || '').trim().toUpperCase().slice(0, 2);
    const businessType = String(input.businessType || '').trim();
    const contactConsent = Boolean(input.contactConsent);

    if (!name || !company || !phone || !email || !city || state.length !== 2 || !businessType || !contactConsent) {
      const error = new Error('Preencha todos os campos obrigatórios do cadastro.');
      error.code = 'INVALID_SIGNUP';
      error.status = 400;
      throw error;
    }

    const passwordHash = await hashPassword(input.password);

    try {
      const result = await query(
        `WITH new_tenant AS (
           INSERT INTO tenants (name, document, phone, email, city, state, business_type, contact_consent, status)
           VALUES ($1, NULLIF($2, ''), $3, $4, $5, $6, $7, $8, 'PENDING')
           RETURNING id, name, status
         )
         INSERT INTO users (tenant_id, name, email, password_hash, status)
         SELECT id, $9, $4, $10, 'ACTIVE' FROM new_tenant
         RETURNING id AS user_id, tenant_id, name AS user_name, email AS user_email`,
        [company, document, phone, email, city, state, businessType, contactConsent, name, passwordHash]
      );

      const row = result.rows[0];
      return { ...publicUser(row), tenantStatus: 'PENDING' };
    } catch (error) {
      if (error?.code === '23505') {
        const conflict = new Error('Já existe um cadastro com este e-mail ou CPF/CNPJ.');
        conflict.code = 'SIGNUP_EXISTS';
        conflict.status = 409;
        throw conflict;
      }
      throw error;
    }
  }

  async function login({ email, password } = {}) {
    const normalizedEmail = normalizeEmail(email);
    const result = await query(
      `SELECT u.id AS user_id, u.tenant_id, u.name AS user_name, u.email AS user_email,
              u.password_hash, u.status AS user_status,
              t.name AS tenant_name, t.status AS tenant_status
       FROM users u
       JOIN tenants t ON t.id = u.tenant_id
       WHERE LOWER(u.email) = $1
       LIMIT 1`,
      [normalizedEmail]
    );

    const row = result.rows[0];
    const valid = row && row.user_status === 'ACTIVE' && await verifyPassword(password, row.password_hash);
    if (!valid) {
      const error = new Error('E-mail ou senha inválidos.');
      error.code = 'INVALID_CREDENTIALS';
      error.status = 401;
      throw error;
    }

    if (row.tenant_status !== 'ACTIVE') {
      const error = new Error('Cadastro recebido. A ativação da conta ainda está pendente.');
      error.code = 'ACCOUNT_PENDING';
      error.status = 403;
      throw error;
    }

    const token = tokenFactory();
    const expiresAt = new Date(now().getTime() + SESSION_TTL_MS);
    await query(
      `INSERT INTO auth_sessions (user_id, tenant_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [row.user_id, row.tenant_id, hashToken(token), expiresAt.toISOString()]
    );
    await query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [row.user_id]);

    return { token, expiresAt: expiresAt.toISOString(), user: publicUser(row) };
  }

  async function requestPasswordReset(email) {
    const normalizedEmail = normalizeEmail(email);
    const result = await query(
      `SELECT u.id AS user_id, u.email, u.name, t.name AS tenant_name
       FROM users u
       JOIN tenants t ON t.id = u.tenant_id
       WHERE LOWER(u.email) = $1 AND u.status = 'ACTIVE'
       LIMIT 1`,
      [normalizedEmail]
    );

    const row = result.rows[0];
    if (!row) return null;

    await query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`, [row.user_id]);

    const token = tokenFactory();
    const expiresAt = new Date(now().getTime() + RESET_TTL_MS);
    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [row.user_id, hashToken(token), expiresAt.toISOString()]
    );

    return {
      token,
      expiresAt: expiresAt.toISOString(),
      user: { id: row.user_id, email: row.email, name: row.name, tenantName: row.tenant_name }
    };
  }

  async function resetPassword({ token, password } = {}) {
    const tokenHash = hashToken(token);
    const result = await query(
      `SELECT pr.id AS reset_id, pr.user_id
       FROM password_reset_tokens pr
       WHERE pr.token_hash = $1
         AND pr.used_at IS NULL
         AND pr.expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    const row = result.rows[0];
    if (!row) {
      const error = new Error('Este link de recuperação é inválido ou expirou.');
      error.code = 'INVALID_RESET_TOKEN';
      error.status = 400;
      throw error;
    }

    const passwordHash = await hashPassword(password);
    await query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [passwordHash, row.user_id]);
    await query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`, [row.reset_id]);
    await query(`UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`, [row.user_id]);
    return { ok: true };
  }

  async function verifySession(token) {
    if (!token) return null;
    const result = await query(
      `SELECT u.id AS user_id, u.tenant_id, u.name AS user_name, u.email AS user_email,
              t.name AS tenant_name, t.status AS tenant_status
       FROM auth_sessions s
       JOIN users u ON u.id = s.user_id
       JOIN tenants t ON t.id = s.tenant_id
       WHERE s.token_hash = $1
         AND s.revoked_at IS NULL
         AND s.expires_at > NOW()
         AND u.status = 'ACTIVE'
         AND t.status = 'ACTIVE'
       LIMIT 1`,
      [hashToken(token)]
    );
    return result.rows[0] ? publicUser(result.rows[0]) : null;
  }

  async function logout(token) {
    if (!token) return;
    await query(`UPDATE auth_sessions SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL`, [hashToken(token)]);
  }

  return { signup, login, requestPasswordReset, resetPassword, verifySession, logout };
}
