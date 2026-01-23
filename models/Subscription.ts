import mongoose, { Schema } from "mongoose";

// ISubscription Interface
export interface ISubscription extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: "active" | "canceled" | "past_due" | "trialing";
    billingCycle: "monthly" | "yearly";
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    tier: "pro";
    createdAt: Date;
    updatedAt: Date;
}

const subscriptionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        stripeSubscriptionId: {
            type: String,
            required: true,
            unique: true,
        },
        stripePriceId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "canceled", "past_due", "trialing"],
            required: true,
        },
        billingCycle: {
            type: String,
            enum: ["monthly", "yearly"],
            required: true,
        },
        currentPeriodStart: {
            type: Date,
            required: true,
        },
        currentPeriodEnd: {
            type: Date,
            required: true,
        },
        cancelAtPeriodEnd: {
            type: Boolean,
            default: false,
        },
        tier: {
            type: String,
            enum: ["pro"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Subscription = (mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", subscriptionSchema)) as mongoose.Model<ISubscription>;

export default Subscription;
