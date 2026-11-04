import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'officer' | 'manager' | 'agency';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  organization: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  assignedProjects: string[]; // projectIds
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['admin', 'officer', 'manager', 'agency'],
      default: 'officer',
      required: true
    },
    department: { type: String, required: true, default: 'MoSPI Monitoring Cell' },
    organization: { type: String, required: true, default: 'Government of India' },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    assignedProjects: [{ type: String }]
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);

