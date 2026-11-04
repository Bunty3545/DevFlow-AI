import mongoose, { Schema, Document } from 'mongoose';

export type ProjectStatus = 'Not Started' | 'In Progress' | 'Delayed' | 'Critical' | 'Completed';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface IProject extends Document {
  projectId: string; // e.g. "PRJ-NHAI-001"
  name: string;
  description: string;
  sector: string;
  ministry: string;
  state: string;
  district: string;
  implementingAgency: string;
  projectManager: string;
  managerEmail?: string;
  approvedCost: number; // in Crores
  revisedCost: number; // in Crores
  actualExpenditure: number; // in Crores
  startDate: Date;
  targetCompletionDate: Date;
  actualCompletionDate?: Date;
  plannedProgress: number; // 0 - 100
  actualProgress: number; // 0 - 100
  status: ProjectStatus;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  latitude: number;
  longitude: number;
  imageUrl?: string;
  keyHighlights: string[];
  cpi: number; // Cost Performance Index (EV / AC)
  spi: number; // Schedule Performance Index (EV / PV)
  projectedCostOverrun: number; // Estimated overrun in Crores
  projectedDelayMonths: number; // Estimated delay in months
  predictedCompletionDate?: Date;
  aiRiskSummary?: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    projectId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    sector: { type: String, required: true, index: true },
    ministry: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    district: { type: String, required: true },
    implementingAgency: { type: String, required: true },
    projectManager: { type: String, required: true },
    managerEmail: { type: String, default: '' },
    approvedCost: { type: Number, required: true, min: 0 },
    revisedCost: { type: Number, required: true, min: 0 },
    actualExpenditure: { type: Number, required: true, min: 0, default: 0 },
    startDate: { type: Date, required: true },
    targetCompletionDate: { type: Date, required: true },
    actualCompletionDate: { type: Date },
    plannedProgress: { type: Number, required: true, min: 0, max: 100, default: 0 },
    actualProgress: { type: Number, required: true, min: 0, max: 100, default: 0 },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Delayed', 'Critical', 'Completed'],
      default: 'In Progress',
      index: true
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
      index: true
    },
    riskScore: { type: Number, default: 15, min: 0, max: 100 },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    imageUrl: { type: String, default: '' },
    keyHighlights: [{ type: String }],
    cpi: { type: Number, default: 1.0 },
    spi: { type: Number, default: 1.0 },
    projectedCostOverrun: { type: Number, default: 0 },
    projectedDelayMonths: { type: Number, default: 0 },
    predictedCompletionDate: { type: Date },
    aiRiskSummary: { type: String, default: '' },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);

