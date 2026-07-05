/**
 * Centralized environment variable validation
 * This file validates all required environment variables at startup
 */

interface EnvConfig {
  // Required
  DATABASE_URL: string;
  AUTH_SECRET: string;
  APP_URL: string;
  
  // Optional but recommended
  REDIS_URL?: string;
  UPSTASH_REDIS_REST_URL?: string;
  
  // Payment (if using Stripe)
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  
  // Firebase (if using Firebase auth)
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;
  NEXT_PUBLIC_FIREBASE_API_KEY?: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID?: string;
  NEXT_PUBLIC_FIREBASE_APP_ID?: string;
  
  // Cloudinary (if using for media)
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  
  // Admin
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
}

function validateEnv(): EnvConfig {
  const errors: string[] = [];
  
  // Required variables
  if (!process.env.DATABASE_URL) {
    errors.push("DATABASE_URL is required");
  }
  
  if (!process.env.AUTH_SECRET) {
    errors.push("AUTH_SECRET is required (must be at least 32 characters)");
  } else if (process.env.AUTH_SECRET.length < 32) {
    errors.push("AUTH_SECRET must be at least 32 characters");
  }
  
  if (!process.env.APP_URL) {
    errors.push("APP_URL is required");
  }
  
  // Payment provider validation
  if (process.env.PAYMENT_PROVIDER === "stripe") {
    if (!process.env.STRIPE_SECRET_KEY) {
      errors.push("STRIPE_SECRET_KEY is required when PAYMENT_PROVIDER=stripe");
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      errors.push("STRIPE_WEBHOOK_SECRET is required when PAYMENT_PROVIDER=stripe");
    }
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      errors.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required when PAYMENT_PROVIDER=stripe");
    }
  }
  
  // Firebase validation (if configured)
  if (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    const requiredFirebaseVars = [
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL", 
      "FIREBASE_PRIVATE_KEY",
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID"
    ];
    
    const missingFirebaseVars = requiredFirebaseVars.filter(
      (varName) => !process.env[varName]
    );
    
    if (missingFirebaseVars.length > 0) {
      errors.push(`Firebase is partially configured. Missing: ${missingFirebaseVars.join(", ")}`);
    }
  }
  
  // Cloudinary validation (if configured)
  if (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_API_KEY) {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      errors.push("CLOUDINARY_CLOUD_NAME is required when using Cloudinary");
    }
    if (!process.env.CLOUDINARY_API_KEY) {
      errors.push("CLOUDINARY_API_KEY is required when using Cloudinary");
    }
    if (!process.env.CLOUDINARY_API_SECRET) {
      errors.push("CLOUDINARY_API_SECRET is required when using Cloudinary");
    }
  }
  
  if (errors.length > 0) {
    console.error("❌ Environment validation failed:");
    errors.forEach((error) => console.error(`  - ${error}`));
    console.error("\nPlease check your .env file and ensure all required variables are set.");
    process.exit(1);
  }
  
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    AUTH_SECRET: process.env.AUTH_SECRET!,
    APP_URL: process.env.APP_URL!,
    REDIS_URL: process.env.REDIS_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  };
}

// Validate environment on module load
export const env = validateEnv();

// Re-export for convenience
export default env;
