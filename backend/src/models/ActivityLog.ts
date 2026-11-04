import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId: string;
  userName: string;
  userRole: string;
  action: string; // e.g. "PROJECT_CREATED", "STATUS_UPDATED", "MILESTONE_COMPLETED"
  entityType: 'Project' | 'Milestone' | 'Issue' | 'Expenditure' | 'Update' | 'User';
  entityId: string;
  details: string;
  ipAddress?: string;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    details: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

