import bcrypt from 'bcryptjs';

export let isMemoryMode = false;
export const setMemoryMode = (val: boolean) => {
  isMemoryMode = val;
};

// In-memory collections
export const memoryStore = {
  users: [] as any[],
  projects: [] as any[],
  milestones: [] as any[],
  issues: [] as any[],
  expenditures: [] as any[],
  projectUpdates: [] as any[],
  activityLogs: [] as any[],
  notifications: [] as any[]
};

// Helper for generating ObjectId-like IDs
export const generateId = (): string => {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

export const memoryUserHelper = {
  comparePassword: async (candidate: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(candidate, hash);
  }
};

