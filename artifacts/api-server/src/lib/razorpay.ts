import Razorpay from "razorpay";
import crypto from "crypto";
import { logger } from "./logger";
import { config } from "./config";

const keyId = config.razorpay.keyId;
const keySecret = config.razorpay.keySecret;

let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    if (!keyId || !keySecret) {
      throw new Error("Razorpay API keys not configured");
    }
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
}

export function getRazorpayKeyId(): string {
  return keyId;
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
): boolean {
  const webhookSecret = config.razorpay.webhookSecret;
  if (!webhookSecret) {
    logger.warn("RAZORPAY_WEBHOOK_SECRET not set, skipping verification");
    return false;
  }
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

export const PRO_PLAN_AMOUNT = 99900;
export const PRO_PLAN_CURRENCY = "INR";
export const PRO_PLAN_NAME = "Pro Plan";
export const PRO_PLAN_DESCRIPTION = "Office Planner Suite Pro - Monthly";
