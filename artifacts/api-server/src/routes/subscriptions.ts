import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { asyncHandler } from "../middlewares/async-handler";
import {
  getRazorpay,
  getRazorpayKeyId,
  PRO_PLAN_AMOUNT,
  PRO_PLAN_CURRENCY,
  PRO_PLAN_NAME,
  PRO_PLAN_DESCRIPTION,
  verifyWebhookSignature,
} from "../lib/razorpay";
import { ApiHttpError } from "../middlewares/error-handler";
import { logger } from "../lib/logger";
import crypto from "crypto";
import { z } from "zod";

const router: IRouter = Router();

const VerifyPaymentBody = z.object({
  razorpay_order_id: z.string().min(1).max(200),
  razorpay_payment_id: z.string().min(1).max(200),
  razorpay_signature: z.string().min(1).max(500),
});

router.get(
  "/billing",
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      throw new ApiHttpError(404, "User not found");
    }

    res.json({
      planTier: user.planTier,
      subscriptionStatus: user.subscriptionStatus,
      currentPeriodEnd: user.currentPeriodEnd,
      razorpaySubscriptionId: user.razorpaySubscriptionId,
    });
  }),
);

router.post(
  "/billing/create-order",
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      throw new ApiHttpError(404, "User not found");
    }

    if (user.planTier === "pro" && user.subscriptionStatus === "active") {
      throw new ApiHttpError(400, "Already subscribed to Pro plan");
    }

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: PRO_PLAN_AMOUNT,
      currency: PRO_PLAN_CURRENCY,
      receipt: `order_${userId}_${Date.now()}`,
      notes: {
        userId,
        planTier: "pro",
      },
    });

    res.json({
      orderId: order.id,
      amount: PRO_PLAN_AMOUNT,
      currency: PRO_PLAN_CURRENCY,
      keyId: getRazorpayKeyId(),
      planName: PRO_PLAN_NAME,
      description: PRO_PLAN_DESCRIPTION,
      prefill: {
        email: user.email,
        name: user.displayName || "",
      },
    });
  }),
);

router.post(
  "/billing/verify-payment",
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    const parsed = VerifyPaymentBody.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiHttpError(400, "Missing payment verification fields: " + parsed.error.message);
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (user?.razorpaySubscriptionId === razorpay_payment_id) {
      res.json({
        success: true,
        planTier: user.planTier,
        subscriptionStatus: user.subscriptionStatus,
        currentPeriodEnd: user.currentPeriodEnd,
      });
      return;
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      logger.warn({ userId }, "Payment signature verification failed");
      throw new ApiHttpError(400, "Payment verification failed");
    }

    const razorpay = getRazorpay();
    let paymentStatus: string;
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      paymentStatus = (payment as any).status;
    } catch (err) {
      logger.error({ err, razorpay_payment_id }, "Failed to fetch payment from Razorpay");
      throw new ApiHttpError(400, "Could not verify payment with Razorpay");
    }

    if (paymentStatus !== "captured" && paymentStatus !== "authorized") {
      throw new ApiHttpError(400, `Payment not captured (status: ${paymentStatus})`);
    }

    const nextPeriodEnd = new Date();
    nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

    const [updated] = await db
      .update(usersTable)
      .set({
        planTier: "pro",
        subscriptionStatus: "active",
        razorpaySubscriptionId: razorpay_payment_id,
        currentPeriodEnd: nextPeriodEnd,
      })
      .where(eq(usersTable.id, userId))
      .returning();

    logger.info({ userId, razorpay_payment_id }, "Pro subscription activated");

    res.json({
      success: true,
      planTier: updated.planTier,
      subscriptionStatus: updated.subscriptionStatus,
      currentPeriodEnd: updated.currentPeriodEnd,
    });
  }),
);

router.post(
  "/billing/cancel",
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      throw new ApiHttpError(404, "User not found");
    }

    if (user.planTier !== "pro" || user.subscriptionStatus !== "active") {
      throw new ApiHttpError(400, "No active subscription to cancel");
    }

    const [updated] = await db
      .update(usersTable)
      .set({
        subscriptionStatus: "cancelled",
      })
      .where(eq(usersTable.id, userId))
      .returning();

    logger.info({ userId }, "Subscription cancelled");

    res.json({
      success: true,
      planTier: updated.planTier,
      subscriptionStatus: updated.subscriptionStatus,
      currentPeriodEnd: updated.currentPeriodEnd,
    });
  }),
);

export default router;
