import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
} from './db.js';
import {
  hashPassword,
  comparePassword,
  generateToken,
  sanitizeUser,
  authenticateToken,
} from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PATH = path.join(__dirname, '..', 'dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static web app assets from dist/ in production / standalone mode
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
}

// Health check endpoint for Render / monitoring
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Lumina Notebook Production Auth Server',
    time: new Date().toISOString(),
  });
});

// List of pleasant avatar colors
const AVATAR_COLORS = [
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

/**
 * Register endpoint: POST /api/auth/register
 * Body: { name, email, password }
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        error: 'El nombre debe tener al menos 2 caracteres.',
      });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        error: 'Por favor ingresa un correo electrónico válido.',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({
        error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.',
      });
    }

    // Hash password with bcrypt
    const passwordHash = await hashPassword(password);

    // Pick a random avatar color
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    // Create user in local storage
    const newUser = createUser({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      avatarColor,
    });

    // Generate JWT token
    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Cuenta creada exitosamente en local.',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    console.error('Error during registration:', err);
    return res.status(500).json({
      error: 'Error interno del servidor al registrar el usuario.',
    });
  }
});

/**
 * Login endpoint: POST /api/auth/login
 * Body: { email, password }
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Por favor ingresa correo electrónico y contraseña.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = findUserByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas. Correo no encontrado.',
      });
    }

    // Verify password with bcrypt
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Credenciales inválidas. Contraseña incorrecta.',
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.json({
      message: 'Sesión iniciada correctamente.',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({
      error: 'Error interno del servidor al iniciar sesión.',
    });
  }
});

/**
 * Get current authenticated user: GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    return res.json({
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('Error in /api/auth/me:', err);
    return res.status(500).json({ error: 'Error al obtener datos del usuario.' });
  }
});

/**
 * Update user profile: PUT /api/auth/profile
 * Header: Authorization: Bearer <token>
 * Body: { name, newPassword, currentPassword }
 */
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const { name, currentPassword, newPassword } = req.body;
    const updates = {};

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      updates.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          error: 'Debes ingresar tu contraseña actual para cambiarla.',
        });
      }
      const isMatch = await comparePassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'La contraseña actual no es correcta.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'La nueva contraseña debe tener al menos 6 caracteres.',
        });
      }
      updates.passwordHash = await hashPassword(newPassword);
    }

    const updated = updateUser(user.id, updates);
    return res.json({
      message: 'Perfil actualizado con éxito.',
      user: sanitizeUser(updated),
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ error: 'Error al actualizar el perfil.' });
  }
});

// Fallback for Single Page Application client-side routing (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(DIST_PATH, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// Start listening if run directly
export const server = app.listen(PORT, () => {
  console.log(`🚀 Lumina Notebook Auth Server activo en http://localhost:${PORT}`);
});

export default app;
