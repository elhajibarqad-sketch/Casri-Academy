# Casri Academy

Production-oriented Next.js platform for Forex and Crypto education with authentication, PostgreSQL/Prisma, protected course access, Stripe-ready checkout, dashboard, admin APIs, live market data, SEO-ready pages, and responsive Apple-style UI.

## Stack

- Next.js `16.2.10` App Router
- React `19.2.4`, TypeScript, Tailwind CSS 4
- Prisma ORM with PostgreSQL
- JWT session cookie auth with `jose`
- `bcryptjs` password hashing
- Stripe checkout abstraction and verified webhook route
- CoinGecko + Frankfurter public APIs for live market context
- Framer Motion, Recharts, Lucide icons, next-themes

## Setup

1. Copy env values:

```bash
cp .env.example .env
```

2. Set required environment variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/casri_academy?schema=public"
AUTH_SECRET="generate-a-long-random-secret-at-least-32-chars"
APP_URL="http://localhost:3000"
PAYMENT_PROVIDER="stripe"
STRIPE_SECRET_KEY="sk_live_or_test_key"
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_or_test_key"
```

3. Install and generate Prisma:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed:admin
```

4. Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Project Structure

- `src/app` - pages and API routes
- `src/app/api/auth` - signup, login, logout
- `src/app/api/admin` - admin-only course/user/order APIs
- `src/app/api/checkout` - order creation and payment session
- `src/app/api/webhooks/stripe` - verified Stripe webhook
- `src/lib/auth` - password hashing, JWT sessions, guards
- `src/lib/market` - live crypto/forex clients
- `src/lib/payments` - payment provider abstraction
- `prisma/schema.prisma` - production PostgreSQL schema

## Database Models

Implemented models: `User`, `Profile`, `Course`, `Lesson`, `CoursePreview`, `Enrollment`, `Payment`, `Order`, `Progress`, `Certificate`, `AdminLog`, `MarketDataCache`, `BlogPost`, `ContactMessage`.

## Security Checklist

- Passwords hashed with bcrypt
- HTTP-only secure session cookie
- JWT signed with `AUTH_SECRET`
- Protected dashboard/admin routes in middleware
- Admin-only API guards
- Input validation with Zod
- Rate limiting on auth/contact routes
- Stripe webhook signature validation
- Paid lesson access checks in course/progress APIs
- API keys read only from environment variables

## Payment Flow

1. Authenticated user submits checkout for a course.
2. `/api/checkout` creates an `Order`.
3. Stripe Checkout session is created through `src/lib/payments/provider.ts`.
4. Stripe redirects user to confirmation.
5. `/api/webhooks/stripe` verifies the webhook, marks order/payment as paid, and creates enrollment.

## Media Storage

Course media fields exist on `Lesson` and `Course` (`videoUrl`, `pdfUrl`, `thumbnail`). The admin media signing route is available at `/api/admin/media/sign` for Cloudinary signed uploads. Keep provider secrets server-side only, then store returned secure URLs on lessons or courses.

## Admin Setup

Set:

```env
ADMIN_EMAIL="admin@casri.academy"
ADMIN_PASSWORD="ChangeThisAdminPassword123!"
```

Then run:

```bash
npm run seed:admin
```

The admin panel supports:

- Course draft creation through `/api/admin/courses`
- Course publish/archive through `/api/admin/courses/[id]`
- Lesson/video/PDF metadata attachment through `/api/admin/courses/[id]/lessons`
- Cloudinary signed upload payloads through `/api/admin/media/sign`
- Users and orders read APIs

For real staff use, connect PostgreSQL, set Cloudinary keys, seed the admin user, and sign in with the seeded credentials.

## Deployment

1. Provision PostgreSQL.
2. Set env vars in Vercel, Render, Fly.io, or your Node host.
3. Run:

```bash
npm run build
npm run prisma:migrate
npm run start
```

4. Configure Stripe webhook URL:

```text
https://your-domain.com/api/webhooks/stripe
```

5. Enable HTTPS, secure cookies, and production secrets.

## Final Testing Checklist

- Signup creates user/profile and session cookie
- Login rejects bad passwords and accepts correct credentials
- `/dashboard` redirects anonymous users
- `/admin` rejects non-admin users
- Course APIs hide unpaid lesson media
- Checkout creates order and redirects to provider
- Stripe webhook marks payment paid and enrolls user
- Progress API rejects unpaid lessons
- Contact form validates and stores messages
- Live market page returns BTC, ETH, SOL, EUR/USD, GBP/USD, USD/JPY
- Light/dark mode works
- Mobile/tablet/desktop layouts are usable

Disclaimer: Education only. Not financial advice.
