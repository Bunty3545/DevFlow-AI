import mongoose, { Schema, Document } from 'mongoose';

export type MilestoneStatus = 'Pending' | 'In Progress' | 'Completed' | 'Delayed';

export interface IMilestone extends Document {
  projectId: string; // foreign key to Project.projectId
  title: string;
  description: string;
  sequence: number;
  weightage: number; // percentage of project total, sum = 100
  plannedStartDate: Date;
  plannedCompletionDate: Date;
  revisedCompletionDate?: Date;
  actualCompletionDate?: Date;
  progressPercentage: number;
  status: MilestoneStatus;
  remarks?: string;
  isCriticalPath: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    projectId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    sequence: { type: Number, required: true },
    weightage: { type: Number, default: 10, min: 1, max: 100 },
    plannedStartDate: { type: Date, required: true },
    plannedCompletionDate: { type: Date, required: true },
    revisedCompletionDate: { type: Date },
    actualCompletionDate: { type: Date },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Delayed'],
      default: 'Pending',
      index: true
    },
    remarks: { type: String, default: '' },
    isCriticalPath: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Milestone = mongoose.model<IMilestone>('Milestone', MilestoneSchema);

