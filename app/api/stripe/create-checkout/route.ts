import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/libs/next-auth";
import { createCheckout } from "@/libs/stripe";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import config from "@/config";

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// By default, it doesn't force users to be authenticated. But if they are, it will prefill the Checkout data with their email and/or credit card
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.priceId) {
    return NextResponse.json(
      { error: "Price ID is required" },
      { status: 400 }
    );
  } else if (!body.successUrl || !body.cancelUrl) {
    return NextResponse.json(
      { error: "Success and cancel URLs are required" },
      { status: 400 }
    );
  } else if (!body.mode) {
    return NextResponse.json(
      {
        error:
          "Mode is required (either 'payment' for one-time payments or 'subscription' for recurring subscription)",
      },
      { status: 400 }
    );
  }

  // Prevent open redirect: only allow redirects to our own domain
  const allowedOrigins = [
    `https://${config.domainName}`,
    ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000", "http://localhost:3001"] : []),
  ];
  const isValidUrl = (url: string) => allowedOrigins.some((origin) => url.startsWith(origin));
  if (!isValidUrl(body.successUrl) || !isValidUrl(body.cancelUrl)) {
    return NextResponse.json(
      { error: "Invalid redirect URL" },
      { status: 400 }
    );
  }

  try {
    const session = await auth();

    await connectMongo();

    const { priceId, mode, successUrl, cancelUrl } = body;

    // Validate priceId against known plans — prevents using test/internal prices
    const validPlan = config.stripe.plans.find((p) => p.priceId === priceId);
    if (!validPlan) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    // Use server-side trial period config — NEVER trust client-provided trialPeriodDays
    const trialPeriodDays = validPlan.trialPeriodDays;

    let user = null;
    if (session?.user?.id) {
      const { id } = session.user;
      user = await User.findById(String(id));
    }

    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      trialPeriodDays,
      // If user is logged in, it will pass the user ID to the Stripe Session so it can be retrieved in the webhook later
      clientReferenceId: user?._id?.toString(),
      // If user is logged in, this will automatically prefill Checkout data like email and/or credit card for faster checkout
      user: user ? {
        customerId: user?.stripeCustomerId,
        email: user?.email,
      } : undefined,
      // If you send coupons from the frontend, you can pass it here
      // couponId: body.couponId,
    });

    return NextResponse.json({ url: stripeSessionURL });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
