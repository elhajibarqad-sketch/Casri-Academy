type PaymentProvider = "manual" | "stripe";
type MediaProvider = "none" | "cloudinary";

export interface EnvConfig {
  DATABASE_URL: string;
  AUTH_SECRET: string;
  APP_URL: string;
  PAYMENT_PROVIDER: PaymentProvider;
  MEDIA_PROVIDER: MediaProvider;
  REDIS_URL?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;
  NEXT_PUBLIC_FIREBASE_API_KEY?: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID?: string;
  NEXT_PUBLIC_FIREBASE_APP_ID?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
}

function optional(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function required(name: string, errors: string[]) {
  const value = optional(name);
  if (!value) errors.push(`${name} is required`);
  return value ?? "";
}

function parsePaymentProvider(errors: string[]): PaymentProvider {
  const provider = optional("PAYMENT_PROVIDER") ?? "manual";
  if (provider !== "manual" && provider !== "stripe") {
    errors.push("PAYMENT_PROVIDER must be manual or stripe");
    return "manual";
  }
  return provider;
}

function parseMediaProvider(errors: string[]): MediaProvider {
  const provider = optional("MEDIA_PROVIDER") ?? "none";
  if (provider !== "none" && provider !== "cloudinary") {
    errors.push("MEDIA_PROVIDER must be none or cloudinary");
    return "none";
  }
  return provider;
}

export function validateEnv(): EnvConfig {
  const errors: string[] = [];
  const paymentProvider = parsePaymentProvider(errors);
  const mediaProvider = parseMediaProvider(errors);
  const authSecret = required("AUTH_SECRET", errors);

  if (authSecret && authSecret.length < 32) {
    errors.push("AUTH_SECRET must be at least 32 characters");
  }

  const databaseUrl = required("DATABASE_URL", errors);
  const appUrl = required("APP_URL", errors);
  if (appUrl) {
    try {
      new URL(appUrl);
    } catch {
      errors.push("APP_URL must be a valid absolute URL");
    }
  }

  if (paymentProvider === "stripe") {
    for (const name of ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]) {
      required(name, errors);
    }
  }

  const firebaseVars = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ];
  const firebasePresent = firebaseVars.some((name) => optional(name));
  if (firebasePresent) {
    for (const name of firebaseVars) required(name, errors);
  }

  if (mediaProvider === "cloudinary") {
    for (const name of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]) {
      required(name, errors);
    }
  }

  if (optional("UPSTASH_REDIS_REST_URL") && !optional("UPSTASH_REDIS_REST_TOKEN")) {
    errors.push("UPSTASH_REDIS_REST_TOKEN is required when UPSTASH_REDIS_REST_URL is set");
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n- ${errors.join("\n- ")}`);
  }

  return {
    DATABASE_URL: databaseUrl,
    AUTH_SECRET: authSecret,
    APP_URL: appUrl,
    PAYMENT_PROVIDER: paymentProvider,
    MEDIA_PROVIDER: mediaProvider,
    REDIS_URL: optional("REDIS_URL"),
    UPSTASH_REDIS_REST_URL: optional("UPSTASH_REDIS_REST_URL"),
    UPSTASH_REDIS_REST_TOKEN: optional("UPSTASH_REDIS_REST_TOKEN"),
    STRIPE_SECRET_KEY: optional("STRIPE_SECRET_KEY"),
    STRIPE_WEBHOOK_SECRET: optional("STRIPE_WEBHOOK_SECRET"),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optional("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
    FIREBASE_PROJECT_ID: optional("FIREBASE_PROJECT_ID"),
    FIREBASE_CLIENT_EMAIL: optional("FIREBASE_CLIENT_EMAIL"),
    FIREBASE_PRIVATE_KEY: optional("FIREBASE_PRIVATE_KEY"),
    NEXT_PUBLIC_FIREBASE_API_KEY: optional("NEXT_PUBLIC_FIREBASE_API_KEY"),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: optional("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: optional("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    NEXT_PUBLIC_FIREBASE_APP_ID: optional("NEXT_PUBLIC_FIREBASE_APP_ID"),
    CLOUDINARY_CLOUD_NAME: optional("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: optional("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: optional("CLOUDINARY_API_SECRET"),
    ADMIN_EMAIL: optional("ADMIN_EMAIL"),
    ADMIN_PASSWORD: optional("ADMIN_PASSWORD"),
  };
}

export function getProviderStatus() {
  return {
    paymentProvider: optional("PAYMENT_PROVIDER") ?? "manual",
    mediaProvider: optional("MEDIA_PROVIDER") ?? "none",
    firebaseConfigured: Boolean(
      optional("FIREBASE_PROJECT_ID") &&
        optional("FIREBASE_CLIENT_EMAIL") &&
        optional("FIREBASE_PRIVATE_KEY") &&
        optional("NEXT_PUBLIC_FIREBASE_API_KEY") &&
        optional("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN") &&
        optional("NEXT_PUBLIC_FIREBASE_PROJECT_ID") &&
        optional("NEXT_PUBLIC_FIREBASE_APP_ID"),
    ),
    rateLimitStore: optional("REDIS_URL") ? "redis" : optional("UPSTASH_REDIS_REST_URL") ? "upstash" : "database",
    stripeConfigured: Boolean(optional("STRIPE_SECRET_KEY") && optional("STRIPE_WEBHOOK_SECRET")),
    cloudinaryConfigured: Boolean(optional("CLOUDINARY_CLOUD_NAME") && optional("CLOUDINARY_API_KEY") && optional("CLOUDINARY_API_SECRET")),
  };
}

export const env = validateEnv();

export default env;
