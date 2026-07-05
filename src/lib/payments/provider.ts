import Stripe from "stripe";
import { env } from "@/lib/env";

type CheckoutInput = {
  orderId: string;
  courseId: string;
  courseTitle: string;
  amountCents: number;
  currency: string;
  userEmail: string;
};

export async function createCheckoutSession(input: CheckoutInput) {
  if (env.PAYMENT_PROVIDER !== "stripe") {
    return {
      provider: "manual",
      checkoutUrl: `${env.APP_URL}/dashboard/orders/confirmation?order=${input.orderId}`,
    };
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.userEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: input.amountCents,
          product_data: {
            name: input.courseTitle,
            metadata: { courseId: input.courseId },
          },
        },
      },
    ],
    metadata: { orderId: input.orderId, courseId: input.courseId },
    success_url: `${env.APP_URL}/dashboard/orders/confirmation?order=${input.orderId}`,
    cancel_url: `${env.APP_URL}/dashboard/checkout/${input.courseId}`,
  });

  return { provider: "stripe", checkoutUrl: session.url };
}
