import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import Stripe from "stripe";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: any) {
    console.log("Error parsing webhook event:", error.message);
    return new Response("Webhook Error: " + error.message, {
      status: 400,
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }
  } catch (error: any) {
    console.error(`Error processing webhook (${event.type}):`, error);
    return new Response("Error processing webhook", { status: 400 });
  }

  return new Response("Webhook received", { status: 200 });
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const courseId = session.metadata?.courseId;
  const userId = session.metadata?.userId;
  const stripeCustomerId = session.customer;

  if (!courseId || !userId || !stripeCustomerId) {
    throw new Error("Missing required metadata in session");
  }

  const user = await convex.query(api.users.getUserByStripeCustomerId, {
    stripeCustomerId: stripeCustomerId as string,
  });

  if (!user) {
    throw new Error("User not found for the provided Stripe customer ID");
  }

  await convex.mutation(api.purchases.recordPurchase, {
    userId: user._id,
    courseId: courseId as Id<"courese">,
    amount: session.amount_total as number, // Convert cents to dollars
    stripePurchaseId: session.id,
  });

  // TODO: success Email to user
}
