// Script to sync existing Subscription data to User documents
// Run with: npx tsx scripts/sync-subscriptions.ts

import "dotenv/config";
import connectMongo from "../libs/mongoose";
import User from "../models/User";
import Subscription from "../models/Subscription";

async function syncSubscriptionsToUsers() {
    await connectMongo();

    console.log("Starting subscription sync...");

    // Find all active subscriptions
    const subscriptions = await Subscription.find({});

    console.log(`Found ${subscriptions.length} subscriptions to sync`);

    for (const sub of subscriptions) {
        const result = await User.findByIdAndUpdate(
            sub.userId,
            {
                subscriptionTier: sub.tier,
                subscriptionStatus: sub.status,
                stripeSubscriptionId: sub.stripeSubscriptionId,
                stripePriceId: sub.stripePriceId,
            },
            { new: true }
        );

        if (result) {
            console.log(`✓ Synced: ${result.email} -> tier: ${sub.tier}, status: ${sub.status}`);
        } else {
            console.log(`✗ User not found for subscription: ${sub._id}`);
        }
    }

    console.log("Sync complete!");
    process.exit(0);
}

syncSubscriptionsToUsers().catch((err) => {
    console.error("Sync failed:", err);
    process.exit(1);
});
