
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const key = process.env.STRIPE_SECRET_KEY;
const priceIdToCheck = "price_1Sta10Q2ocSqu8xkeY9vR9mE";

if (!key) {
    console.error("❌ STRIPE_SECRET_KEY is missing from .env");
    process.exit(1);
}

const stripe = new Stripe(key, {
    apiVersion: "2023-08-16",
});

async function main() {
    console.log(`🔑 Using Stripe Key: ${key.substring(0, 8)}...`);

    try {
        console.log(`🔍 Checking specific price: ${priceIdToCheck}...`);
        try {
            const price = await stripe.prices.retrieve(priceIdToCheck);
            console.log(`✅ Price FOUND: ${price.id} (${price.unit_amount / 100} ${price.currency})`);
            console.log("   Active:", price.active);
            console.log("   Livemode:", price.livemode);
        } catch (e: any) {
            console.error(`❌ Price NOT FOUND: ${e.message}`);
        }

        console.log("\n📋 Listing last 5 active prices for this key:");
        const prices = await stripe.prices.list({ limit: 5, active: true });

        if (prices.data.length === 0) {
            console.log("   (No active prices found)");
        }

        prices.data.forEach((p) => {
            console.log(`   - ID: ${p.id} | Product: ${p.product} | Amount: ${p.unit_amount ? p.unit_amount / 100 : 0} ${p.currency} | Livemode: ${p.livemode}`);
        });

    } catch (error) {
        console.error("Error listing prices:", error);
    }
}

main();
