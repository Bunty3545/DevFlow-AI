import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { systemSettings, persistSystemSettings } from '../config/memoryStore';
import { ActivityLogRepo } from '../models/store';

const maskApiKey = (key: string): string => {
  if (!key || key.trim().length < 8) return '';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
};

export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      hasGeminiApiKey: Boolean(systemSettings.geminiApiKey && systemSettings.geminiApiKey.trim().length > 10),
      maskedGeminiApiKey: maskApiKey(systemSettings.geminiApiKey),
      cpiCutoff: systemSettings.cpiCutoff,
      spiCutoff: systemSettings.spiCutoff,
      criticalCutoff: systemSettings.criticalCutoff,
      emailAlerts: systemSettings.emailAlerts,
      tokenBudgetLimit: systemSettings.tokenBudgetLimit
    }
  });
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { geminiApiKey, cpiCutoff, spiCutoff, criticalCutoff, emailAlerts, tokenBudgetLimit } = req.body;

    if (typeof geminiApiKey === 'string' && geminiApiKey.trim().length > 0) {
      systemSettings.geminiApiKey = geminiApiKey.trim();
    }
    if (cpiCutoff !== undefined && !Number.isNaN(Number(cpiCutoff))) {
      systemSettings.cpiCutoff = Number(cpiCutoff);
    }
    if (spiCutoff !== undefined && !Number.isNaN(Number(spiCutoff))) {
      systemSettings.spiCutoff = Number(spiCutoff);
    }
    if (criticalCutoff !== undefined && !Number.isNaN(Number(criticalCutoff))) {
      systemSettings.criticalCutoff = Number(criticalCutoff);
    }
    if (emailAlerts !== undefined) {
      systemSettings.emailAlerts = Boolean(emailAlerts);
    }
    if (tokenBudgetLimit !== undefined && !Number.isNaN(Number(tokenBudgetLimit)) && Number(tokenBudgetLimit) > 0) {
      systemSettings.tokenBudgetLimit = Number(tokenBudgetLimit);
    }

    persistSystemSettings();

    await ActivityLogRepo.create({
      userId: req.user?._id.toString() || 'system',
      userName: req.user?.name || 'Administrator',
      userRole: req.user?.role || 'admin',
      action: 'SETTINGS_UPDATED',
      entityType: 'System',
      entityId: 'SYSTEM_CONFIG',
      details: `Updated EVM thresholds (CPI < ${systemSettings.cpiCutoff}, SPI < ${systemSettings.spiCutoff}, Critical ≥ ${systemSettings.criticalCutoff})`
    });

    res.status(200).json({
      success: true,
      message: 'System configuration updated successfully.',
      data: {
        hasGeminiApiKey: Boolean(systemSettings.geminiApiKey && systemSettings.geminiApiKey.trim().length > 10),
        maskedGeminiApiKey: maskApiKey(systemSettings.geminiApiKey),
        cpiCutoff: systemSettings.cpiCutoff,
        spiCutoff: systemSettings.spiCutoff,
        criticalCutoff: systemSettings.criticalCutoff,
        emailAlerts: systemSettings.emailAlerts,
        tokenBudgetLimit: systemSettings.tokenBudgetLimit
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

