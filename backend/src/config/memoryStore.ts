import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { config } from './config';

export let isMemoryMode = false;
export const setMemoryMode = (val: boolean) => {
  isMemoryMode = val;
};

const RUNTIME_SETTINGS_PATH = path.resolve(process.cwd(), '.runtime-settings.json');

const loadSavedSettings = () => {
  try {
    if (fs.existsSync(RUNTIME_SETTINGS_PATH)) {
      return JSON.parse(fs.readFileSync(RUNTIME_SETTINGS_PATH, 'utf-8'));
    }
  } catch {}
  return {};
};

const savedSettings = loadSavedSettings();

// Runtime platform settings (persisted to .runtime-settings.json + config)
export const systemSettings = {
  geminiApiKey: config.geminiApiKey || savedSettings.geminiApiKey || '',
  cpiCutoff: typeof savedSettings.cpiCutoff === 'number' ? savedSettings.cpiCutoff : 0.85,
  spiCutoff: typeof savedSettings.spiCutoff === 'number' ? savedSettings.spiCutoff : 0.85,
  criticalCutoff: typeof savedSettings.criticalCutoff === 'number' ? savedSettings.criticalCutoff : 75,
  emailAlerts: typeof savedSettings.emailAlerts === 'boolean' ? savedSettings.emailAlerts : true,
  tokenBudgetLimit: typeof savedSettings.tokenBudgetLimit === 'number' ? savedSettings.tokenBudgetLimit : 1000000,
  tokenUsage: {
    totalUsed: typeof savedSettings.tokenUsage?.totalUsed === 'number' ? savedSettings.tokenUsage.totalUsed : 0,
    promptUsed: typeof savedSettings.tokenUsage?.promptUsed === 'number' ? savedSettings.tokenUsage.promptUsed : 0,
    responseUsed: typeof savedSettings.tokenUsage?.responseUsed === 'number' ? savedSettings.tokenUsage.responseUsed : 0,
    requestsCount: typeof savedSettings.tokenUsage?.requestsCount === 'number' ? savedSettings.tokenUsage.requestsCount : 0,
    lastModel: typeof savedSettings.tokenUsage?.lastModel === 'string' ? savedSettings.tokenUsage.lastModel : 'gemini-3.8-flash',
    contextWindowLimit: typeof savedSettings.tokenUsage?.contextWindowLimit === 'number' ? savedSettings.tokenUsage.contextWindowLimit : 1048576
  }
};

export const getTokenStats = () => {
  const totalBudget = systemSettings.tokenBudgetLimit;
  const usedTokens = systemSettings.tokenUsage.totalUsed;
  const remainingTokens = Math.max(0, totalBudget - usedTokens);
  return {
    totalBudget,
    usedTokens,
    remainingTokens,
    promptTokensUsed: systemSettings.tokenUsage.promptUsed,
    responseTokensUsed: systemSettings.tokenUsage.responseUsed,
    requestsCount: systemSettings.tokenUsage.requestsCount,
    lastModel: systemSettings.tokenUsage.lastModel,
    contextWindowLimit: systemSettings.tokenUsage.contextWindowLimit
  };
};

export const persistSystemSettings = () => {
  try {
    fs.writeFileSync(RUNTIME_SETTINGS_PATH, JSON.stringify(systemSettings, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Settings] Unable to persist runtime settings:', err);
  }
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

