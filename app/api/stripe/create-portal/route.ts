import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import { createCustomerPortal } from "@/libs/stripe";
import User from "@/models/User";
import config from "@/config";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (session) {
    try {
      await connectMongo();

      const body = await req.json();

      const { id } = session.user;

      const user = id ? await User.findById(String(id)) : null;

      if (!user?.stripeCustomerId) {
        return NextResponse.json(
          {
            error:
              "You don't have a billing account yet. Make a purchase first.",
          },
          { status: 400 }
        );
      } else if (!body.returnUrl) {
        return NextResponse.json(
          { error: "Return URL is required" },
          { status: 400 }
        );
      }

      // Prevent open redirect
      const allowedOrigins = [
        `https://${config.domainName}`,
        ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000", "http://localhost:3001"] : []),
      ];
      if (!allowedOrigins.some((origin) => body.returnUrl.startsWith(origin))) {
        return NextResponse.json({ error: "Invalid return URL" }, { status: 400 });
      }

      const stripePortalUrl = await createCustomerPortal({
        customerId: user.stripeCustomerId,
        returnUrl: body.returnUrl,
      });

      return NextResponse.json({
        url: stripePortalUrl,
      });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: e?.message }, { status: 500 });
    }
  } else {
    // Not Signed in
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
}
