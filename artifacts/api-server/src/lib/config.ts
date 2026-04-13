export const config = {
  port: Number(process.env.PORT) || 8080,

  adminEmails: (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean),

  auth: {
    secret: process.env.BETTER_AUTH_SECRET || "",
    baseURL: process.env.BETTER_AUTH_URL || "",
  },

  ai: {
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "",
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },

  supabase: {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },
} as const;
