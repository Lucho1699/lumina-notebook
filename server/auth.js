import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'lumina-local-secret-jwt-key-2026-safe-notebook';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

/**
 * Hash a plain password using bcrypt
 */
export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compare plain password with stored bcrypt hash
 */
export async function comparePassword(plainPassword, hash) {
  return await bcrypt.compare(plainPassword, hash);
}

/**
 * Generate a signed JWT token containing user identity
 */
export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Sanitize user object by removing passwordHash before sending to client
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

/**
 * Express middleware to authenticate JWT token from Authorization header
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({ error: 'Token de sesión no proporcionado.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Token de sesión expirado o inválido.' });
  }

  req.user = decoded;
  next();
}
