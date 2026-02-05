import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// IUser Interface
export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  image?: string;
  googleId: string;
  role: "user" | "admin" | "superadmin";
  subscriptionTier?: "pro";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  subscriptionStatus?: "active" | "canceled" | "past_due" | "trialing" | "unpaid" | "incomplete" | "incomplete_expired" | "paused";
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: Date;
  formLimit: number;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  canCreateForm(): boolean;
  getActiveFormsCount(): Promise<number>;
}

// USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
      unique: true,
    },
    image: {
      type: String,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    subscriptionTier: {
      type: String,
      enum: ["pro"],
      // No default - users must subscribe to get a tier
    },
    stripeCustomerId: {
      type: String,
      validate(value: string) {
        return value.includes("cus_");
      },
    },
    stripeSubscriptionId: {
      type: String,
    },
    stripePriceId: {
      type: String,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "canceled", "past_due", "trialing", "unpaid", "incomplete", "incomplete_expired", "paused"],
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    currentPeriodEnd: {
      type: Date,
    },
    formLimit: {
      type: Number,
      default: 3, // Default for free tier
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

// Methods
userSchema.methods.canCreateForm = function (): boolean {
  // Logic to be implemented or simply return true if unlimited for pro
  if (this.subscriptionTier === 'pro') return true;
  // Need to check active forms count, but that requires async db call which is tricky in sync method context usually
  // For now, simple check or rely on service layer
  return true;
};

userSchema.methods.getActiveFormsCount = async function (): Promise<number> {
  // This would likely require circular dependency if importing Form model here.
  // Better to handle in Service layer, but defining method signature as per UML.
  const Form = mongoose.models.Form;
  if (!Form) return 0;
  return await Form.countDocuments({ userId: this._id, status: { $ne: 'closed' } });
};

export default (mongoose.models.User || mongoose.model<IUser>("User", userSchema)) as mongoose.Model<IUser>;
