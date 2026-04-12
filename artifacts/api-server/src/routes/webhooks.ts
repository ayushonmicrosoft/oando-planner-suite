import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { verifyWebhookSignature } from "../lib/razorpay";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/webhooks/razorpay", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    const body = (req as any).rawBody || JSON.stringify(req.body);

    if (!signature) {
      logger.warn("Razorpay webhook: missing signature header");
      res.status(400).json({ error: "Missing signature" });
      return;
    }

    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      logger.warn("Razorpay webhook: invalid signature");
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    const event = req.body.event as string;
    const payload = req.body.payload;

    logger.info({ event }, "Razorpay webhook received");

    switch (event) {
      case "payment.captured": {
        const paymentEntity = payload?.payment?.entity;
        if (paymentEntity?.notes?.userId) {
          const userId = paymentEntity.notes.userId;
          const nextPeriodEnd = new Date();
          nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

          await db
            .update(usersTable)
            .set({
              planTier: "pro",
              subscriptionStatus: "active",
              razorpaySubscriptionId: paymentEntity.id,
              currentPeriodEnd: nextPeriodEnd,
            })
            .where(eq(usersTable.id, userId));

          logger.info({ userId, paymentId: paymentEntity.id }, "Payment captured, subscription activated via webhook");
        }
        break;
      }

      case "payment.failed": {
        const paymentEntity = payload?.payment?.entity;
        if (paymentEntity?.notes?.userId) {
          const userId = paymentEntity.notes.userId;
          await db
            .update(usersTable)
            .set({ subscriptionStatus: "past_due" })
            .where(eq(usersTable.id, userId));

          logger.info({ userId }, "Payment failed, marked as past_due");
        }
        break;
      }

      case "subscription.activated": {
        const subEntity = payload?.subscription?.entity;
        if (subEntity?.notes?.userId) {
          const userId = subEntity.notes.userId;
          const currentEnd = subEntity.current_end
            ? new Date(subEntity.current_end * 1000)
            : null;

          await db
            .update(usersTable)
            .set({
              planTier: "pro",
              subscriptionStatus: "active",
              razorpaySubscriptionId: subEntity.id,
              currentPeriodEnd: currentEnd,
            })
            .where(eq(usersTable.id, userId));

          logger.info({ userId }, "Subscription activated via webhook");
        }
        break;
      }

      case "subscription.cancelled": {
        const subEntity = payload?.subscription?.entity;
        if (subEntity?.notes?.userId) {
          const userId = subEntity.notes.userId;
          await db
            .update(usersTable)
            .set({ subscriptionStatus: "cancelled" })
            .where(eq(usersTable.id, userId));

          logger.info({ userId }, "Subscription cancelled via webhook");
        }
        break;
      }

      case "subscription.expired": {
        const subEntity = payload?.subscription?.entity;
        if (subEntity?.notes?.userId) {
          const userId = subEntity.notes.userId;
          await db
            .update(usersTable)
            .set({
              planTier: "free",
              subscriptionStatus: "expired",
              razorpaySubscriptionId: null,
              currentPeriodEnd: null,
            })
            .where(eq(usersTable.id, userId));

          logger.info({ userId }, "Subscription expired, reverted to free");
        }
        break;
      }

      default:
        logger.info({ event }, "Unhandled Razorpay webhook event");
    }

    res.json({ status: "ok" });
  } catch (err) {
    logger.error({ err }, "Razorpay webhook processing error");
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
