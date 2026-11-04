import mongoose, { Schema, Document } from 'mongoose';

export type IssueCategory =
  | 'Land Acquisition'
  | 'Forest & Environment Clearance'
  | 'Contractor Delay'
  | 'Fund Disbursement'
  | 'Technical & Engineering'
  | 'Utility Shifting'
  | 'Law & Order / Local Protest'
  | 'Weather & Monsoons'
  | 'Other';

export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface IIssueActivity {
  comment: string;
  author: string;
  authorRole: string;
  date: Date;
}

export interface IIssue extends Document {
  issueId: string; // e.g. "ISSUE-2026-001"
  projectId: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  raisedBy: string;
  assignedTo: string;
  dueDate: Date;
  resolvedDate?: Date;
  resolutionNotes?: string;
  activityHistory: IIssueActivity[];
  escalatedToMinistry: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IIssue>(
  {
    issueId: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Land Acquisition',
        'Forest & Environment Clearance',
        'Contractor Delay',
        'Fund Disbursement',
        'Technical & Engineering',
        'Utility Shifting',
        'Law & Order / Local Protest',
        'Weather & Monsoons',
        'Other'
      ],
      index: true
    },
    severity: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
      index: true
    },
    raisedBy: { type: String, required: true },
    assignedTo: { type: String, required: true },
    dueDate: { type: Date, required: true },
    resolvedDate: { type: Date },
    resolutionNotes: { type: String, default: '' },
    escalatedToMinistry: { type: Boolean, default: false },
    activityHistory: [
      {
        comment: { type: String, required: true },
        author: { type: String, required: true },
        authorRole: { type: String, default: 'Officer' },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Issue = mongoose.model<IIssue>('Issue', IssueSchema);

