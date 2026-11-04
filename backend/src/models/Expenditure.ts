import mongoose, { Schema, Document } from 'mongoose';

export interface IExpenditure extends Document {
  projectId: string;
  financialYear: string; // e.g. "2024-2025"
  quarter: string; // "Q1", "Q2", "Q3", "Q4"
  month: string; // "January", etc.
  date: Date;
  component: string; // Civil Works, Land Acquisition, Equipment, Consulting, Contingency
  plannedAmount: number; // in Crores
  actualAmount: number; // in Crores
  variance: number; // actual - planned
  invoiceNumber?: string;
  vendorName?: string;
  recordedBy: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenditureSchema = new Schema<IExpenditure>(
  {
    projectId: { type: String, required: true, index: true },
    financialYear: { type: String, required: true, index: true },
    quarter: { type: String, required: true },
    month: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    component: { type: String, required: true },
    plannedAmount: { type: Number, required: true, min: 0 },
    actualAmount: { type: Number, required: true, min: 0 },
    variance: { type: Number, default: 0 },
    invoiceNumber: { type: String, default: '' },
    vendorName: { type: String, default: '' },
    recordedBy: { type: String, required: true },
    remarks: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Expenditure = mongoose.model<IExpenditure>('Expenditure', ExpenditureSchema);

