import mongoose, { Schema, Document } from 'mongoose';

export type UpdateStatus = 'Pending Review' | 'Approved' | 'Rejected';

export interface IProjectUpdate extends Document {
  projectId: string;
  updateDate: Date;
  submittedBy: string;
  submitterRole: string;
  physicalProgress: number; // cumulative progress reported
  periodExpenditure: number; // amount spent in this update period (Crores)
  workCompletedSummary: string;
  challengesFaced: string;
  nextMonthPlan: string;
  status: UpdateStatus;
  reviewedBy?: string;
  reviewRemarks?: string;
  sitePhotos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectUpdateSchema = new Schema<IProjectUpdate>(
  {
    projectId: { type: String, required: true, index: true },
    updateDate: { type: Date, required: true, default: Date.now },
    submittedBy: { type: String, required: true },
    submitterRole: { type: String, default: 'agency' },
    physicalProgress: { type: Number, required: true, min: 0, max: 100 },
    periodExpenditure: { type: Number, required: true, min: 0 },
    workCompletedSummary: { type: String, required: true },
    challengesFaced: { type: String, default: '' },
    nextMonthPlan: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending Review', 'Approved', 'Rejected'],
      default: 'Pending Review',
      index: true
    },
    reviewedBy: { type: String },
    reviewRemarks: { type: String },
    sitePhotos: [{ type: String }]
  },
  { timestamps: true }
);

export const ProjectUpdate = mongoose.model<IProjectUpdate>('ProjectUpdate', ProjectUpdateSchema);

