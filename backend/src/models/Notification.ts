import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'alert' | 'warning' | 'info' | 'success';

export interface INotification extends Document {
  recipientRole?: string; // 'admin', 'officer', 'manager', 'agency' or 'all'
  recipientUserId?: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedProjectId?: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientRole: { type: String, default: 'all', index: true },
    recipientUserId: { type: String, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['alert', 'warning', 'info', 'success'],
      default: 'info'
    },
    relatedProjectId: { type: String },
    isRead: { type: Boolean, default: false },
    link: { type: String }
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

