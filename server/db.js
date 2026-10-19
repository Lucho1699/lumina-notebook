import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory and users.json exist
function ensureDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

/**
 * Read all users from the JSON database
 */
export function getAllUsers() {
  ensureDatabase();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) || [];
  } catch (err) {
    console.error('Error reading users database:', err);
    return [];
  }
}

/**
 * Save users array to the JSON database
 */
export function saveAllUsers(users) {
  ensureDatabase();
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(users, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Error writing users database:', err);
    return false;
  }
}

/**
 * Find user by email (case-insensitive)
 */
export function findUserByEmail(email) {
  if (!email) return null;
  const users = getAllUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized) || null;
}

/**
 * Find user by ID
 */
export function findUserById(id) {
  if (!id) return null;
  const users = getAllUsers();
  return users.find((u) => u.id === id) || null;
}

/**
 * Create and persist a new user
 */
export function createUser({ name, email, passwordHash, avatarColor }) {
  ensureDatabase();
  const users = getAllUsers();
  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    avatarColor: avatarColor || '#f59e0b',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  users.push(newUser);
  saveAllUsers(users);
  return newUser;
}

/**
 * Update existing user
 */
export function updateUser(id, updateData) {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    ...updateData,
    updatedAt: Date.now(),
  };

  saveAllUsers(users);
  return users[index];
}
