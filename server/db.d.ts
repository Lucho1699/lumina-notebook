export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarColor?: string;
  createdAt: number;
  updatedAt: number;
}

export function getAllUsers(): DbUser[];
export function saveAllUsers(users: DbUser[]): boolean;
export function findUserByEmail(email: string): DbUser | null;
export function findUserById(id: string): DbUser | null;
export function createUser(userData: {
  name: string;
  email: string;
  passwordHash: string;
  avatarColor?: string;
}): DbUser;
export function updateUser(id: string, updateData: Partial<DbUser>): DbUser | null;
