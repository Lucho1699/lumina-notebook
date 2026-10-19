import type { Request, Response, NextFunction } from 'express';

export function hashPassword(plainPassword: string): Promise<string>;
export function comparePassword(plainPassword: string, hash: string): Promise<boolean>;
export function generateToken(user: { id: string; email: string; name: string }): string;
export function verifyToken(token: string): { id: string; email: string; name: string } | null;
export function sanitizeUser<T extends { passwordHash?: string }>(user: T): Omit<T, 'passwordHash'> | null;
export function authenticateToken(req: Request & { user?: any }, res: Response, next: NextFunction): void;
