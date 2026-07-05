import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    logger.error({ error }, "Invalid webhook signature");
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  logger.info({ type: event.type, id: event.id }, "Stripe webhook received");

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await handleCheckoutSessionCompleted(session, orderId);
        }
        break;
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionExpired(session);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        await handleChargeDisputeCreated(dispute);
        break;
      }
      default:
        logger.info({ type: event.type }, "Unhandled webhook event type");
    }
  } catch (error) {
    logger.error({ error, eventType: event.type }, "Error processing webhook");
    return NextResponse.json({ error: "Error processing webhook" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, orderId: string) {
  const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existingOrder) {
    logger.error({ orderId }, "Order not found in webhook");
    return;
  }

  const payment = await prisma.payment.create({
    data: {
      userId: existingOrder.userId,
      provider: "stripe",
      providerPaymentId: session.payment_intent?.toString(),
      amountCents: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      status: "PAID",
      metadata: { sessionId: session.id },
    },
  });

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID", paymentId: payment.id },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
    update: { paymentStatus: "PAID", enrollmentStatus: "ACTIVE" },
    create: { userId: order.userId, courseId: order.courseId, orderId: order.id, paymentStatus: "PAID", enrollmentStatus: "ACTIVE" },
  });

  logger.info({ orderId, paymentId: payment.id }, "Checkout session completed, enrollment created");
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Find order by metadata or payment intent ID
  const existingPayment = await prisma.payment.findFirst({
    where: { providerPaymentId: paymentIntent.id },
  });

  if (existingPayment) {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: { status: "PAID" },
    });
    logger.info({ paymentIntentId: paymentIntent.id }, "Payment intent succeeded");
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const existingPayment = await prisma.payment.findFirst({
    where: { providerPaymentId: paymentIntent.id },
    include: { order: true },
  });

  if (existingPayment) {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: { status: "FAILED" },
    });

    // Also update the order status
    if (existingPayment.order) {
      await prisma.order.update({
        where: { id: existingPayment.order.id },
        data: { status: "FAILED" },
      });
    }
    logger.info({ paymentIntentId: paymentIntent.id }, "Payment intent failed");
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (orderId) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "FAILED" },
    });
    logger.info({ orderId, sessionId: session.id }, "Checkout session expired");
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const payment = await prisma.payment.findFirst({
    where: { providerPaymentId: charge.payment_intent as string },
    include: { order: true },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    });

    // Cancel enrollment if payment was refunded
    if (payment.order) {
      await prisma.enrollment.updateMany({
        where: { userId: payment.order.userId, courseId: payment.order.courseId },
        data: { enrollmentStatus: "CANCELLED" },
      });
    }
    logger.info({ chargeId: charge.id }, "Charge refunded");
  }
}

async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  const payment = await prisma.payment.findFirst({
    where: { providerPaymentId: dispute.payment_intent as string },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    });
    logger.warn({ disputeId: dispute.id }, "Charge dispute created");
  }
}
