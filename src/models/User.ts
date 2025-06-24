import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { UserRole } from "../types/roles";

export interface IUser extends Document {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  organization: string;
  profileImageUrl?: string;
  address?: string;
  member: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: function (this: IUser) {
        return this.role !== UserRole.REGULAR;
      },
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.role !== UserRole.REGULAR;
      },
      minlength: 6,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CLERK,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    profileImageUrl: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    member: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Validate role transitions
userSchema.pre("save", function (next) {
  if (this.isModified("role")) {
    const oldRole = this.get("role");
    // Remove instructor-specific validation
  }
  next();
});

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
