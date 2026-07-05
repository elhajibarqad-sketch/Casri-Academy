import Stripe from "stripe";

type CheckoutInput = {
  orderId: string;
  courseId: string;
  courseTitle: string;
  amountCents: number;
  currency: string;
  userEmail: string;
};

export async function createCheckoutSession(input: CheckoutInput) {
  if (process.env.PAYMENT_PROVIDER !== "stripe" || !process.env.STRIPE_SECRET_KEY) {
    return {
      provider: "manual",
      checkoutUrl: `${process.env.APP_URL}/dashboard/orders/confirmation?order=${input.orderId}`,
    };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is required when PAYMENT_PROVIDER=stripe.");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
    success_url: `${process.env.APP_URL}/dashboard/orders/confirmation?order=${input.orderId}`,
    cancel_url: `${process.env.APP_URL}/dashboard/checkout/${input.courseId}`,
  });

  return { provider: "stripe", checkoutUrl: session.url };
}
