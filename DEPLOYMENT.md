# Casri Academy Deployment Guide

This project is a Next.js, Prisma, PostgreSQL, Firebase Auth, and optional Stripe/Cloudinary application.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill required values:

```bash
cp .env.example .env
```

3. Generate Prisma Client:

```bash
npm run prisma:generate
```

4. Apply database migrations:

```bash
npm run prisma:migrate:deploy
```

5. Seed the first admin:

```bash
npm run seed:admin
```

6. Start local dev:

```bash
npm run dev
```

## Required Environment Variables

Base required values:

- `DATABASE_URL`
- `AUTH_SECRET` with at least 32 characters
- `APP_URL`
- `PAYMENT_PROVIDER`, usually `manual` locally
- `MEDIA_PROVIDER`, usually `none` until Cloudinary is configured

Firebase Auth values required for Google Sign-In and Phone OTP:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Optional rate-limit stores:

- `REDIS_URL`
- or `UPSTASH_REDIS_REST_URL` plus `UPSTASH_REDIS_REST_TOKEN`

If neither Redis nor Upstash is configured, rate limiting uses the database-backed `RateLimitBucket` table.

## Firebase Setup

The local project is linked to Firebase project `casri-academy-app` in `.firebaserc`.

In Firebase Console:

1. Go to Authentication.
2. Enable Google provider.
3. Enable Phone provider.
4. Add authorized domains:
   - `localhost`
   - your Vercel domain
   - your custom production domain
5. Keep the Admin SDK service account values only in `.env` or Vercel environment variables.

Phone OTP is handled by Firebase Phone Auth and invisible reCAPTCHA in the browser. The app does not use local/dev fake OTP codes.

## Vercel Deployment

1. Push the project to GitHub.
2. Import the project in Vercel.
3. Add all required environment variables in Vercel Project Settings.
4. Set `APP_URL` to the final deployed URL, for example:

```bash
APP_URL="https://casri-academy.vercel.app"
```

5. Deploy.
6. Run migrations against the production database:

```bash
npm run prisma:migrate:deploy
```

7. Seed an admin only once:

```bash
npm run seed:admin
```

8. Add the Vercel domain to Firebase Authentication authorized domains.

## Payment Modes

Manual mode:

```bash
PAYMENT_PROVIDER="manual"
```

Manual mode does not require Stripe keys and activates checkout through the app's manual payment flow.

Stripe mode:

```bash
PAYMENT_PROVIDER="stripe"
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."
```

Configure the Stripe webhook URL:

```text
https://your-domain.com/api/webhooks/stripe
```

## Media Modes

No upload provider:

```bash
MEDIA_PROVIDER="none"
```

Cloudinary:

```bash
MEDIA_PROVIDER="cloudinary"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

If Cloudinary is not configured, admin media signing fails safely instead of returning fake upload success.

## Health Check

Use:

```text
/api/health
```

It checks database connectivity, environment validation, and provider status without exposing secrets.

## Production Checklist

- Run `npm run lint`
- Run `npm run typecheck`
- Run `npm run build`
- Run `npm run prisma:migrate:deploy`
- Confirm `/api/health` is healthy
- Confirm admin login works
- Confirm learner Google Sign-In works
- Confirm phone OTP completes through Firebase
- Confirm `/dashboard` redirects unauthenticated users to `/login`
- Confirm `/admin` rejects learners
- Confirm Firebase authorized domains include production URLs
