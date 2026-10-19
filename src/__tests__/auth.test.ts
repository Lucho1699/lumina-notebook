import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, comparePassword, generateToken, verifyToken, sanitizeUser } from '../../server/auth.js';
import { createUser, findUserByEmail, findUserById, getAllUsers, saveAllUsers } from '../../server/db.js';

describe('Local Auth Utilities (bcrypt & JWT)', () => {
  it('should hash password and verify match with bcrypt', async () => {
    const password = 'miSuperPassword123';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2')).toBe(true); // bcrypt prefix

    const isMatch = await comparePassword(password, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('wrongPass', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('should generate valid JWT and verify decoded token', () => {
    const mockUser = {
      id: 'usr-test-123',
      name: 'Estudiante Lumina',
      email: 'estudiante@lumina.edu',
    };

    const token = generateToken(mockUser);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // Header.Payload.Signature

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(mockUser.id);
    expect(decoded?.email).toBe(mockUser.email);
    expect(decoded?.name).toBe(mockUser.name);
  });

  it('should return null when verifying invalid JWT', () => {
    const invalidToken = 'not.a.valid.jwt.token';
    const decoded = verifyToken(invalidToken);
    expect(decoded).toBeNull();
  });

  it('should sanitize user by removing passwordHash', () => {
    const userWithHash = {
      id: 'usr-1',
      name: 'Test',
      email: 'test@example.com',
      passwordHash: '$2a$10$abcdefghijk...',
      createdAt: 123456789,
    };

    const safe = sanitizeUser(userWithHash);
    expect(safe).not.toBeNull();
    expect('passwordHash' in (safe ?? {})).toBe(false);
    expect(safe?.id).toBe('usr-1');
    expect(safe?.email).toBe('test@example.com');
  });
});

describe('Local File Database (server/db.js)', () => {
  beforeEach(() => {
    // Reset to empty database for test
    saveAllUsers([]);
  });

  it('should create user and find by email and id', () => {
    const user = createUser({
      name: 'Camila Torres',
      email: 'camila@lumina.edu',
      passwordHash: '$2a$10$xyz...',
      avatarColor: '#10b981',
    });

    expect(user.id).toBeDefined();
    expect(user.name).toBe('Camila Torres');
    expect(user.email).toBe('camila@lumina.edu');

    // Case insensitive find
    const foundByEmail = findUserByEmail('CAMILA@lumina.edu');
    expect(foundByEmail).not.toBeNull();
    expect(foundByEmail?.id).toBe(user.id);

    // Find by ID
    const foundById = findUserById(user.id);
    expect(foundById).not.toBeNull();
    expect(foundById?.name).toBe('Camila Torres');

    // All users count
    const all = getAllUsers();
    expect(all).toHaveLength(1);
  });
});
