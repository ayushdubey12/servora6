// Shared configuration — imported by server.ts and admin.ts to avoid circular deps

const JWT_SECRET = process.env.JWT_SECRET || '';

if (process.env.NODE_ENV === 'production' && JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET env var must be set to at least 32 random characters in production.');
  console.error('Generate one with: openssl rand -hex 48');
  process.exit(1);
}

export const SECRET = JWT_SECRET || 'insecure-dev-secret-do-not-use-in-production';
