import mongoose, { Schema, Document } from 'mongoose';

export interface IRiskAssessment extends Document {
  projectId: string;
  projectName: string;
  calculatedAt: Date;
  overallRiskScore: number; // 0 - 100
  riskCategory: 'Low' | 'Medium' | 'High' | 'Critical';
  
  // Earned Value Metrics
  cpi: number; // Cost Performance Index
  spi: number; // Schedule Performance Index
  costVariancePercent: number; // (Revised - Approved) / Approved
  scheduleSlippagePercent: number; // (Planned - Actual)
  
  // Predictive metrics
  projectedCostOverrun: number; // in Crores
  projectedDelayMonths: number;
  predictedCompletionDate?: Date;
  
  // Explainability & recommendations
  primaryRiskDrivers: string[];
  aiAnalysis: string;
  recommendedMitigations: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

const RiskAssessmentSchema = new Schema<IRiskAssessment>(
  {
    projectId: { type: String, required: true, index: true },
    projectName: { type: String, required: true },
    calculatedAt: { type: Date, default: Date.now },
    overallRiskScore: { type: Number, required: true, min: 0, max: 100 },
    riskCategory: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
      index: true
    },
    cpi: { type: Number, required: true },
    spi: { type: Number, required: true },
    costVariancePercent: { type: Number, default: 0 },
    scheduleSlippagePercent: { type: Number, default: 0 },
    projectedCostOverrun: { type: Number, default: 0 },
    projectedDelayMonths: { type: Number, default: 0 },
    predictedCompletionDate: { type: Date },
    primaryRiskDrivers: [{ type: String }],
    aiAnalysis: { type: String, default: '' },
    recommendedMitigations: [{ type: String }]
  },
  { timestamps: true }
);

export const RiskAssessment = mongoose.model<IRiskAssessment>('RiskAssessment', RiskAssessmentSchema);

